import { useState, useEffect } from 'react';

const CookieConsentBanner = ({ onConsentChange, forceShow }) => {
  const [visible, setVisible] = useState(forceShow);
  
  useEffect(() => { 
    setVisible(forceShow); 
  }, [forceShow]);
  
  if (!visible) return null;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      zIndex: 1000,
      background: 'rgba(255,255,255,0.98)',
      borderTop: '1px solid #e0e0e0',
      boxShadow: '0 -2px 12px rgba(0,0,0,0.07)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontSize: '1rem',
      color: '#333',
    }}>
      <span style={{ marginRight: '1.5rem' }}>
        Questo sito utilizza solo cookie tecnici necessari al funzionamento. Nessun cookie di profilazione viene utilizzato.
      </span>
      <button
        onClick={() => {
          localStorage.setItem('cookieConsent', 'true');
          setVisible(false);
          if (onConsentChange) onConsentChange(true);
        }}
        style={{
          background: 'linear-gradient(90deg, #3b82f6 0%, #ec4899 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.5rem 1.5rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontSize: '1rem',
        }}
        aria-label="Accetta cookie tecnici"
      >
        OK
      </button>
    </div>
  );
};

export default CookieConsentBanner;