import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';

/**
 * ProtectedRoute component for route protection.
 *
 * Props:
 * - user: the current user object (null if not logged in)
 * - cookieConsent: boolean or null
 * - message: message to show if blocked (optional)
 * - requireAuth: boolean (default true)
 * - requireConsent: boolean (default true)
 * - showCookieBlock: function to show cookie consent banner or alert
 * - children: the protected component(s)
 * - redirectTo: path to redirect if not authenticated (default: '/login')
 */
const ProtectedRoute = ({
  user,
  cookieConsent,
  message,
  requireAuth = true,
  requireConsent = true,
  showCookieBlock,
  children,
  redirectTo = '/login',
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (requireConsent && cookieConsent === false) {
      if (showCookieBlock) showCookieBlock(message || 'Devi accettare i cookie tecnici per usare questa funzionalità.');
    }
  }, [cookieConsent, requireConsent, showCookieBlock, message]);

  if (requireConsent && cookieConsent === false) {
    // Block access if no cookie consent
    return null;
  }

  if (requireAuth && !user) {
    // Redirect to login if not authenticated
    navigate(redirectTo, { replace: true });
    return null;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute; 