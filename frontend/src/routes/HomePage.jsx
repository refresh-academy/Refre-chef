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
              className="w-full md:w-96 p-3 border rounded-full shadow focus:outline-none focus:ring-2 focus:ring-refresh-blue text-lg"
            />
            <button
              className="bg-refresh-pink text-white font-bold px-6 py-3 rounded-full shadow hover:bg-refresh-blue transition text-lg"
              onClick={() => navigate('/ricette' + (search ? `?q=${encodeURIComponent(search)}` : ''))}
            >
              Cerca
            </button>
          </div>
          <Link
            to="/add-recipe"
            className="mt-6 bg-refresh-blue hover:bg-refresh-pink text-white font-semibold px-8 py-3 rounded-full transition text-lg shadow"
          >
            + Aggiungi la tua ricetta
          </Link>
        </div>

        {/* Categories */}
        <div className="max-w-5xl mx-auto py-10 px-4">
          <h2 className="text-2xl font-bold text-refresh-blue mb-6">Categorie</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                className={`flex flex-row items-center h-32 md:h-40 w-full rounded-2xl bg-white border-2 ${cat.color} shadow hover:shadow-xl hover:border-4 transition text-2xl font-bold px-6 md:px-12 group`}
              >
                <span className="text-5xl md:text-6xl mr-6 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="flex-1 text-left md:text-3xl">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Le ultime ricette ora non vengono mostrate qui, ma solo nella pagina Ricette */}
      </div>
    </div>
  );
};

export default HomePage; 