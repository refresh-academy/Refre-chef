import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import logorefreChef from '/logorefreChef.png';

const CATEGORIES = [
  { name: 'Antipasti', color: 'border-refresh-pink text-refresh-pink', icon: '🥗' },
  { name: 'Primi piatti', color: 'border-refresh-blue text-refresh-blue', icon: '🍝' },
  { name: 'Secondi piatti', color: 'border-refresh-light-blue text-refresh-light-blue', icon: '🍖' },
  { name: 'Dolci', color: 'border-pink-200 text-pink-400', icon: '🍰' },
  { name: 'Lievitati', color: 'border-blue-200 text-blue-400', icon: '🍞' },
  { name: 'Piatti unici', color: 'border-cyan-200 text-cyan-400', icon: '🥘' },
];

const HomePage = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [suggested, setSuggested] = useState([]);
  const [randomRecipe, setRandomRecipe] = useState(null);
  const [showRandomModal, setShowRandomModal] = useState(false);

  useEffect(() => {
    // Carica ricette popolari (più salvate)
    fetch('http://localhost:3000/api/ricette-popolari')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSuggested(data);
        }
      });
  }, []);

  return (
    <div className="relative min-h-screen z-0">
      {/* White tint overlay sotto la navbar ma sopra il background */}
      <div className="absolute inset-0 z-0 w-full h-full bg-white/70 pointer-events-none" />
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero Section */}
        <div className="relative flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-b from-refresh-blue/10 to-white">
          <img src={logorefreChef} alt="RefreChef Logo" className="w-32 md:w-44 mb-4 drop-shadow-xl" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-refresh-blue mb-2 text-center drop-shadow">Benvenuto su RefreChef!</h1>
          <p className="text-lg md:text-xl text-gray-700 mb-6 text-center max-w-2xl">Scopri, cerca e salva le migliori ricette italiane. Ispirati, cucina e condividi!</p>
          <div className="flex flex-col md:flex-row gap-3 w-full max-w-xl items-center justify-center">
            <input
              type="text"
              placeholder="Cerca una ricetta o un ingrediente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  navigate('/ricette' + (search ? `?q=${encodeURIComponent(search)}` : ''));
                }
              }}
              className="w-full md:w-96 p-3 border rounded-full shadow focus:outline-none focus:ring-2 focus:ring-refresh-blue text-lg"
            />
            <button
              className="bg-refresh-pink text-white font-bold px-6 py-3 rounded-full shadow hover:bg-refresh-blue transition text-lg"
              onClick={() => navigate('/ricette' + (search ? `?q=${encodeURIComponent(search)}` : ''))}
            >
              Cerca
            </button>
            <button
              className="bg-refresh-pink text-white font-bold px-6 py-3 rounded-full shadow hover:bg-refresh-blue transition text-lg whitespace-nowrap flex items-center gap-2"
              style={{ height: '48px' }}
              onClick={async () => {
                // Fetch all recipes only when button is clicked
                try {
                  const res = await fetch('http://localhost:3000/api/ricette');
                  const data = await res.json();
                  if (Array.isArray(data) && data.length > 0) {
                    const random = data[Math.floor(Math.random() * data.length)];
                    setRandomRecipe(random);
                    setShowRandomModal(true);
                  }
                } catch {
                  alert('Errore nel caricamento delle ricette.');
                }
              }}
            >
           Mi sento fortunato
            </button>
          </div>
          <Link
            to="/ricette"
            className="mt-6 bg-refresh-blue hover:bg-refresh-pink text-white font-semibold px-8 py-3 rounded-full transition text-lg shadow"
          >
            <div className='flex flex-col items-center'>
            Vai alle ricette <p className='text-2xl'> ➤ </p></div>
          </Link> 
        </div>

        {/* Suggested Plates */}
        {suggested.length > 0 && (
          <div className="max-w-5xl mx-auto py-4 px-4 flex flex-col items-start justify-start">
            <h2 className="text-2xl font-bold text-refresh-pink mb-4 text-left w-full">Piatti consigliati</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {suggested.map(r => (
                <Link
                  to={`/ricetta/${r.id}`}
                  key={r.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition flex flex-row overflow-hidden group min-h-[180px] h-full"
                >
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
                    {/* Description removed: only show name and CTA */}
                    <span className="mt-4 inline-block text-refresh-pink font-semibold">Scopri la ricetta &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="max-w-5xl mx-auto py-10 px-4">
          <h2 className="text-2xl font-bold text-refresh-blue mb-6">Categorie</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                to={`/ricette?tipologia=${encodeURIComponent(cat.name)}`}
                className={`flex flex-row items-center h-32 md:h-40 w-full rounded-2xl bg-white border-2 ${cat.color} shadow hover:shadow-xl hover:border-4 transition text-2xl font-bold px-6 md:px-12 group`}
              >
                <span className="text-5xl md:text-6xl mr-6 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="flex-1 text-left md:text-3xl">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Le ultime ricette ora non vengono mostrate qui, ma solo nella pagina Ricette */}

        {/* Modal Ricetta Casuale */}
        {showRandomModal && randomRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full relative animate-fade-in">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-refresh-pink text-2xl font-bold"
                onClick={() => setShowRandomModal(false)}
                aria-label="Chiudi"
              >
                ×
              </button>
              <div className="flex flex-row gap-4">
                <div className="relative w-40 min-w-[10rem] h-40 min-h-[10rem] flex-shrink-0 overflow-hidden">
                  <img
                    src={randomRecipe.immagine && randomRecipe.immagine.trim() !== '' ? randomRecipe.immagine : '/fallback-food.jpg'}
                    alt={randomRecipe.nome}
                    className="w-full h-full object-cover object-center rounded-lg"
                    onError={e => (e.target.src = '/fallback-food.jpg')}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <h3 className="text-xl font-bold text-refresh-blue mb-2">{randomRecipe.nome}</h3>
                  <div className="mb-1 text-gray-700 text-sm line-clamp-4">{randomRecipe.descrizione}</div>
                  <div className="flex flex-wrap gap-2 mt-2 text-gray-700 text-base font-semibold items-center">
                    <span className="flex items-center gap-1"><i className="fa-regular fa-clock" /> {randomRecipe.tempo_preparazione} min</span>
                    <span className="flex items-center gap-1"><i className="fa-solid fa-fire" /> {randomRecipe.kcal} kcal</span>
                    <span className="flex items-center gap-1"><i className="fa-solid fa-utensils" /> {randomRecipe.porzioni} porzioni</span>
                    {randomRecipe.author && <span className="flex items-center gap-1"><i className="fa-solid fa-user" /> {randomRecipe.author}</span>}
                  </div>
                  <Link
                    to={`/ricetta/${randomRecipe.id}`}
                    className="mt-4 inline-block bg-refresh-blue hover:bg-refresh-pink text-white font-semibold px-6 py-2 rounded-full transition text-lg shadow text-center"
                    onClick={() => setShowRandomModal(false)}
                  >
                    Vai alla ricetta
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 