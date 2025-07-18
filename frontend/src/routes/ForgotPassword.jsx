import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
// import Footer from '../Footer.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setToken('');
    setLoading(true);
    try {
      const res = await fetch('/api/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Controlla la tua email per il link di reset. (Token per test: sotto)');
        setToken(data.token);
      } else {
        setError(data.error || 'Errore nella richiesta di reset.');
      }
    } catch {
      setError('Errore di rete.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Overlay bianco trasparente sotto la navbar (navbar height 64px) */}
      <div className="absolute left-0 right-0" style={{ top: 0, height: 'calc(100vh - 64px)', background: 'rgba(255,255,255,0.7)', zIndex: 0, pointerEvents: 'none' }} />
      <div className="relative z-10 w-full flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="w-full max-w-md bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-refresh-blue">Recupera password</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="La tua email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <button type="submit" className="bg-refresh-blue text-white font-bold py-2 rounded hover:bg-refresh-pink transition" disabled={loading}>
              {loading ? 'Invio...' : 'Invia link di reset'}
            </button>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {message && <div className="text-green-600 text-sm">{message}</div>}
            {token && (
              <div className="mt-2 text-xs text-gray-500">
                <div><b>Token per test:</b></div>
                <div className="break-all bg-gray-100 p-2 rounded">{token}</div>
                <Link to="/reset-password" state={{ token }} className="text-refresh-blue underline mt-2 inline-block">Vai al reset password</Link>
              </div>
            )}
          </form>
          <div className="mt-4 text-xs">
            <Link to="/login" className="text-refresh-blue underline">Torna al login</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 