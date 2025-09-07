import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate, useLocation, Link } from 'react-router';
import { useUser } from '../contexts/UserContext.jsx';

const RECIPES_PER_PAGE = 10;

// Componente per mostrare le stelle media recensioni
function RecipeStars({ recipeId }) {
  const [media, setMedia] = useState(0);
  const [numero, setNumero] = useState(0);
  useEffect(() => {
    let active = true;
    fetch(`http://localhost:3000/api/ricette/${recipeId}/recensioni`)
      .then(res => res.json())
      .then(data => {
        if (active && data && typeof data.media !== 'undefined') {
          setMedia(Number(data.media) || 0);
          setNumero(Number(data.numero) || 0);
        }
      });
    return () => { active = false; };
  }, [recipeId]);
  return (
    <span className="flex items-center gap-1 ml-2">
      <span className="text-yellow-400 text-base animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <i key={i} className={
            i < Math.round(media)
              ? 'fa-solid fa-star drop-shadow'
              : 'fa-regular fa-star text-gray-300'
          }></i>
        ))}
      </span>
      <span className="bg-white border border-yellow-300 text-yellow-600 font-bold rounded-full px-1 py-0.5 text-xs shadow-inner ml-1">
        {media.toFixed(1)}
      </span>
      <span className="bg-refresh-blue/10 text-refresh-blue font-semibold rounded-full px-1 py-0.5 text-xs ml-1">
        {numero}
      </span>
    </span>
  );
}

function RecipeCard({ ricetta, userId, saved, handleSaveRecipe, handleRecipeClick, search, saving }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = ricetta.immagine && ricetta.immagine.trim() !== '' && !imgError ? ricetta.immagine : '/fallback-food.jpg';

  return (
    <div
      key={ricetta.id}
      className="bg-white rounded shadow p-0 flex flex-row items-stretch gap-0 min-h-[140px] sm:min-h-[180px] cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden"
      onClick={() => handleRecipeClick(ricetta.id)}
    >
      {/* Cuoricino in alto a destra della scheda */}
      {userId && (
        <span
          onClick={saving ? undefined : (e) => handleSaveRecipe(ricetta.id, e)}
          className={`absolute top-2 right-2 text-2xl cursor-pointer transition-colors z-20 ${
            saved.includes(ricetta.id)
              ? 'text-refresh-blue hover:text-refresh-pink'
              : 'text-gray-400 hover:text-refresh-blue'
          } ${saving ? 'opacity-50 pointer-events-none' : ''}`}
          title={saved.includes(ricetta.id) ? 'Rimuovi dai segnalibri' : 'Aggiungi ai segnalibri'}
          aria-label={saved.includes(ricetta.id) ? 'Rimuovi dai segnalibri' : 'Aggiungi ai segnalibri'}
        >
          <i className={`${saved.includes(ricetta.id) ? 'fa-solid' : 'fa-regular'} fa-bookmark`}></i>
        </span>
      )}
      <div className="relative w-32 h-32 min-w-[8rem] min-h-[8rem] sm:w-48 sm:h-48 sm:min-w-[12rem] sm:min-h-[12rem] flex-shrink-0 overflow-hidden">
        <img
          src={imageUrl}
          alt={ricetta.nome || 'Immagine di default'}
          className="w-full h-full object-cover object-center rounded-l"
          onError={() => setImgError(true)}
        />
      </div>
      <div className="flex-1 flex flex-col justify-between p-2 sm:p-4 min-h-[8rem] sm:min-h-[12rem] relative">
        <h2 className="text-base sm:text-xl font-bold mb-1 sm:mb-2 break-words">{highlight(ricetta.nome || '', search)}</h2>
        {ricetta.descrizione && (
          <div className="mb-1 text-gray-700 text-xs sm:text-sm break-words whitespace-pre-line">{highlight(ricetta.descrizione, search)}</div>
        )}
        {/* Info rapide con icone */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-1 sm:mb-2 text-gray-700 text-xs sm:text-base font-semibold items-center">
          <span className="flex items-center gap-1"><i className="fa-regular fa-clock" /> {ricetta.tempo_preparazione} min</span>
          <span className="flex items-center gap-1"><i className="fa-solid fa-fire" /> {ricetta.kcal} kcal</span>
          <span className="flex items-center gap-1"><i className="fa-solid fa-utensils" /> {ricetta.porzioni} porzioni</span>
          {/* Stelle media recensioni */}
          <RecipeStars recipeId={ricetta.id} />
          {/* Numero di salvataggi */}
          <span className="flex items-center gap-1 text-refresh-blue font-bold" title="Numero di salvataggi">
            <i className="fa-solid fa-bookmark" />
            {ricetta.saved_count || 0}
          </span>
        </div>
        <div className="mb-1 text-xs sm:text-base break-words whitespace-pre-line border-t border-gray-100 pt-1 sm:border-0 sm:pt-0 bg-gray-50 sm:bg-transparent">
          <span className="font-semibold">Allergeni:</span> {ricetta.allergeni && ricetta.allergeni.trim() ? highlight(ricetta.allergeni, search) : <span className="italic text-gray-400">Nessuno</span>}
        </div>
        {/* Author: mobile version (below content) */}
        {ricetta.author && (
          <div className="flex items-center gap-1 text-gray-500 text-xs bg-white/80 px-2 py-1 rounded shadow mt-2 sm:hidden">
            <i className="fa-solid fa-user" /> {ricetta.author}
          </div>
        )}
        {/* Author: desktop version (absolute bottom right) */}
        {ricetta.author && (
          ricetta.author_id ? (
            <Link
              to={`/chef/${ricetta.author_id}`}
              className="hidden sm:flex absolute bottom-2 right-4 items-center gap-1 text-gray-500 text-sm bg-white/80 px-2 py-1 rounded shadow z-10 cursor-pointer hover:text-refresh-blue hover:underline"
              onClick={e => e.stopPropagation()}
              title={`Vai al profilo di ${ricetta.author}`}
            >
              <i className="fa-solid fa-user" /> {ricetta.author}
            </Link>
          ) : (
            <span
              className="hidden sm:flex absolute bottom-2 right-4 items-center gap-1 text-gray-500 text-sm bg-white/80 px-2 py-1 rounded shadow z-10"
              title={ricetta.author}
            >
              <i className="fa-solid fa-user" /> {ricetta.author}
            </span>
          )
        )}
      </div>
    </div>
  );
}

function highlight(text, query) {
  if (!query || typeof text !== 'string') return text;
  // Rimuovi spazi da query per il match
  const normalizedQuery = query.replace(/\s+/g, '');
  // Split query in parole, ignora spazi multipli
  const words = normalizedQuery.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return text;
  // Build a regex for all words
  const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  // Evidenzia solo se la parola (senza spazi) è presente nel testo (senza spazi)
  let i = 0;
  return text.split(/(\s+)/).map((part) => {
    const partNoSpace = part.replace(/\s+/g, '');
    if (regex.test(partNoSpace)) {
      return <mark key={i++} className="bg-yellow-200 px-1 rounded">{part}</mark>;
    }
    return part;
  });
}

const Ricettario = () => {
  const [recipes, setRecipes] = useState([]);
  const [allIngredients, setAllIngredients] = useState({}); // { ricettaId: [ingredienti] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [saved, setSaved] = useState([]);
  const [popolari, setPopolari] = useState([]);
  const [savingMap, setSavingMap] = useState({}); // { [ricettaId]: true/false }
  const { maxTime, maxKcal, alimentazione, sortBy } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  // Prendo userId dal context, così la visibilità è reattiva e sicura
  const userId = user ? user.userId : null;

  // Leggi il parametro di ricerca dalla query string
  function getQueryParam(name) {
    const params = new URLSearchParams(location.search);
    return params.get(name) || '';
  }
  const [search, setSearch] = useState(getQueryParam('q'));
  const [tipologia, setTipologia] = useState(getQueryParam('tipologia'));

  // Aggiorna la ricerca se cambia la query string
  useEffect(() => {
    setSearch(getQueryParam('q'));
    setTipologia(getQueryParam('tipologia'));
  }, [location.search]);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/ricette-complete', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (res.ok) {
          setRecipes(data.recipes || []);
          // Build allIngredients map for search/filter UI
          const allIngs = {};
          (data.recipes || []).forEach(r => {
            allIngs[r.id] = (r.ingredienti || []).map(i => i.nome);
          });
          setAllIngredients(allIngs);
          setSaved(Array.isArray(data.saved) ? data.saved : []);
        } else {
          setError(data.error || 'Errore nel caricamento delle ricette');
        }
      } catch {
        setError('Errore di rete.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
    // Carica ricette popolari (più salvate)
    fetch('http://localhost:3000/api/ricette-popolari')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPopolari(data);
        }
      });
  }, [tipologia, search, maxTime, maxKcal, alimentazione]);

  // Filtro solo per maxTime, maxKcal, alimentazione (il resto è lato backend)
  const filteredRecipes = recipes
    .filter((ricetta) => {
      // Search filter
      if (search && search.trim() !== '') {
        const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
        if (words.length > 0) {
          const fields = [
            ricetta.nome,
            ricetta.descrizione,
            ricetta.tipologia,
            ricetta.preparazione,
            ricetta.preparazione_dettagliata,
            ricetta.alimentazione,
            ricetta.author,
            ...(allIngredients[ricetta.id] || [])
          ].map(f => (typeof f === 'string' ? f.toLowerCase() : String(f || '')));
          if (!words.every(word => fields.some(field => field.includes(word)))) {
            return false;
          }
        }
      }
      // Max time filter
      if (maxTime) {
        if (maxTime === '10') {
          if (!ricetta.tempo_preparazione || Number(ricetta.tempo_preparazione) < 5 || Number(ricetta.tempo_preparazione) > 10) {
            return false;
          }
        } else if (maxTime === '20') {
          if (!ricetta.tempo_preparazione || Number(ricetta.tempo_preparazione) < 10 || Number(ricetta.tempo_preparazione) > 20) {
            return false;
          }
        } else if (maxTime === '30') {
          if (!ricetta.tempo_preparazione || Number(ricetta.tempo_preparazione) < 20 || Number(ricetta.tempo_preparazione) > 30) {
            return false;
          }
        } else if (maxTime === '60') {
          if (!ricetta.tempo_preparazione || Number(ricetta.tempo_preparazione) < 30 || Number(ricetta.tempo_preparazione) > 60) {
            return false;
          }
        } else if (maxTime === 'oltre60') {
          if (!ricetta.tempo_preparazione || Number(ricetta.tempo_preparazione) <= 60) {
            return false;
          }
        }
      }
      //Max Kcal filter
      if (maxKcal) {
        if (maxKcal === '200') {
          if (!ricetta.kcal || Number(ricetta.kcal) < 0 || Number(ricetta.kcal) > 200) {
            return false;
          }
        } else if (maxKcal === '400') {
          if (!ricetta.kcal || Number(ricetta.kcal) <= 200 || Number(ricetta.kcal) > 400) {
            return false;
          }
        } else if (maxKcal === '600') {
          if (!ricetta.kcal || Number(ricetta.kcal) <= 400 || Number(ricetta.kcal) > 600) {
            return false;
          }
        } else if (maxKcal === '800') {
          if (!ricetta.kcal || Number(ricetta.kcal) <= 600 || Number(ricetta.kcal) > 800) {
            return false;
          }
        } else if (maxKcal === 'oltre800') {
          if (!ricetta.kcal || Number(ricetta.kcal) <= 800) {
            return false;
          }
        }
      }
      // Alimentazione filter
      if (alimentazione && alimentazione !== '') {
        if (!ricetta.alimentazione || ricetta.alimentazione !== alimentazione) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'salvati') {
        return (b.saved_count || 0) - (a.saved_count || 0);
      } else if (sortBy === 'nomeZA') {
        const nameA = (a.nome || '').toLowerCase();
        const nameB = (b.nome || '').toLowerCase();
        if (nameA < nameB) return 1;
        if (nameA > nameB) return -1;
        return 0;
      } else {
        const nameA = (a.nome || '').toLowerCase();
        const nameB = (b.nome || '').toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      }
    });

  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);
  const paginatedRecipes = filteredRecipes.slice((page - 1) * RECIPES_PER_PAGE, page * RECIPES_PER_PAGE);

  // Reset to page 1 when tipologia/maxTime/maxKcal/alimentazione cambiano
  useEffect(() => { setPage(1); }, [tipologia, maxTime, maxKcal, alimentazione]);

  // Funzione per salvare la ricetta
  const handleSaveRecipe = async (ricettaId, event) => {
    event.stopPropagation(); // Prevent navigation when clicking save button
    if (!userId) {
      alert('Devi essere loggato per salvare le ricette.');
      return;
    }
    setSavingMap(prev => ({ ...prev, [ricettaId]: true }));
    const token = localStorage.getItem('token');
    const updateRecipeCount = async (id) => {
      try {
        const res = await fetch(`http://localhost:3000/api/ricetta-saves/${id}`);
        const data = await res.json();
        setRecipes(prev => prev.map(r => r.id === id ? { ...r, saved_count: data.saved_count || 0 } : r));
      } catch {
        // Ignore errors updating saved_count
      }
    };
    if (saved.includes(ricettaId)) {
      try {
        const res = await fetch('http://localhost:3000/api/salvaRicetta', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ id_ricetta: ricettaId }),
        });
        if (res.ok) {
          setSaved((prev) => prev.filter(id => id !== ricettaId));
          await updateRecipeCount(ricettaId);
        } else {
          const data = await res.json();
          alert(data.error || 'Errore nella rimozione della ricetta salvata');
        }
      } catch {
        alert('Errore di rete nella rimozione.');
      } finally {
        setSavingMap(prev => ({ ...prev, [ricettaId]: false }));
      }
    } else {
      try {
        const res = await fetch('http://localhost:3000/api/salvaRicetta', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ id_ricetta: ricettaId }),
        });
        if (res.ok) {
          setSaved((prev) => [...prev, ricettaId]);
          await updateRecipeCount(ricettaId);
        } else {
          const data = await res.json();
          alert(data.error || 'Errore nel salvataggio della ricetta');
        }
      } catch {
        alert('Errore di rete nel salvataggio.');
      } finally {
        setSavingMap(prev => ({ ...prev, [ricettaId]: false }));
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
        <h1 className="text-2xl font-bold mb-4 text-refresh-blue">Tutte le Ricette</h1>
        {loading && <div>Caricamento...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!loading && !error && filteredRecipes.length === 0 && (
          <div>Nessuna ricetta trovata.</div>
        )}
        <div className="grid grid-cols-1 gap-6 w-full">
          {paginatedRecipes.map((ricetta, idx) => {
            return (
              <RecipeCard
                key={ricetta.id || idx}
                ricetta={ricetta}
                userId={userId}
                saved={saved}
                handleSaveRecipe={handleSaveRecipe}
                handleRecipeClick={handleRecipeClick}
                search={search}
                saving={!!savingMap[ricetta.id]}
              />
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
      {/* Piatti consigliati (popolari) */}
      {popolari.length > 0 && (
        <div className="w-full max-w-5xl bg-white/80 rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-refresh-pink mb-4 text-left w-full">Piatti consigliati</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {popolari.map(r => (
              <div key={r.id} className="bg-white rounded-2xl shadow flex flex-row overflow-hidden group min-h-[180px] h-full cursor-pointer hover:shadow-xl transition" onClick={() => navigate(`/ricetta/${r.id}`)}>
                <div className="relative w-48 min-w-[12rem] h-48 min-h-[12rem] flex-shrink-0 overflow-hidden">
                  <img
                    src={r.immagine && r.immagine.trim() !== '' ? r.immagine : '/fallback-food.jpg'}
                    alt={r.nome}
                    className="w-full h-full object-cover object-center rounded-l group-hover:scale-105 transition-transform duration-300"
                    onError={e => (e.target.src = '/fallback-food.jpg')}
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col min-h-[12rem] h-full justify-between">
                  <h3 className="text-lg font-bold text-refresh-blue mb-2">{r.nome}</h3>
                  <span className="mt-4 inline-block text-refresh-pink font-semibold">Scopri la ricetta &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Ricettario;