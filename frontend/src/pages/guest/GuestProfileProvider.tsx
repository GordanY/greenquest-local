import { useTable } from 'spacetimedb/react';
import { tables } from '../../module_bindings';
import { createContext, useContext, useState } from 'react';

export interface GuestProfile {
    accessCode: string;
    nickname: string;
}

export const GuestProfileContext = createContext<GuestProfile | undefined>(undefined);

export default function GuestProfileProvider({children}: {children: React.ReactNode}) {
    // const { identity, token } = useSpacetimeDB();
    const [class_sessions] = useTable(tables.class_sessions);
    const [accessCode, setAccessCode] = useState(()=>{
        return sessionStorage.getItem('guest_access_code') || '';
    });
    const [nickname, setNickname] = useState(()=>{
        return sessionStorage.getItem('guest_nickname') || '';
    });
    const [ready, setReady] = useState(()=>{
        if(accessCode.length === 6 && nickname.length > 0){
            const now = Date.now();
            const validSession = class_sessions.filter((session)=> session.accessCode === accessCode && session.endTime > now);

            if(validSession.length > 0){
                sessionStorage.setItem('guest_access_code', accessCode);
                sessionStorage.setItem('guest_nickname', nickname);
                return true;
            }
        }
        return false;
    });

    function handleSubmit(e: any) {
        e.preventDefault();
        if(accessCode.length === 6 && nickname.length > 0 ){
            const now = Date.now();
            const validSession = class_sessions.filter((session)=> session.accessCode === accessCode && session.endTime > now);

            if(validSession.length > 0){
                sessionStorage.setItem('guest_access_code', accessCode);
                sessionStorage.setItem('guest_nickname', nickname);
                return setReady(true);
            }
        }
        alert('invalid access or nickname');
        return setReady(false);
    }

    const contextValue: GuestProfile = {
        accessCode,
        nickname,
    };

    return (
        <GuestProfileContext.Provider value={contextValue}>
            {ready && children}
            {!ready && (<form onSubmit={handleSubmit}>
                <input
                    type="text"
                    maxLength={6}
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
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
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
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
                    disabled={accessCode.length !== 6 || nickname.length === 0}
                    style={{
                        padding: '8px 16px',
                        fontSize: '16px',
                        cursor: accessCode.length === 6 ? 'pointer' : 'not-allowed',
                    }}
                >
                    Join
                </button>
            </form>)}
        </GuestProfileContext.Provider>
    );
}

export function useGuestProfileContext(){
    const context = useContext(GuestProfileContext);
      if (!context) {
        throw new Error('useGuestProfileContext must be used within GuestProfileContextProvider');
      }
      return context;
}