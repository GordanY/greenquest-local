import { useState, useEffect } from "react";
import { useModeContext } from "./ModeContext";
import { useAuth0 } from "@auth0/auth0-react";
import { SpacetimeDBProvider } from "spacetimedb/react";
import { DbConnectionBuilder, DbConnection } from "../module_bindings";
import { HOST, DB_NAME } from "../configs/configs";

// interface LoginContextType {
//   // Context intentionally empty - used as provider for SpacetimeDB connection
// }

// const LoginContext = createContext<LoginContextType | undefined>(undefined);


function getConnectionBuilder(mode: string, authToken: string | undefined, persistFunc: (token: string) => void): DbConnectionBuilder | undefined {
  if (mode === 'user' && authToken === undefined) {
    return undefined;
  }
  return DbConnection.builder()
    .withUri(HOST)
    .withDatabaseName(DB_NAME)
    .withToken(authToken)
    .onDisconnect(() => {})
    .onConnectError(() => {})
    .onConnect((_, __, token) => {
      if (mode === 'guest' && !authToken) {
        persistFunc(token);
      }
    });
}

export function LoginContextProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useModeContext();
  const { isAuthenticated, loginWithRedirect, getIdTokenClaims } = useAuth0();

  const [userAuthToken, setUserAuthToken] = useState<string | undefined>(() => {
    return sessionStorage.getItem('user_auth_token') || undefined;
  });

  const [guestAuthToken, setGuestAuthToken] = useState<string | undefined>(() => {
    return sessionStorage.getItem('guest_auth_token') || undefined;
  });

  // Start login flow if in user mode and not authenticated
  if (mode === 'user' && !isAuthenticated) {
    loginWithRedirect();
  }

  // Collect auth_token from Auth0 after first click/authentication
  useEffect(() => {
    if (mode === 'user' && !userAuthToken) {
      getIdTokenClaims().then((claims) => {
        if (claims?.__raw) {
          sessionStorage.setItem('user_auth_token', claims.__raw);
          setUserAuthToken(claims.__raw);
        }
      });
    }
  }, [mode, isAuthenticated, getIdTokenClaims]);

  const connectionBuilder = getConnectionBuilder(
    mode,
    mode === 'user' ? userAuthToken : guestAuthToken,
    (token) => {
      sessionStorage.setItem('guest_auth_token', token);
      setGuestAuthToken(token);
    }
  );

  if (!connectionBuilder) {
    return <div>Loading</div>;
  }

  return (
    <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
      {children}
    </SpacetimeDBProvider>
  );
}

// export function useLoginContext() {
//   const context = useContext(LoginContext);
//   if (!context) {
//     throw new Error('useLoginContext must be used within LoginContextProvider');
//   }
//   return context;
// }
