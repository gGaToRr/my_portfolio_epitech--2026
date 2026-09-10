import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { verifyAdminAuth } from '../../services/api';

export default function AdminProtectedRoute({ children, fallbackPath = '/panelAdmin' }) {
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;

        async function checkAuth() {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                if (isMounted) {
                    setIsAuthenticated(false);
                    setIsChecking(false);
                }
                return;
            }

            try {
                const isValid = await verifyAdminAuth();
                if (isMounted) {
                    setIsAuthenticated(isValid);
                }
            } catch {
                if (isMounted) {
                    setIsAuthenticated(false);
                }
            } finally {
                if (isMounted) {
                    setIsChecking(false);
                }
            }
        }

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    if (isChecking) {
        return (
            <div className="page-loader" aria-live="polite">
                Vérification des autorisations administrateur…
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    }

    return children;
}
