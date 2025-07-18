import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';

export default function ResetPassword() {
  const location = useLocation();
  const [token, setToken] = useState(location.state?.token || '');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password aggiornata con successo!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Errore nel reset della password.');
      }
    } catch {
      setError('Errore di rete.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-refresh-blue">Imposta nuova password</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Token di reset"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Nuova password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <button type="submit" className="bg-refresh-blue text-white font-bold py-2 rounded hover:bg-refresh-pink transition" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Imposta password'}
          </button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {message && <div className="text-green-600 text-sm">{message}</div>}
        </form>
        <div className="mt-4 text-xs">
          <Link to="/login" className="text-refresh-blue underline">Torna al login</Link>
        </div>
      </div>
    </div>
  );
} 