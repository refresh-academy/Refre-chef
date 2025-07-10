import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem',
      background: '#f8f8f8',
      borderTop: '1px solid #e0e0e0',
      position: 'fixed',
      left: 0,
      bottom: 0,
      width: '100%',
      zIndex: 1000
    }}>
      <a href="/chi-siamo" style={{ marginRight: '1rem', textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
        Chi siamo
      </a>
      <img src="/logorefreChef.png" alt="RefreChef Logo" style={{ height: '40px' }} />
    </footer>
  );
};

export default Footer; 