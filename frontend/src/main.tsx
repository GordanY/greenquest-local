import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { ModeContextProvider } from './context/ModeContext';
import { LoginContextProvider } from './context/LoginContext';
import { HomePage } from './pages/HomePage';
import { AUTH_DOMAIN, AUTH_CLIENT_ID } from './configs/configs';
import './styles/ScreenBase.css';

createRoot(document.getElementById('root')!).render(
  
    <Auth0Provider
      domain={AUTH_DOMAIN}
      clientId={AUTH_CLIENT_ID}
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
