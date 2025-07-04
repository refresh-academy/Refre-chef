import { useEffect, useState } from 'react';

const RECIPES_PER_PAGE = 9;

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

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
  }, []);

  const totalPages = Math.ceil(recipes.length / RECIPES_PER_PAGE);
  const paginatedRecipes = recipes.slice((page - 1) * RECIPES_PER_PAGE, page * RECIPES_PER_PAGE);

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
        {!loading && !error && recipes.length === 0 && (
          <div>Nessuna ricetta trovata.</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {paginatedRecipes.map((ricetta, idx) => (
            <div key={ricetta.id || idx} className="bg-white rounded shadow p-4 flex flex-col">
              <h2 className="text-xl font-bold mb-2">{ricetta.nome}</h2>
              <div className="mb-1"><span className="font-semibold">Tipologia:</span> {ricetta.tipologia}</div>
              <div className="mb-1"><span className="font-semibold">Alimentazione:</span> {ricetta.alimentazione}</div>
              <div className="mb-1"><span className="font-semibold">Ingredienti:</span> {ricetta.ingredienti}</div>
              <div className="mb-1"><span className="font-semibold">Preparazione:</span> {ricetta.preparazione}</div>
              {ricetta.immagine && (
                <img src={ricetta.immagine} alt={ricetta.nome} className="mt-2 max-h-40 object-cover rounded" />
              )}
            </div>
          ))}
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