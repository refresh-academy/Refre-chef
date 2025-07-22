import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';

// RecipeStars component from Ricettario.jsx
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

function RecipeCard({ ricetta, handleRemove, handleRecipeClick }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = ricetta.immagine && ricetta.immagine.trim() !== '' && !imgError ? ricetta.immagine : '/fallback-food.jpg';

  return (
    <div
      key={ricetta.id}
      className="bg-white rounded shadow p-0 flex flex-row items-stretch gap-0 min-h-[140px] sm:min-h-[180px] cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden"
      onClick={() => handleRecipeClick(ricetta.id)}
    >
      <div className="relative w-32 h-32 min-w-[8rem] min-h-[8rem] sm:w-48 sm:h-48 sm:min-w-[12rem] sm:min-h-[12rem] flex-shrink-0 overflow-hidden">
        <img
          src={imageUrl}
          alt={ricetta.nome || 'Immagine di default'}
          className="w-full h-full object-cover object-center rounded-l"
          style={{ minHeight: undefined, height: undefined }}
          onError={() => setImgError(true)}
        />
      </div>
      <div className="flex-1 flex flex-col justify-between p-2 sm:p-4 min-h-[8rem] sm:min-h-[12rem] relative">
        <h2 className="text-base sm:text-xl font-bold mb-1 sm:mb-2 break-words">{ricetta.nome}</h2>
        {ricetta.descrizione && (
          <div className="mb-1 text-gray-700 text-xs sm:text-sm break-words whitespace-pre-line">{ricetta.descrizione}</div>
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
          <span className="font-semibold">Allergeni:</span> {ricetta.allergeni && ricetta.allergeni.trim() ? ricetta.allergeni : <span className="italic text-gray-400">Nessuno</span>}
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
        <button
          className="mt-4 px-3 py-1 rounded bg-refresh-blue text-white font-semibold hover:bg-refresh-pink transition self-start"
          onClick={(e) => handleRemove(ricetta.id, e)}
        >
          Rimuovi
        </button>
      </div>
    </div>
  );
}

const SavedRecipes = () => {
  const { userId } = useParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tokenExpired, setTokenExpired] = useState(false);
  const navigate = useNavigate();

  // Redirect to /saved-recipes if userId param is present
  useEffect(() => {
    if (userId !== undefined) {
      navigate('/saved-recipes', { replace: true });
      return;
    }
  }, [userId, navigate]);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError('');
      setTokenExpired(false);
      try {
        // REMOVE token/localStorage logic, use credentials: 'include'
        const res = await fetch('http://localhost:3000/api/ricetteSalvate', {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.status === 403 && data.error === 'Token expired, you will be redirected in the login page') {
          setTokenExpired(true);
          setTimeout(() => {
            if (typeof window.setUser === 'function') window.setUser(null);
            localStorage.removeItem('userId');
            localStorage.removeItem('token');
            navigate('/login');
          }, 1500);
        } else {
          // If backend returns { recipes: [...] }
          setRecipes(Array.isArray(data.recipes) ? data.recipes : Array.isArray(data) ? data : []);
        }
      } catch (err) {
        setError('Errore di rete.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const handleRemove = async (ricettaId, event) => {
    event.stopPropagation(); // Prevent navigation when clicking remove button
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Devi essere loggato per rimuovere le ricette.');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/salvaRicetta', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id_ricetta: ricettaId }),
      });
      if (res.ok) {
        setRecipes((prev) => prev.filter(r => r.id !== ricettaId));
      } else {
        const data = await res.json();
        alert(data.error || 'Errore nella rimozione della ricetta salvata');
      }
    } catch {
      alert('Errore di rete nella rimozione.');
    }
  };

  // Funzione per navigare alla ricetta
  const handleRecipeClick = (ricettaId) => {
    navigate(`/ricetta/${ricettaId}`);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] p-4 w-full">
      {/* Overlay bianco trasparente sotto la navbar (navbar height 64px) */}
      <div className="absolute left-0 right-0 top-0" style={{ height: '100%', background: 'rgba(255,255,255,0.7)', zIndex: 0, pointerEvents: 'none' }} />
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4 text-refresh-blue">Ricette Salvate</h1>
        {loading && <div>Caricamento...</div>}
        {!loading && tokenExpired && (
          <div className="text-xl font-bold  text-refresh-pink">Sessione scaduta, verrai reindirizzato al login...</div>
        )}
        {!loading && !tokenExpired && error && (
          <div>{error}</div>
        )}
        {!loading && !tokenExpired && !error && recipes.length === 0 && (
          <div>Nessuna ricetta salvata trovata.</div>
        )}
        <div className="flex flex-col gap-6 w-full max-w-5xl">
          {recipes.map((ricetta) => (
            <RecipeCard
              key={ricetta.id}
              ricetta={ricetta}
              handleRemove={handleRemove}
              handleRecipeClick={handleRecipeClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedRecipes;