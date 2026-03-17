import { useModeContext } from "../context/ModeContext";
import GuestHome from "./guest/GuestHome";
import GuestProfileProvider from "./guest/GuestProfileProvider";
import UserHome from "./user/UserHome";

export function HomePage(){
    const {mode}= useModeContext();
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            {
                mode === 'user' &&
                <UserHome/>
            }
            {
                mode === 'guest' &&
                <GuestProfileProvider>
                    <GuestHome/>
                </GuestProfileProvider>
            }

        </div>
    );
}