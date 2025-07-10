import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

const initialState = {
  nome: '',
  descrizione: '',
  tipologia: '',
  alimentazione: '',
  immagine: '',
  origine: '',
  porzioni: '',
  allergeni: '',
  tempo_preparazione: '',
  kcal: '',
};

const AddRecipe = ({ user, editMode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(initialState);
  const [ingredients, setIngredients] = useState([{ nome: '', grammi: '', unita: 'g' }]);
  const [steps, setSteps] = useState(['']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode && id && user) {
      // Carica la ricetta esistente
      const fetchRecipe = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('http://localhost:3000/api/ricette', {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' },
          });
          const data = await res.json();
          if (res.ok) {
            const ricetta = data.find(r => String(r.id) === String(id));
            if (ricetta) {
              setForm({
                nome: ricetta.nome || '',
                descrizione: ricetta.descrizione || '',
                tipologia: ricetta.tipologia || '',
                alimentazione: ricetta.alimentazione || '',
                immagine: ricetta.immagine || '',
                origine: ricetta.origine || '',
                porzioni: ricetta.porzioni || '',
                allergeni: ricetta.allergeni || '',
                tempo_preparazione: ricetta.tempo_preparazione || '',
                kcal: ricetta.kcal || '',
              });
              // Ingredienti
              const resIng = await fetch(`http://localhost:3000/api/ingredienti/${id}`);
              const dataIng = await resIng.json();
              if (Array.isArray(dataIng) && dataIng.length > 0) {
                setIngredients(dataIng.map(i => ({ nome: i.ingrediente, grammi: i.grammi, unita: i.unita || 'g' })));
              }
              // Steps
              if (Array.isArray(ricetta.steps) && ricetta.steps.length > 0) {
                setSteps(ricetta.steps);
              }
            } else {
              setError('Ricetta non trovata.');
            }
          } else {
            setError(data.error || 'Errore nel caricamento della ricetta');
          }
        } catch {
          setError('Errore di rete.');
        } finally {
          setLoading(false);
        }
      };
      fetchRecipe();
    }
    // eslint-disable-next-line
  }, [editMode, id, user]);

  if (!user) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh]"><h2 className="text-xl font-bold">Devi essere loggato per {editMode ? 'modificare' : 'aggiungere'} una ricetta.</h2></div>;
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
    setIngredients(ings => [...ings, { nome: '', grammi: '', unita: 'g' }]);
  };

  const handleRemoveIngredient = (idx) => {
    setIngredients(ings => ings.length > 1 ? ings.filter((_, i) => i !== idx) : ings);
  };

  const handleStepChange = (idx, e) => {
    const { value } = e.target;
    setSteps(steps => steps.map((s, i) => i === idx ? value : s));
  };
  const handleAddStep = () => {
    setSteps(steps => [...steps, '']);
  };
  const handleRemoveStep = (idx) => {
    setSteps(steps => steps.length > 1 ? steps.filter((_, i) => i !== idx) : steps);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    // Validazione base
    if (!form.nome || !form.descrizione || !form.tipologia || !form.alimentazione || !form.immagine || !form.origine || !form.porzioni || !form.allergeni || !form.tempo_preparazione || !form.kcal) {
      setError('Compila tutti i campi obbligatori.');
      setLoading(false);
      return;
    }
    if (Number(form.porzioni) < 1 || Number(form.tempo_preparazione) < 1 || Number(form.kcal) < 1) {
      setError('Porzioni, tempo di preparazione e kcal devono essere maggiori di zero.');
      setLoading(false);
      return;
    }
    if (ingredients.some(ing => !ing.nome || !ing.grammi || Number(ing.grammi) < 1)) {
      setError('Compila tutti gli ingredienti e i grammi (solo valori positivi).');
      setLoading(false);
      return;
    }
    if (steps.some(s => !s.trim())) {
      setError('Compila tutti i passi della preparazione.');
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token || token.length < 20) {
        setError('Sessione scaduta o non autenticata. Fai login di nuovo.');
        setLoading(false);
        return;
      }
      const sanitizedForm = {
        ...form,
        nome: form.nome.trim(),
        descrizione: form.descrizione.trim(),
        tipologia: form.tipologia.trim(),
        alimentazione: form.alimentazione.trim(),
        immagine: form.immagine.trim(),
        origine: form.origine.trim(),
        porzioni: Math.max(1, Number(form.porzioni) || 1),
        allergeni: form.allergeni.trim(),
        tempo_preparazione: Math.max(1, Number(form.tempo_preparazione) || 1),
        kcal: Math.max(1, Number(form.kcal) || 1),
      };
      const sanitizedIngredients = ingredients.map(ing => ({
        nome: (ing.nome || '').trim(),
        grammi: Math.max(1, Number(ing.grammi) || 1),
        unita: ing.unita || 'g'
      }));
      const sanitizedSteps = steps.map(s => s.trim());
      let res, data;
      if (editMode && id) {
        // UPDATE
        res = await fetch(`http://localhost:3000/api/ricette/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({
            ...sanitizedForm,
            ingredienti_grammi: sanitizedIngredients,
            steps: sanitizedSteps,
          }),
        });
        data = await res.json();
      } else {
        // CREATE
        res = await fetch('http://localhost:3000/api/aggiungiRicetta', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({
            ...sanitizedForm,
            ingredienti: sanitizedIngredients.map(ing => ing.nome).join(', '),
            ingredienti_grammi: sanitizedIngredients,
            steps: sanitizedSteps,
          }),
        });
        data = await res.json();
      }
      if (!res.ok) {
        setError(data.error || 'Errore nel salvataggio della ricetta');
      } else {
        setSuccess(editMode ? 'Ricetta aggiornata con successo!' : 'Ricetta aggiunta con successo!');
        setTimeout(() => navigate('/my-recipes'), 1200);
      }
    } catch {
      setError('Errore di rete.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] p-4 w-full">
      {/* Overlay bianco trasparente sotto la navbar (navbar height 64px) */}
      <div className="absolute left-0 right-0 top-0" style={{ height: '100%', background: 'rgba(255,255,255,0.7)', zIndex: 0, pointerEvents: 'none' }} />
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4 text-refresh-blue">{editMode ? 'Modifica ricetta' : 'Aggiungi una nuova ricetta'}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-lg bg-white rounded shadow p-6">
          <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome*" className="border p-2 rounded" required />
          <input name="descrizione" value={form.descrizione} onChange={handleChange} placeholder="Breve descrizione*" className="border p-2 rounded" required />
          <input name="tipologia" value={form.tipologia} onChange={handleChange} placeholder="Tipologia*" className="border p-2 rounded" required />
          <input name="alimentazione" value={form.alimentazione} onChange={handleChange} placeholder="Alimentazione*" className="border p-2 rounded" required />
          <input name="immagine" value={form.immagine} onChange={handleChange} placeholder="URL immagine*" className="border p-2 rounded" required />
          <input name="origine" value={form.origine} onChange={handleChange} placeholder="Origine*" className="border p-2 rounded" required />
          <input name="porzioni" value={form.porzioni} onChange={handleChange} placeholder="Porzioni*" type="number" className="border p-2 rounded" required min={1} />
          <input name="allergeni" value={form.allergeni} onChange={handleChange} placeholder="Allergeni*" className="border p-2 rounded" required />
          <input name="tempo_preparazione" value={form.tempo_preparazione} onChange={handleChange} placeholder="Tempo di preparazione (min)*" type="number" className="border p-2 rounded" required min={1} />
          <input name="kcal" value={form.kcal} onChange={handleChange} placeholder="Kcal*" type="number" className="border p-2 rounded" required min={1} />
          {/* Ingredienti dinamici */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Ingredienti</label>
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
                  placeholder="Quantità"
                  className="border p-2 rounded w-28"
                  required
                />
                <select
                  name="unita"
                  value={ing.unita}
                  onChange={e => handleIngredientChange(idx, e)}
                  className="border p-2 rounded w-20"
                  disabled={false}
                >
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="n">n</option>
                </select>
                {/* Mostra l'unità solo se diversa da 'n' nell'anteprima */}
                {ing.unita !== 'n' && <span className="text-gray-500 font-normal">{ing.unita}</span>}
                <button type="button" onClick={() => handleRemoveIngredient(idx)} className="text-red-500 hover:text-red-700 text-xl font-bold px-2">&times;</button>
              </div>
            ))}
            <button type="button" onClick={handleAddIngredient} className="bg-refresh-blue text-white px-3 py-1 rounded mt-1 w-fit hover:bg-refresh-pink transition">+ Aggiungi ingrediente</button>
          </div>
          {/* Steps dinamici */}
          <div className="flex flex-col gap-2 mt-4">
            <label className="font-semibold">Passi della preparazione*</label>
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <textarea
                  value={step}
                  onChange={e => handleStepChange(idx, e)}
                  placeholder={`Step ${idx + 1}`}
                  className="border p-2 rounded flex-1"
                  required
                />
                <button type="button" onClick={() => handleRemoveStep(idx)} className="text-red-500 hover:text-red-700 text-xl font-bold px-2">&times;</button>
              </div>
            ))}
            <button type="button" onClick={handleAddStep} className="bg-refresh-blue text-white px-3 py-1 rounded mt-1 w-fit hover:bg-refresh-pink transition">+ Aggiungi passo</button>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button type="submit" className="bg-refresh-blue text-white font-bold py-2 rounded hover:bg-refresh-pink transition" disabled={loading}>
            {loading ? (editMode ? 'Salvataggio...' : 'Aggiunta...') : (editMode ? 'Salva modifiche' : 'Aggiungi ricetta')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRecipe; 