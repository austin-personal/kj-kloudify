import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkauth } from "../../services/users";
import "./ProtectedRoute.css";

interface ProtectedRouteProps {
    children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await checkauth();
                setIsAuthenticated(response);
            } catch (error) {
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, [])

    if (isAuthenticated === null) {
        // 인증 상태 확인 중 로딩 표시
        return (
            <div className="protected-loading-th">
                <div className="spinner"></div>   
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute