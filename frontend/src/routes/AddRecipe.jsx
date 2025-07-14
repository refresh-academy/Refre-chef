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
    if (ingredients.some(ing =>
      !ing.nome ||
      !ing.unita ||
      (ing.unita !== 'q.b.' && (!ing.grammi || Number(ing.grammi) < 1))
    )) {
      setError('Compila tutti gli ingredienti: nome e unità obbligatori, quantità solo se non è q.b.');
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
    <div className="relative min-h-screen w-full">
      {/* Overlay bianco trasparente che copre tutta la pagina */}
      <div className="absolute left-0 right-0 top-0 bottom-0 bg-white/70 pointer-events-none z-0" />
      <div className="flex justify-center bg-gray-50 min-h-screen py-8 px-2 relative z-10">
        <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden">
          {/* Immagine grande e titolo */}
          <div className="relative">
            <img
              src={form.immagine || "/fallback-food.jpg"}
              alt={form.nome || 'Anteprima immagine'}
              className="w-full h-[340px] md:h-[420px] object-cover object-center"
              onError={e => (e.target.src = '/fallback-food.jpg')}
            />
            {/* Campo per il link immagine */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-xl z-10">
              <input
                name="immagine"
                value={form.immagine}
                onChange={handleChange}
                placeholder="URL immagine*"
                className="w-full border rounded-lg px-3 py-2 bg-white/90 text-base shadow focus:outline-none focus:ring-2 focus:ring-refresh-blue"
                required
              />
            </div>
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-6 pb-2">
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Nome della ricetta*"
                className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg bg-transparent border-none outline-none w-full"
                style={{ background: 'transparent' }}
                required
              />
            </div>
          </div>
          {/* Info rapide con rating (ora tutti input) */}
          <div className="flex flex-wrap gap-4 px-6 py-4 bg-white border-b border-gray-200 items-center">
            <input name="tempo_preparazione" value={form.tempo_preparazione} onChange={handleChange} placeholder="Tempo (min)*" type="number" min={1} className="w-28 border rounded px-2 py-1 text-base font-semibold text-refresh-blue" required />
            <input name="kcal" value={form.kcal} onChange={handleChange} placeholder="Kcal*" type="number" min={1} className="w-24 border rounded px-2 py-1 text-base font-semibold text-refresh-blue" required />
            <input name="porzioni" value={form.porzioni} onChange={handleChange} placeholder="Porzioni*" type="number" min={1} className="w-24 border rounded px-2 py-1 text-base font-semibold text-refresh-blue" required />
            <input name="tipologia" value={form.tipologia} onChange={handleChange} placeholder="Tipologia*" className="w-36 border rounded px-2 py-1 text-base font-semibold text-refresh-blue" required />
            <input name="alimentazione" value={form.alimentazione} onChange={handleChange} placeholder="Alimentazione*" className="w-36 border rounded px-2 py-1 text-base font-semibold text-refresh-blue" required />
            <input name="origine" value={form.origine} onChange={handleChange} placeholder="Origine*" className="w-36 border rounded px-2 py-1 text-base font-semibold text-refresh-blue" required />
            <input name="allergeni" value={form.allergeni} onChange={handleChange} placeholder="Allergeni*" className="w-36 border rounded px-2 py-1 text-base font-semibold text-refresh-blue" required />
          </div>
          {/* Descrizione */}
          <div className="px-6 pt-6 pb-2">
            <textarea
              name="descrizione"
              value={form.descrizione}
              onChange={handleChange}
              placeholder="Breve descrizione*"
              className="w-full border rounded-lg p-3 text-base mb-2"
              rows={2}
              required
            />
          </div>
          {/* Ingredienti e preparazione ora in colonna */}
          <div className="flex flex-col gap-8 px-6 py-8 bg-white">
            {/* Ingredienti */}
            <div className="bg-gray-50 rounded-2xl shadow p-5 mb-6">
              <h2 className="text-xl font-bold text-refresh-blue mb-3">Ingredienti</h2>
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-2">
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
                    value={ing.unita === 'q.b.' ? '' : ing.grammi}
                    onChange={e => handleIngredientChange(idx, e)}
                    placeholder="Quantità"
                    className="border p-2 rounded w-20"
                    disabled={ing.unita === 'q.b.'}
                  />
                  <select
                    name="unita"
                    value={ing.unita}
                    onChange={e => handleIngredientChange(idx, e)}
                    className="border p-2 rounded w-20"
                  >
                    <option value=" g">g</option>
                    <option value=" ml">ml</option>
                    <option value="n">n</option>
                    <option value=" cuc">Cucchiaio/i</option>
                    <option value=" tz">Tazzina/e</option>
                    <option value="q.b.">q.b.</option>
                  </select>
                  <button type="button" onClick={() => handleRemoveIngredient(idx)} className="text-red-500 hover:text-red-700 text-lg font-bold">&times;</button>
                </div>
              ))}
              <button type="button" onClick={handleAddIngredient} className="bg-refresh-blue text-white font-bold px-3 py-1 rounded hover:bg-refresh-pink transition mt-2">Aggiungi ingrediente</button>
            </div>
            {/* Preparazione */}
            <div className="bg-gray-50 rounded-2xl shadow p-5">
              <h2 className="text-xl font-bold text-refresh-pink mb-3">Preparazione</h2>
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-2">
                  <textarea
                    value={step}
                    onChange={e => handleStepChange(idx, e)}
                    placeholder={`Step ${idx + 1}`}
                    className="border rounded-lg p-2 w-full"
                    rows={2}
                    required
                  />
                  <button type="button" onClick={() => handleRemoveStep(idx)} className="text-red-500 hover:text-red-700 text-lg font-bold">&times;</button>
                </div>
              ))}
              <button type="button" onClick={handleAddStep} className="bg-refresh-pink text-white font-bold px-3 py-1 rounded hover:bg-refresh-blue transition mt-2">Aggiungi step</button>
            </div>
          </div>
          {/* Error/success messages and submit */}
          <div className="px-6 pb-8 pt-2">
            {error && <div className="text-red-500 mb-2 text-center font-semibold">{error}</div>}
            {success && <div className="text-green-600 mb-2 text-center font-semibold">{success}</div>}
            <button type="submit" onClick={handleSubmit} disabled={loading} className="w-full bg-refresh-blue text-white font-bold py-3 rounded-full shadow hover:bg-refresh-pink transition text-lg mt-4 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Salvataggio...' : editMode ? 'Salva modifiche' : 'Aggiungi ricetta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRecipe; 