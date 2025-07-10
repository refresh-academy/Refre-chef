import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';

function RecipeCard({ ricetta, onClick }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = ricetta.immagine && ricetta.immagine.trim() !== '' && !imgError ? ricetta.immagine : '/fallback-food.jpg';
  return (
    <div
      key={ricetta.id}
      className="bg-white rounded shadow p-0 flex flex-row items-stretch gap-0 min-h-[180px] cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden"
      onClick={() => onClick(ricetta.id)}
    >
      <div className="relative w-48 min-w-[12rem] h-48 min-h-[12rem] flex-shrink-0 overflow-hidden">
        <img
          src={imageUrl}
          alt={ricetta.nome || 'Immagine di default'}
          className="w-full h-full object-cover object-center rounded-l"
          onError={() => setImgError(true)}
        />
      </div>
      <div className="flex-1 flex flex-col justify-between p-4 min-h-[12rem]">
        <h2 className="text-xl font-bold mb-2">{ricetta.nome}</h2>
        {ricetta.descrizione && (
          <div className="mb-1 text-gray-700 text-sm">{ricetta.descrizione}</div>
        )}
        <div className="flex flex-wrap gap-3 mb-2 text-gray-700 text-base font-semibold items-center">
          <span className="flex items-center gap-1"><i className="fa-regular fa-clock" /> {ricetta.tempo_preparazione} min</span>
          <span className="flex items-center gap-1"><i className="fa-solid fa-fire" /> {ricetta.kcal} kcal</span>
          <span className="flex items-center gap-1"><i className="fa-solid fa-utensils" /> {ricetta.porzioni} porzioni</span>
          {ricetta.author && <span className="flex items-center gap-1"><i className="fa-solid fa-user" /> {ricetta.author}</span>}
        </div>
        <div className="mb-1"><span className="font-semibold">Allergeni:</span> {ricetta.allergeni}</div>
      </div>
    </div>
  );
}

const ChefProfile = () => {
  const { authorId } = useParams();
  const [recipes, setRecipes] = useState([]);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch(`/api/chef/${authorId}/ricette`);
        const contentType = res.headers.get('content-type');
        if (!res.ok) {
          let errorMsg = 'Errore nel recupero delle ricette';
          if (contentType && contentType.includes('application/json')) {
            const errData = await res.json();
            errorMsg = errData.error || errorMsg;
          }
          throw new Error(errorMsg);
        }
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Risposta non valida dal server (non JSON)');
        }
        const data = await res.json();
        setRecipes(data);
        if (data.length > 0) setAuthor(data[0].author);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [authorId]);

  if (loading) return <div>Caricamento...</div>;
  if (error) return <div>Errore: {error}</div>;

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
        <h1 className="text-2xl font-bold mb-4 text-refresh-blue">Profilo Cuoco: {author || 'Sconosciuto'}</h1>
        <h3 className="text-lg font-semibold mb-6 text-refresh-pink">Ricette di questo autore</h3>
        {recipes.length === 0 ? (
          <div>Nessuna ricetta trovata per questo autore.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 w-full">
            {recipes.map((ricetta) => (
              <RecipeCard key={ricetta.id} ricetta={ricetta} onClick={(id) => navigate(`/ricetta/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChefProfile; 