import { useMemo, createContext, useState, useContext, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import '../styles/LoginPage.css';

interface ModeContextType {
    mode: string;
    setMode: (mode: string) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeContextProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth0();
    const [mode, setMode] = useState<string>('');

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            setMode('user');
        }
    }, [isAuthenticated, isLoading]);

    const setUserMode = () => {
        setMode('user');
    }

    const setGuestMode = () => {
        setMode('guest');
    }

    const value = useMemo(() => ({
        mode,
        setMode
    }), [mode]);

    return (
        <ModeContext.Provider value={value}>
            {mode === '' &&
                <div className="login-container screen-base">
                    <div className="login-card">
                        <h1 className="login-title">綠野尋蹤</h1>
                        <p className="login-subtitle">Green Quest</p>
                        <div className="login-buttons">
                            <button className="login-btn login-btn-user" onClick={setUserMode}>
                                登入
                            </button>
                            <button className="login-btn login-btn-guest" onClick={setGuestMode}>
                                訪客
                            </button>
                        </div>
                    </div>
                </div>
            }
            {mode !== '' && children}
        </ModeContext.Provider>
    );
}

export function useModeContext(){
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useModeContext must be used within ModeContextProvider');
  }
  return context;
}