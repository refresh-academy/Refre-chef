import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';

function RecipeCard({ ricetta, handleRemove, handleRecipeClick }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = ricetta.immagine && ricetta.immagine.trim() !== '' && !imgError ? ricetta.immagine : '/fallback-food.jpg';
  return (
    <div
      key={ricetta.id}
      className="bg-white rounded shadow p-4 flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => handleRecipeClick(ricetta.id)}
    >
      <h2 className="text-xl font-bold mb-2">{ricetta.nome}</h2>
      <div className="relative w-full flex justify-center">
        <img
          src={imageUrl}
          alt={ricetta.nome || 'Immagine di default'}
          className="mt-2 max-h-40 object-cover rounded"
          onError={() => setImgError(true)}
        />
      </div>
      <div className="mb-1"><span className="font-semibold">Tipologia:</span> {ricetta.tipologia}</div>
      <div className="mb-1"><span className="font-semibold">Alimentazione:</span> {ricetta.alimentazione}</div>
      <div className="mb-1"><span className="font-semibold">Ingredienti:</span> {ricetta.ingredienti}</div>
      <div className="mb-1"><span className="font-semibold">Preparazione:</span> {ricetta.preparazione}</div>
      <button
        className="mt-4 px-3 py-1 rounded bg-refresh-blue text-white font-semibold hover:bg-refresh-pink transition"
        onClick={(e) => handleRemove(ricetta.id, e)}
      >
        Rimuovi
      </button>
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <h1 className="text-2xl font-bold mb-4 text-refresh-blue">Ricette Salvate</h1>
      {loading && <div>Caricamento...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!loading && !error && recipes.length === 0 && (
        <div>Nessuna ricetta salvata trovata.</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
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
  );
};

export default SavedRecipes; 