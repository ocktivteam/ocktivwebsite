// src/hooks/useSessionCheck.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSessionCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkSession = () => {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        // No valid session, redirect to login
        navigate('/login', { replace: true });
      }
    };

    // Check immediately
    checkSession();

    // Also check when page becomes visible (handles back button)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check on focus (another way to catch back button)
    window.addEventListener('focus', checkSession);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkSession);
    };
  }, [navigate]);
};