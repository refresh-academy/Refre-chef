import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router';

const RECIPES_PER_PAGE = 10;

function RecipeCard({ ricetta, userId, saved, handleSaveRecipe, handleRecipeClick, search }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = ricetta.immagine && ricetta.immagine.trim() !== '' && !imgError ? ricetta.immagine : '/fallback-food.jpg';

  return (
    <div
      key={ricetta.id}
      className="bg-white rounded shadow p-4 flex flex-row items-center gap-6 min-h-[180px] cursor-pointer hover:shadow-lg transition-shadow relative"
      onClick={() => handleRecipeClick(ricetta.id)}
    >
      {/* Cuoricino in alto a destra della scheda */}
      {userId && (
        <span
          onClick={(e) => handleSaveRecipe(ricetta.id, e)}
          className={`absolute top-2 right-2 text-2xl cursor-pointer transition-colors z-20 ${
            saved.includes(ricetta.id)
              ? 'text-refresh-blue hover:text-refresh-pink'
              : 'text-gray-400 hover:text-refresh-blue'
          }`}
          title={saved.includes(ricetta.id) ? 'Rimuovi dai segnalibri' : 'Aggiungi ai segnalibri'}
          aria-label={saved.includes(ricetta.id) ? 'Rimuovi dai segnalibri' : 'Aggiungi ai segnalibri'}
        >
          <i className={`${saved.includes(ricetta.id) ? 'fa-solid' : 'fa-regular'} fa-bookmark`}></i>
        </span>
      )}
      <div className="relative w-40 h-40 flex-shrink-0">
        <img
          src={imageUrl}
          alt={ricetta.nome || 'Immagine di default'}
          className="w-full h-full object-cover rounded"
          onError={() => setImgError(true)}
        />
      </div>
      <div className="flex flex-col flex-1">
        <h2 className="text-xl font-bold mb-2">{highlight(ricetta.nome || '', search)}</h2>
        {ricetta.descrizione && (
          <div className="mb-1 text-gray-700 text-sm">{highlight(ricetta.descrizione, search)}</div>
        )}
        {/* Info rapide con icone */}
        <div className="flex flex-wrap gap-3 mb-2 text-gray-700 text-base font-semibold items-center">
          <span className="flex items-center gap-1"><i className="fa-regular fa-clock" /> {ricetta.tempo_preparazione} min</span>
          <span className="flex items-center gap-1"><i className="fa-solid fa-fire" /> {ricetta.kcal} kcal</span>
          <span className="flex items-center gap-1"><i className="fa-solid fa-utensils" /> {ricetta.porzioni} porzioni</span>
          {ricetta.author && <span className="flex items-center gap-1"><i className="fa-solid fa-user" /> {ricetta.author}</span>}
        </div>
        <div className="mb-1"><span className="font-semibold">Ingredienti:</span> {highlight(ricetta.ingredienti || '', search)}</div>
        <div className="mb-1"><span className="font-semibold">Allergeni:</span> {highlight(ricetta.allergeni || '', search)}</div>
      </div>
    </div>
  );
}

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
  const { maxTime, maxKcal, alimentazione } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  // Prendo userId solo da props.user, così la visibilità è reattiva e sicura
  const userId = props.user ? props.user.userId : null;

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
        let url = 'http://localhost:3000/api/ricette';
        const params = [];
        if (tipologia && tipologia !== '') {
          params.push(`tipologia=${encodeURIComponent(tipologia)}`);
        }
        if (maxTime && !isNaN(Number(maxTime))) {
          params.push(`maxTime=${encodeURIComponent(maxTime)}`);
        }
        if (maxKcal && !isNaN(Number(maxKcal))) {
          params.push(`maxKcal=${encodeURIComponent(maxKcal)}`);
        }
        if (alimentazione && alimentazione !== '') {
          params.push(`alimentazione=${encodeURIComponent(alimentazione)}`);
        }
        if (params.length > 0) {
          url += '?' + params.join('&');
        }
        const res = await fetch(url);
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
      const token = localStorage.getItem('token');
      fetch('http://localhost:3000/api/ricetteSalvate', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSaved(data.map(r => r.id));
          }
        });
    }
  }, [tipologia, search, maxTime, maxKcal, alimentazione]);

  // Filtro solo per maxTime, maxKcal, alimentazione (il resto è lato backend)
  const filteredRecipes = recipes.filter((ricetta) => {
    // Search filter
    if (search && search.trim() !== '') {
      const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        const fields = [
          ricetta.nome,
          ricetta.ingredienti,
          ricetta.tipologia,
          ricetta.preparazione,
          ricetta.alimentazione,
          ricetta.author,
        ].map(f => (typeof f === 'string' ? f.toLowerCase() : String(f || '')));
        if (!words.every(word => fields.some(field => field.includes(word)))) {
          return false;
        }
      }
    }
    // Max time filter
    if (maxTime && !isNaN(Number(maxTime))) {
      if (!ricetta.tempo_preparazione || Number(ricetta.tempo_preparazione) > Number(maxTime)) {
        return false;
      }
    }
    //Max Kcal filter
    if (maxKcal && !isNaN(Number(maxKcal))) {
      if (!ricetta.kcal || Number(ricetta.kcal) > Number(maxKcal)) {
        return false;
      }
    }
    // Alimentazione filter
    if (alimentazione && alimentazione !== '') {
      if (!ricetta.alimentazione || ricetta.alimentazione !== alimentazione) {
        return false;
      }
    }
    return true;
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
    const token = localStorage.getItem('token');
    if (saved.includes(ricettaId)) {
      // Se già salvata, rimuovi
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
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ id_ricetta: ricettaId }),
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
            return (
              <RecipeCard
                key={ricetta.id || idx}
                ricetta={ricetta}
                userId={userId}
                saved={saved}
                handleSaveRecipe={handleSaveRecipe}
                handleRecipeClick={handleRecipeClick}
                search={search}
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
    </div>
  );
};

export default Home;