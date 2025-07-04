import { useEffect, useState } from 'react';

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      } catch (err) {
        setError('Errore di rete.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <h1 className="text-2xl font-bold mb-4">Tutte le Ricette</h1>
      {loading && <div>Caricamento...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!loading && !error && recipes.length === 0 && (
        <div>Nessuna ricetta trovata.</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {recipes.map((ricetta, idx) => (
          <div key={ricetta.nome + idx} className="bg-white rounded shadow p-4 flex flex-col">
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
    </div>
  );
};

export default Home;