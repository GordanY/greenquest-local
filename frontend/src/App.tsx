import { SpacetimeDBProvider } from 'spacetimedb/react';
import { useAppContext } from './context/AppContext';
import LoginScreen from './pages/LoginScreen';
import UserHome from './pages/user/UserHome';
import GuestHome from './pages/guest/GuestHome';

export default function App() {
  const { readyUserHome, readyGuestHome, connectionBuilder, currentConnReady } = useAppContext();

  return (
    <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
      {currentConnReady && readyUserHome && <UserHome/>}
      {currentConnReady && readyGuestHome && <GuestHome/>}
      {(!readyUserHome && !readyGuestHome) && <LoginScreen/>}
    </SpacetimeDBProvider>
  );
}
