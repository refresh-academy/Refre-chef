import { useState } from 'react';
import { useNavigate } from 'react-router';

const initialState = {
  nome: '',
  descrizione: '',
  tipologia: '',
  alimentazione: '',
  immagine: '',
  preparazione: '',
  preparazione_dettagliata: '',
  origine: '',
  porzioni: '',
  allergeni: '',
  tempo_preparazione: '',
  kcal: '',
};

const AddRecipe = ({ user }) => {
  const [form, setForm] = useState(initialState);
  const [ingredients, setIngredients] = useState([{ nome: '', grammi: '' }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh]"><h2 className="text-xl font-bold">Devi essere loggato per aggiungere una ricetta.</h2></div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleIngredientChange = (idx, e) => {
    const { name, value } = e.target;
    setIngredients(ings => ings.map((ing, i) => i === idx ? { ...ing, [name]: value } : ing));
  };

  const handleAddIngredient = () => {
    setIngredients(ings => [...ings, { nome: '', grammi: '' }]);
  };

  const handleRemoveIngredient = (idx) => {
    setIngredients(ings => ings.length > 1 ? ings.filter((_, i) => i !== idx) : ings);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    // Validazione base
    if (!form.nome || !form.descrizione || !form.tipologia || !form.alimentazione || !form.immagine || !form.preparazione || !form.preparazione_dettagliata || !form.origine || !form.porzioni || !form.allergeni || !form.tempo_preparazione || !form.kcal) {
      setError('Compila tutti i campi obbligatori.');
      setLoading(false);
      return;
    }
    if (ingredients.some(ing => !ing.nome || !ing.grammi)) {
      setError('Compila tutti gli ingredienti e i grammi.');
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const sanitizedForm = {
        ...form,
        nome: form.nome.trim(),
        descrizione: form.descrizione.trim(),
        tipologia: form.tipologia.trim(),
        alimentazione: form.alimentazione.trim(),
        immagine: form.immagine.trim(),
        preparazione: form.preparazione.trim(),
        preparazione_dettagliata: form.preparazione_dettagliata.trim(),
        origine: form.origine.trim(),
        porzioni: Number(form.porzioni) || 1,
        allergeni: form.allergeni.trim(),
        tempo_preparazione: Number(form.tempo_preparazione) || 1,
        kcal: Number(form.kcal) || 1,
      };
      const sanitizedIngredients = ingredients.map(ing => ({
        nome: (ing.nome || '').trim(),
        grammi: Number(ing.grammi) > 0 ? Number(ing.grammi) : 1
      }));
      const res = await fetch('http://localhost:3000/api/aggiungiRicetta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          ...sanitizedForm,
          ingredienti: sanitizedIngredients.map(ing => ing.nome).join(', '),
          ingredienti_grammi: sanitizedIngredients,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Errore nel salvataggio della ricetta');
      } else {
        setSuccess('Ricetta aggiunta con successo!');
        setTimeout(() => navigate('/ricette'), 1200);
      }
    } catch {
      setError('Errore di rete.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <h1 className="text-2xl font-bold mb-4">Aggiungi una nuova ricetta</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-lg bg-white rounded shadow p-6">
        <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome*" className="border p-2 rounded" required />
        <input name="descrizione" value={form.descrizione} onChange={handleChange} placeholder="Breve descrizione*" className="border p-2 rounded" required />
        <input name="tipologia" value={form.tipologia} onChange={handleChange} placeholder="Tipologia*" className="border p-2 rounded" required />
        <input name="alimentazione" value={form.alimentazione} onChange={handleChange} placeholder="Alimentazione*" className="border p-2 rounded" required />
        <input name="immagine" value={form.immagine} onChange={handleChange} placeholder="URL immagine*" className="border p-2 rounded" required />
        <textarea name="preparazione" value={form.preparazione} onChange={handleChange} placeholder="Preparazione*" className="border p-2 rounded" required />
        <textarea name="preparazione_dettagliata" value={form.preparazione_dettagliata} onChange={handleChange} placeholder="Preparazione dettagliata*" className="border p-2 rounded" required />
        <input name="origine" value={form.origine} onChange={handleChange} placeholder="Origine*" className="border p-2 rounded" required />
        <input name="porzioni" value={form.porzioni} onChange={handleChange} placeholder="Porzioni*" type="number" className="border p-2 rounded" required />
        <input name="allergeni" value={form.allergeni} onChange={handleChange} placeholder="Allergeni*" className="border p-2 rounded" required />
        <input name="tempo_preparazione" value={form.tempo_preparazione} onChange={handleChange} placeholder="Tempo di preparazione (min)*" type="number" className="border p-2 rounded" required />
        <input name="kcal" value={form.kcal} onChange={handleChange} placeholder="Kcal*" type="number" className="border p-2 rounded" required />
        {/* Ingredienti dinamici */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Ingredienti* (nome e grammi)</label>
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                name="nome"
                value={ing.nome}
                onChange={e => handleIngredientChange(idx, e)}
                placeholder="Nome ingrediente"
                className="border p-2 rounded flex-1"
                required
              />
              <input
                name="grammi"
                type="number"
                min="1"
                value={ing.grammi}
                onChange={e => handleIngredientChange(idx, e)}
                placeholder="Grammi"
                className="border p-2 rounded w-28"
                required
              />
              <button type="button" onClick={() => handleRemoveIngredient(idx)} className="text-red-500 hover:text-red-700 text-xl font-bold px-2">&times;</button>
            </div>
          ))}
          <button type="button" onClick={handleAddIngredient} className="bg-refresh-blue text-white px-3 py-1 rounded mt-1 w-fit hover:bg-refresh-pink transition">+ Aggiungi ingrediente</button>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button type="submit" className="bg-refresh-blue text-white font-bold py-2 rounded hover:bg-refresh-pink transition" disabled={loading}>
          {loading ? 'Salvataggio...' : 'Aggiungi ricetta'}
        </button>
      </form>
    </div>
  );
};

export default AddRecipe; 