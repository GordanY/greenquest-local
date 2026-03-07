import { useSpacetimeDB } from 'spacetimedb/react';

export default function UserHome() {
  const { identity, token } = useSpacetimeDB();
  
  return (
    <div style={{ padding: '40px' }}>
      <h1>User Home</h1>
      <p>Logged in as: {identity?.toHexString().substring(0, 16)}...</p>
      <p>User token: {token?.substring(0, 16)}...</p>
      <p>This is a placeholder for the user home page.</p>
    </div>
  );
}
