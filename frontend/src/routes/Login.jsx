import { useState } from 'react';
import { useNavigate } from 'react-router';

const Login = ({ setUser }) => {
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
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        setSuccess('Login successful! Benvenuto, ' + data.nickname);
        if (setUser) setUser({ userId: data.userId, nickname: data.nickname });
        localStorage.setItem('userId', data.userId);
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
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
      {/* Overlay bianco trasparente sotto la navbar (navbar height 64px) */}
      <div className="absolute left-0 right-0" style={{ top: 0, height: 'calc(100vh - 64px)', background: 'rgba(255,255,255,0.7)', zIndex: 0, pointerEvents: 'none' }} />
      <div className="relative z-10 w-full flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <h1 className="text-2xl font-bold mb-4 text-refresh-blue">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80 p-6 bg-white rounded shadow">
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
            {loading ? 'Caricamento...' : 'Login'}
          </button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default Login; 