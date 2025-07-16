import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import ConfirmModal from '../routes/ConfirmModal.jsx';

function ErrorModal({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white rounded shadow-lg p-6 min-w-[300px] max-w-[90vw] flex flex-col items-center">
        <div className="text-red-600 text-lg font-semibold mb-4">Errore</div>
        <div className="mb-4 text-center">{message}</div>
        <button className="bg-refresh-blue text-white px-4 py-2 rounded hover:bg-refresh-pink transition" onClick={onClose}>Chiudi</button>
      </div>
    </div>
  );
}


function RecipeCard({ ricetta, handleEdit, handleDelete, handleRecipeClick }) {
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
      <div className="flex-1 flex flex-col justify-between p-4 min-h-[12rem] relative">
        <h2 className="text-xl font-bold mb-2">{ricetta.nome}</h2>
        {ricetta.descrizione && (
          <div className="mb-1 text-gray-700 text-sm">{ricetta.descrizione}</div>
        )}
        <div className="flex flex-wrap gap-3 mb-2 text-gray-700 text-base font-semibold items-center">
          <span className="flex items-center gap-1"><i className="fa-regular fa-clock" /> {ricetta.tempo_preparazione} min</span>
          <span className="flex items-center gap-1"><i className="fa-solid fa-fire" /> {ricetta.kcal} kcal</span>
          <span className="flex items-center gap-1"><i className="fa-solid fa-utensils" /> {ricetta.porzioni} porzioni</span>
        </div>
        <div className="mb-1"><span className="font-semibold">Allergeni:</span> {ricetta.allergeni}</div>
        {ricetta.author && ricetta.author_id && (
          <Link
            to={`/chef/${ricetta.author_id}`}
            className="absolute bottom-2 right-4 flex items-center gap-1 text-gray-500 text-sm bg-white/80 px-2 py-1 rounded shadow z-10 cursor-pointer hover:text-refresh-blue hover:underline"
            onClick={e => e.stopPropagation()}
            title={`Vai al profilo di ${ricetta.author}`}
          >
            <i className="fa-solid fa-user" /> {ricetta.author}
          </Link>
        )}
        <div className="flex gap-2 mt-2">
          <button onClick={e => { e.stopPropagation(); handleEdit(ricetta.id); }} className="bg-refresh-blue text-white px-3 py-1 rounded hover:bg-refresh-pink transition">Modifica</button>
          <button onClick={e => { e.stopPropagation(); handleDelete(ricetta.id); }} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 transition">Elimina</button>
        </div>
      </div>
    </div>
  );
}

const MyRecipes = ({ user }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ricettaDaEliminare, setRicettaDaEliminare] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchRecipes = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/ricette', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Errore nel caricamento delle ricette');
        } else {
          // Mostra solo le ricette create dall'utente loggato
          setRecipes(data.filter(r => String(r.author_id) === String(user.userId)));
        }
      } catch (err) {
        setError('Errore di rete.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [user]);

  const handleEdit = (ricettaId) => {
    navigate(`/edit-recipe/${ricettaId}`);
  };

  const handleDelete = (ricettaId) => {
  setRicettaDaEliminare(ricettaId);
};

  const confermaEliminazione = async () => {
    if (!ricettaDaEliminare) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/ricette/${ricettaDaEliminare}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (res.ok) {
        setRecipes(prev => prev.filter(r => r.id !== ricettaDaEliminare));
        setRicettaDaEliminare(null);
      } else {
        const data = await res.json();
        setDeleteError(data.error || "Errore nell'eliminazione della ricetta");
      }
    } catch {
      setDeleteError("Errore di rete nell'eliminazione.");
    }
  };


  const handleRecipeClick = (ricettaId) => {
    navigate(`/ricetta/${ricettaId}`);
  };

  if (!user) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh]"><h2 className="text-xl font-bold">Devi essere loggato per vedere le tue ricette.</h2></div>;
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div className="absolute left-0 right-0" style={{ top: 0, height: 'calc(100vh - 64px)', background: 'rgba(255,255,255,0.7)', zIndex: 0, pointerEvents: 'none' }} />
      <div className="relative z-10 w-full flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <h1 className="text-2xl font-bold mb-4 text-refresh-blue">Le mie ricette</h1>
        {loading && <div>Caricamento...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!loading && !error && recipes.length === 0 && (
          <div>Non hai ancora creato nessuna ricetta.</div>
        )}
        <div className="flex flex-col gap-6 w-full max-w-5xl">
          {recipes.map((ricetta) => (
            <RecipeCard
              key={ricetta.id}
              ricetta={ricetta}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleRecipeClick={handleRecipeClick}
            />
          ))}
        </div>
        {ricettaDaEliminare && (
          <ConfirmModal
            message="Sei sicuro di voler eliminare questa ricetta?"
            onConfirm={confermaEliminazione}
            onCancel={() => setRicettaDaEliminare(null)}
          />
        )}
        <ErrorModal message={deleteError} onClose={() => setDeleteError('')} />
      </div>
    </div>
  );
};

export default MyRecipes; 