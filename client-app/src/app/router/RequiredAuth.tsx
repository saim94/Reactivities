import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useStore } from "../stores/Store";

export default function RequiredAuth() {
    const { userStore: { isLoggedIn } } = useStore();
    const location = useLocation();

    if (!isLoggedIn) {
        return <Navigate to='/' state={{ from: location }} />
    }

    return <Outlet />
}