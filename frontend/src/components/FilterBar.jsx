const FilterBar = ({ maxTime, setMaxTime, maxKcal, setMaxKcal, alimentazione, setAlimentazione, sortBy, setSortBy }) => {

  const resetFilters = () => {
    setMaxTime('');
    setMaxKcal('');
    setAlimentazione('');
    setSortBy('nome');
  };

  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          .filter-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 1.5rem !important;
            padding: 1rem 0.5rem !important;
          }
          .filter-bar > div, .filter-bar > button {
            width: 100% !important;
            margin-left: 0 !important;
          }
          .filter-bar > button {
            margin-top: 0.5rem !important;
          }
        }
        @media (max-width: 600px) {
          .filter-bar {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            padding: 0.5rem 0.25rem !important;
          }
          .filter-bar > div, .filter-bar > button {
            min-width: 220px !important;
            font-size: 0.95rem !important;
          }
        }
      `}</style>
      <div className="w-full flex justify-center items-center bg-transparent px-2 py-2">
        <div 
          className="filter-bar backdrop-blur-md bg-white/80 border-2 border-refresh-blue shadow-xl rounded-2xl px-8 py-6 flex flex-row gap-8 items-end transition-all duration-300" 
          style={{ minWidth: 'fit-content' }}
        >
          {/* Time Filter */}
          <div className="flex flex-col items-center">
            <label htmlFor="maxTime" className="flex items-center gap-2 text-xs font-semibold mb-2 text-refresh-blue">
              <i className="fa-regular fa-clock text-refresh-blue" />
              Tempo massimo (min)
            </label>
            <select
              id="maxTime"
              value={maxTime}
              onChange={e => setMaxTime(e.target.value)}
              className="w-fit p-2 border-2 border-refresh-blue rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-refresh-blue transition-all duration-200 hover:border-refresh-pink"
            >
              <option value="">Qualsiasi</option>
              <option value="10">5-10 minuti</option>
              <option value="20">10-20 minuti</option>
              <option value="30">20-30 minuti</option>
              <option value="60">30-60 minuti</option>
              <option value="oltre60">Oltre</option>
            </select>
          </div>

          {/* Calories Filter */}
          <div className="flex flex-col items-center">
            <label htmlFor="maxKcal" className="flex items-center gap-2 text-xs font-semibold mb-2 text-refresh-pink">
              <i className="fa-solid fa-fire text-refresh-pink" />
              Kcal per porzione
            </label>
            <select
              id="maxKcal"
              value={maxKcal}
              onChange={e => setMaxKcal(e.target.value)}
              className="w-fit p-2 border-2 border-refresh-pink rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-refresh-pink transition-all duration-200 hover:border-refresh-blue"
            >
              <option value="">Qualsiasi</option>
              <option value="200">0-200 kcal</option>
              <option value="400">200-400 kcal</option>
              <option value="600">400-600 kcal</option>
              <option value="800">600-800 kcal</option>
              <option value="oltre800">800 o oltre</option>
            </select>
          </div>

          {/* Diet Type Filter */}
          <div className="flex flex-col items-center justify-end">
            <label htmlFor="alimentazione" className="flex items-center gap-2 text-xs font-semibold mb-2 text-gray-700">
              <i className="fa-solid fa-leaf text-green-600" />
              Alimentazione
            </label>
            <select
              id="alimentazione"
              value={alimentazione}
              onChange={e => setAlimentazione(e.target.value)}
              className="w-fit p-2 border-2 border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-refresh-blue transition-all duration-200 hover:border-refresh-pink"
            >
              <option value="">🍽️ Tutte le alimentazioni</option>
              <option value="Onnivora">🥩 Onnivoro</option>
              <option value="Vegetariana">🥬 Vegetariano</option>
              <option value="Vegan">🌱 Vegano</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex flex-col items-center justify-end">
            <label htmlFor="sortBy" className="flex items-center gap-2 text-xs font-semibold mb-2 text-yellow-700">
              <i className="fa-solid fa-arrow-down-a-z text-yellow-700" />
              Ordina per
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-fit p-2 border-2 border-yellow-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200 hover:border-refresh-pink"
            >
              <option value="nome">Nome (A-Z)</option>
              <option value="nomeZA">Nome (Z-A)</option>
              <option value="salvati">Più salvate</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            className="ml-8 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-refresh-blue to-refresh-pink text-white font-bold shadow-lg border-none transition-all duration-200 hover:from-refresh-pink hover:to-refresh-blue hover:scale-105 focus:outline-none focus:ring-2 focus:ring-refresh-pink focus:ring-offset-2"
            onClick={resetFilters}
            style={{ height: '40px', minWidth: '140px' }}
            title="Reset filtri"
          >
            <i className="fa-solid fa-rotate-left text-lg" />
            Reset filtri
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterBar;