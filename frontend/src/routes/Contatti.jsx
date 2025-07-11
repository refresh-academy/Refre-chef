import React, { useState } from 'react';

const Contatti = () => {
  const [form, setForm] = useState({ nome: '', email: '', messaggio: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/contatti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || 'Errore nell\'invio del messaggio.');
      }
    } catch {
      setError('Errore di rete.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
          <h1 className="text-3xl font-bold text-refresh-blue mb-4">Contattaci</h1>
          <p className="text-gray-700 mb-4">
            Hai domande, suggerimenti o vuoi collaborare con noi? Siamo felici di ascoltarti!<br/>
            Puoi contattarci tramite il modulo qui sotto oppure ai seguenti recapiti:
          </p>
          <ul className="mb-4 text-gray-600">
            <li><b>Email:</b> info@refrechef.com</li>
            <li><b>Telefono:</b> +39 0123 456789</li>
            <li><b>Indirizzo:</b> Via della Cucina 42, 20100 Milano (MI)</li>
          </ul>
          <h2 className="text-xl font-semibold text-refresh-blue mt-6 mb-2">Modulo di contatto</h2>
          {sent ? (
            <div className="text-green-600 font-semibold mt-4">Messaggio inviato! Ti risponderemo al più presto.</div>
          ) : (
            <form className="flex flex-col gap-3 mt-2" onSubmit={handleSubmit}>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Il tuo nome"
                className="border p-2 rounded"
                required
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="La tua email"
                className="border p-2 rounded"
                required
              />
              <textarea
                name="messaggio"
                value={form.messaggio}
                onChange={handleChange}
                placeholder="Il tuo messaggio"
                className="border p-2 rounded"
                rows={4}
                required
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <button type="submit" className="bg-refresh-blue text-white font-bold py-2 rounded hover:bg-refresh-pink transition">
                Invia messaggio
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contatti; 