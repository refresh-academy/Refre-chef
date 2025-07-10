import { useState } from 'react';
import { useNavigate } from 'react-router';

const Registration = () => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registrazione fallita');
      } else {
        setSuccess('Registrazione avvenuta con successo! Benvenuto, ' + nickname);
        navigate('/ricette');
      }
    } catch (err) {
      setError('Errore di rete.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <button
        className="absolute top-4 right-4 z-20 text-3xl text-refresh-pink hover:text-refresh-blue font-bold transition"
        onClick={() => navigate('/')}
        aria-label="Chiudi"
        type="button"
      >
        ×
      </button>
      {/* Overlay bianco trasparente sotto la navbar (navbar height 64px) */}
      <div className="absolute left-0 right-0" style={{ top: 0, height: 'calc(100vh - 64px)', background: 'rgba(255,255,255,0.7)', zIndex: 0, pointerEvents: 'none' }} />
      <div className="relative z-10 w-full flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <h1 className="text-2xl font-bold mb-4 text-refresh-blue">Registrazione</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80 p-6 bg-white rounded shadow">
          <input
            type="text"
            placeholder="Nickname"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-refresh-blue text-white font-bold py-2 rounded hover:bg-refresh-pink transition"
            disabled={loading}
          >
            {loading ? 'Caricamento...' : 'Registrati'}
          </button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default Registration; 