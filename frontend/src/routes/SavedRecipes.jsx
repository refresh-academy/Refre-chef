import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';

function RecipeCard({ ricetta, handleRemove, handleRecipeClick }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = ricetta.immagine && ricetta.immagine.trim() !== '' && !imgError ? ricetta.immagine : '/fallback-food.jpg';

  return (
    <div
      key={ricetta.id}
      className="bg-white rounded shadow p-0 flex flex-row items-stretch gap-0 min-h-[180px] cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden"
      onClick={() => handleRecipeClick(ricetta.id)}
    >
      <div className="relative w-48 min-w-[12rem] h-48 min-h-[12rem] flex-shrink-0 overflow-hidden">
        <img
          src={imageUrl}
          alt={ricetta.nome || 'Immagine di default'}
          className="w-full h-full object-cover object-center rounded-l"
          style={{ minHeight: '180px', height: '100%' }}
          onError={() => setImgError(true)}
        />
      </div>
      <div className="flex-1 flex flex-col justify-between p-4 min-h-[12rem]">
        <h2 className="text-xl font-bold mb-2">{ricetta.nome}</h2>
        {ricetta.tipologia && (
          <div className="mb-1 text-gray-700 text-sm"><span className="font-semibold">Tipologia:</span> {ricetta.tipologia}</div>
        )}
        {ricetta.descrizione && (
          <div className="mb-1 text-gray-700 text-sm">{ricetta.descrizione}</div>
        )}
        <div className="flex flex-wrap gap-6 mb-2 text-gray-700 text-lg font-bold items-center">
          <span className="flex items-center gap-1"><i className="fa-regular fa-clock" /><span className="font-semibold">Minuti:</span> {ricetta.tempo_preparazione ?? '-'} min</span>
          <span className="flex items-center gap-1"><i className="fa-solid fa-fire" /><span className="font-semibold">Kcal:</span> {ricetta.kcal ?? '-'}</span>
          <span className="flex items-center gap-1"><i className="fa-solid fa-utensils" /><span className="font-semibold">Porzioni:</span> {ricetta.porzioni ?? '-'}</span>
        </div>
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
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/ricetteSalvate', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Errore nel caricamento delle ricette');
        } else {
          setRecipes(data);
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
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!loading && !error && recipes.length === 0 && (
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