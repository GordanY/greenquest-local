import { useModeContext } from "../context/ModeContext";
import GuestHome from "./guest/GuestHome";
import UserHome from "./user/UserHome";

export function HomePage(){
    const {mode}= useModeContext();
    return (
        <div>
            {
                mode === 'user' &&
                <UserHome/>
            }
            {
                mode === 'guest' &&
                <GuestHome/>
            }

        </div>
    );
}