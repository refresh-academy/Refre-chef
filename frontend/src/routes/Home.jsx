import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router';

const RECIPES_PER_PAGE = 10;

function highlight(text, query) {
  if (!query || typeof text !== 'string') return text;
  // Split query into words, ignore extra spaces
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return text;
  // Build a regex for all words
  const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200 px-1 rounded">{part}</mark> : part
  );
}

const Home = (props) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [saved, setSaved] = useState([]);
  const { search } = useOutletContext();
  const navigate = useNavigate();
  // Prendo userId solo da props.user, così la visibilità è reattiva e sicura
  const userId = props.user ? props.user.userId : null;

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:3000/api/ricette');
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Errore nel caricamento delle ricette');
        } else {
          setRecipes(data);
        }
      } catch {
        setError('Errore di rete.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();

    // Recupero ricette salvate dell'utente SOLO se loggato
    if (userId) {
      fetch(`http://localhost:3000/api/ricetteSalvate/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSaved(data.map(r => r.id));
          }
        });
    }
  }, []);

  // Filter recipes by search (all words must match in any field)
  const filteredRecipes = recipes.filter((ricetta) => {
    if (!search) return true;
    const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return true;
    const fields = [
      ricetta.nome,
      ricetta.ingredienti,
      ricetta.tipologia,
      ricetta.preparazione,
      ricetta.alimentazione,
      ricetta.author,
    ].map(f => (typeof f === 'string' ? f.toLowerCase() : String(f || '')));
    return words.every(word => fields.some(field => field.includes(word)));
  });

  // Find relevant keywords for each recipe
  function getRelevantKeywords(ricetta, query) {
    if (!query) return [];
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    const fields = [
      { label: 'Nome', value: ricetta.nome },
      { label: 'Tipologia', value: ricetta.tipologia },
      { label: 'Alimentazione', value: ricetta.alimentazione },
      { label: 'Ingredienti', value: ricetta.ingredienti },
      { label: 'Preparazione', value: ricetta.preparazione },
      { label: 'Creatore', value: ricetta.author },
    ];
    return fields
      .filter(f => typeof f.value === 'string' && words.some(word => f.value.toLowerCase().includes(word)))
      .map(f => f.label);
  }

  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);
  const paginatedRecipes = filteredRecipes.slice((page - 1) * RECIPES_PER_PAGE, page * RECIPES_PER_PAGE);

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1); }, [search]);

  // Funzione per salvare la ricetta
  const handleSaveRecipe = async (ricettaId, event) => {
    event.stopPropagation(); // Prevent navigation when clicking save button
    if (!userId) {
      alert('Devi essere loggato per salvare le ricette.');
      return;
    }
    if (saved.includes(ricettaId)) {
      // Se già salvata, rimuovi
      try {
        const res = await fetch('http://localhost:3000/api/salvaRicetta', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_user: userId, id_ricetta: ricettaId }),
          credentials: 'include',
        });
        if (res.ok) {
          setSaved((prev) => prev.filter(id => id !== ricettaId));
        } else {
          const data = await res.json();
          alert(data.error || 'Errore nella rimozione della ricetta salvata');
        }
      } catch {
        alert('Errore di rete nella rimozione.');
      }
    } else {
      // Se non salvata, salva
      try {
        const res = await fetch('http://localhost:3000/api/salvaRicetta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_user: userId, id_ricetta: ricettaId }),
          credentials: 'include',
        });
        if (res.ok) {
          setSaved((prev) => [...prev, ricettaId]);
        } else {
          const data = await res.json();
          alert(data.error || 'Errore nel salvataggio della ricetta');
        }
      } catch {
        alert('Errore di rete nel salvataggio.');
      }
    }
  };

  // Funzione per navigare alla ricetta
  const handleRecipeClick = (ricettaId) => {
    navigate(`/ricetta/${ricettaId}`);
  };

  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center p-4 w-full"
      style={{
        minHeight: '60vh',
        width: '100%',
        backgroundImage: 'url(/background.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-5xl bg-white/80 rounded-lg shadow-lg p-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Tutte le Ricette</h1>
        {loading && <div>Caricamento...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!loading && !error && filteredRecipes.length === 0 && (
          <div>Nessuna ricetta trovata.</div>
        )}
        <div className="grid grid-cols-1 gap-6 w-full">
          {paginatedRecipes.map((ricetta, idx) => {
            const relevant = getRelevantKeywords(ricetta, search);
            return (
              <div 
                key={ricetta.id || idx} 
                className="bg-white rounded shadow p-4 flex flex-row items-center gap-6 min-h-[180px] cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleRecipeClick(ricetta.id)}
              >
                {ricetta.immagine && (
                  <img src={ricetta.immagine} alt={ricetta.nome} className="w-40 h-40 object-cover rounded flex-shrink-0" />
                )}
                <div className="flex flex-col flex-1">
                  <h2 className="text-xl font-bold mb-2">{highlight(ricetta.nome || '', search)}</h2>
                  {relevant.length > 0 && search && (
                    <div className="mb-2 text-xs text-gray-600">Parole chiave trovate: {relevant.join(', ')}</div>
                  )}
                  <div className="mb-1"><span className="font-semibold">Tipologia:</span> {highlight(ricetta.tipologia || '', search)}</div>
                  <div className="mb-1"><span className="font-semibold">Alimentazione:</span> {highlight(ricetta.alimentazione || '', search)}</div>
                  <div className="mb-1"><span className="font-semibold">Ingredienti:</span> {highlight(ricetta.ingredienti || '', search)}</div>
                  <div className="mb-1"><span className="font-semibold">Preparazione:</span> {highlight(ricetta.preparazione || '', search)}</div>
                  <div className="mb-1"><span className="font-semibold">Origine:</span> {highlight(ricetta.origine || '', search)}</div>
                  <div className="mb-1"><span className="font-semibold">Allergeni:</span> {highlight(ricetta.allergeni || '', search)}</div>
                  <div className="mb-1"><span className="font-semibold">Tempo di preparazione:</span> {ricetta.tempo_preparazione ? `${ricetta.tempo_preparazione} min` : ''}</div>
                  <div className="mb-1"><span className="font-semibold">Kcal:</span> {ricetta.kcal || ''}</div>
                  <div className="mb-1"><span className="font-semibold">Creatore:</span> {highlight(ricetta.author || '', search)}</div>
                  <div className="mb-1">
                    {userId ? (
                      <button
                        onClick={(e) => handleSaveRecipe(ricetta.id, e)}
                        disabled={loading}
                        className={`px-3 py-1 rounded transition ${
                          saved.includes(ricetta.id)
                            ? 'bg-green-400 text-white cursor-pointer'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {saved.includes(ricetta.id) ? 'Salvata (clicca per rimuovere)' : 'Salva ricetta'}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {totalPages > 1 && (
          <div className="flex gap-2 mt-6">
            <button
              className="px-4 py-2 rounded bg-refresh-blue text-white font-bold disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Precedente
            </button>
            <span className="px-4 py-2 font-semibold">Pagina {page} di {totalPages}</span>
            <button
              className="px-4 py-2 rounded bg-refresh-blue text-white font-bold disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Successiva
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;