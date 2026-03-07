import { useSpacetimeDB } from 'spacetimedb/react';

export default function GuestHome() {
  const { identity, token } = useSpacetimeDB();

  return (
    <div style={{ padding: '40px' }}>
      <h1>Guest Home</h1>
      <p>Guest identity: {identity?.toHexString().substring(0, 16)}...</p>
      <p>Guest token: {token?.substring(0, 16)}...</p>
      <p>This is a placeholder for the guest home page.</p>
    </div>
  );
}
