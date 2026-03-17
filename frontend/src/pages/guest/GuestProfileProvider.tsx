import { useTable } from 'spacetimedb/react';
import { tables } from '../../module_bindings';
import { createContext, useContext, useState } from 'react';
import { useModeContext } from '../../context/ModeContext';
import './GuestProfileForm.css';

export interface GuestProfile {
    accessCode: string;
    nickname: string;
}

export const GuestProfileContext = createContext<GuestProfile | undefined>(undefined);

export default function GuestProfileProvider({children}: {children: React.ReactNode}) {
    // const { identity, token } = useSpacetimeDB();
    const { setMode } = useModeContext();
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
        alert('課程碼或暱稱無效。請檢查並重試。');
        return setReady(false);
    }

    const contextValue: GuestProfile = {
        accessCode,
        nickname,
    };

    return (
        <GuestProfileContext.Provider value={contextValue}>
            {ready && children}
            {!ready && (
                <div className="guest-profile-container screen-base">
                    <div className="guest-profile-card">
                        <button
                            className="back-button"
                            onClick={() => setMode('')}
                            type="button"
                            aria-label="返回"
                        >
                            ←
                        </button>
                        <h1 className="guest-profile-title">加入課程</h1>
                        <p className="guest-profile-subtitle">請輸入課程碼和暱稱</p>
                        <form className="guest-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">課程碼</label>
                                <input
                                    className="form-input access-code-input"
                                    type="text"
                                    maxLength={6}
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                                    placeholder="A1B2C3"
                                />
                                <span className="form-hint">6 個大寫字母或數字</span>
                            </div>
                            <div className="form-group">
                                <label className="form-label">暱稱</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    maxLength={20}
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="輸入你的暱稱"
                                />
                                <span className="form-hint">最多 20 個字符</span>
                            </div>
                            <button
                                className="submit-btn"
                                type="submit"
                                disabled={accessCode.length !== 6 || nickname.length === 0}
                            >
                                加入課程
                            </button>
                        </form>
                    </div>
                </div>
            )}
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