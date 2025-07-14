import React from 'react';

const socialLinks = [
  { href: 'https://www.instagram.com/', label: 'Instagram', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#E1306C"/><path d="M12 7.2A4.8 4.8 0 1 0 12 16.8A4.8 4.8 0 1 0 12 7.2Z" fill="#fff"/><circle cx="17.2" cy="6.8" r="1.2" fill="#fff"/></svg>
  ) },
  { href: 'https://www.facebook.com/', label: 'Facebook', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#1877F3"/><path d="M15.5 8.5H14V7.5C14 7.22 14.22 7 14.5 7H15.5V5H14.5C13.12 5 12 6.12 12 7.5V8.5H11V10.5H12V19H14V10.5H15.09L15.5 8.5Z" fill="#fff"/></svg>
  ) },
  { href: 'https://www.youtube.com/', label: 'YouTube', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#FF0000"/><path d="M10 9V15L16 12L10 9Z" fill="#fff"/></svg>
  ) },
  { href: 'https://www.pinterest.com/', label: 'Pinterest', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#E60023"/><path d="M12 7.5A4.5 4.5 0 1 0 12 16.5A4.5 4.5 0 1 0 12 7.5Z" fill="#fff"/><path d="M12 10.5V13.5" stroke="#E60023" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="14.5" r="0.5" fill="#E60023"/></svg>
  ) },
];

const navLinks = [
  { href: '/chi-siamo', label: 'Chi siamo' },
  { href: '/ricette', label: 'Ricette' },
  { href: '/contatti', label: 'Contatti' },
  { href: '/privacy', label: 'Privacy' },
];

const Footer = () => {
  return (
    <footer style={{
      background: '#f8f8f8',
      borderTop: '1px solid #e0e0e0',
      padding: '2rem 0 0.5rem 0',
      fontFamily: 'inherit',
      width: '100%',
    }}>
      <style>{`
        @media (max-width: 700px) {
          .footer-main {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 2rem !important;
            padding: 0 1rem !important;
          }
          .footer-nav {
            flex-direction: column !important;
            gap: 0.75rem !important;
            align-items: flex-start !important;
          }
          .footer-logo {
            margin-bottom: 0.5rem !important;
          }
          .footer-social {
            margin-top: 1rem !important;
          }
        }
        @media (max-width: 400px) {
          .footer-main {
            padding: 0 0.25rem !important;
          }
          .footer-logo span {
            font-size: 1rem !important;
          }
        }
      `}</style>
      <div className="footer-main" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
        gap: '1.5rem',
        width: '100%',
      }}>
        {/* Logo */}
        <a href="/" className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <img src="/logorefreChef.png" alt="RefreChef Logo" style={{ height: '48px', maxWidth: '100%' }} />
          <span style={{ fontWeight: 'bold', color: '#2d3748', fontSize: '1.2rem' }}>RefreChef</span>
        </a>
        {/* Navigation */}
        <nav className="footer-nav" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {navLinks.map(link => (
            <a key={link.href} href={link.href} style={{ color: '#333', textDecoration: 'none', fontWeight: 500, fontSize: '1rem', padding: '0.25rem 0' }}>{link.label}</a>
          ))}
        </nav>
        {/* Social icons */}
        <div className="footer-social" style={{ display: 'flex', gap: '1rem' }}>
          {socialLinks.map(link => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label} style={{ display: 'flex', alignItems: 'center', padding: '0.25rem' }}>
              {link.icon}
            </a>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'center', color: '#888', fontSize: '0.95rem', marginTop: '1.5rem', paddingBottom: '0.5rem', width: '100%' }}>
        © {new Date().getFullYear()} RefreChef. Tutti i diritti riservati.
      </div>
    </footer>
  );
};

export default Footer; 