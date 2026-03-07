import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { ModeContextProvider } from './context/ModeContext';
import { LoginContextProvider } from './context/LoginContext';
import { HomePage } from './pages/HomePage';



createRoot(document.getElementById('root')!).render(
  
    <Auth0Provider
      domain="dev-760sns83i8q6y6jp.us.auth0.com"
      clientId="XDFh0dE5aDgiVPXZaICxnU8uzgzmYz9z"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <ModeContextProvider>
        <LoginContextProvider>
          <HomePage/>
        </LoginContextProvider>
      </ModeContextProvider> 
    </Auth0Provider>
  
);
