import { useMemo, createContext, useState, useContext } from "react";

interface ModeContextType {
    mode: string;
    setMode: (mode: string) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeContextProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<string>('');

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
                <div>
                    <button onClick={setUserMode}>登入</button>
                    <button onClick={setGuestMode}>訪客</button>
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