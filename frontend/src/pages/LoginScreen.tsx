import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTable } from 'spacetimedb/react';
import { tables } from '../module_bindings';

export default function LoginScreen() {
  const { loginWithRedirect, getIdTokenClaims } = useAuth0();
  const [access_code_input, setAccessCodeInput] = useState('');
  const [nickname_input, setNicknameInput] = useState('');
  const { setUserAuthToken, setGuestAccessCode, setGuestNickname } = useAppContext();
  const [class_sessions] = useTable(tables.class_sessions);

  // complete the authentication flow
  useEffect(()=>{
    getIdTokenClaims()
      .then(claims =>{
        const token = claims?.__raw;
        if(token){
          setUserAuthToken(token);
        }
      })
  })  

  const handleUserLogin = () => {
    loginWithRedirect();
  };

  const handleGuestLogin = (e: any) => {
    e.preventDefault();
    if (access_code_input.length !== 6) {
      return alert(`access code must be 6 digits`);
    }
    if (nickname_input.length === 0) {
      return alert(`nickname undefined`);
    }
    const now = Date.now();
    const validSession = class_sessions.filter(
      (session) => session.accessCode === access_code_input && session.endTime > now
    );
    
    if (validSession.length > 0) {
      console.log(`joined class session ${validSession[0].accessCode}`)
      sessionStorage.setItem('guest_access_code', access_code_input);
      sessionStorage.setItem('guest_nickname', nickname_input);
      setGuestAccessCode(access_code_input);
      setGuestNickname(nickname_input);
    } else {
      alert('Invalid or expired access code');
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Welcome to GreenQuest</h1>

      <div style={{ marginBottom: '40px' }}>
        <button
          onClick={handleUserLogin}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Log In with Auth0
        </button>
      </div>

      <div>
        <h2>Or Join with Access Code</h2>
        <form onSubmit={handleGuestLogin}>
          <input
            type="text"
            maxLength={6}
            value={access_code_input}
            onChange={(e) => setAccessCodeInput(e.target.value.toUpperCase())}
            placeholder="Enter 6-digit code"
            style={{
              padding: '8px',
              fontSize: '16px',
              marginRight: '10px',
              width: '200px',
            }}
          />
          <input
            type="text"
            maxLength={6}
            value={nickname_input}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder="Enter nickname"
            style={{
              padding: '8px',
              fontSize: '16px',
              marginRight: '10px',
              width: '200px',
            }}
          />
          <button
            type="submit"
            disabled={access_code_input.length !== 6 || nickname_input.length === 0}
            style={{
              padding: '8px 16px',
              fontSize: '16px',
              cursor: access_code_input.length === 6 ? 'pointer' : 'not-allowed',
            }}
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
