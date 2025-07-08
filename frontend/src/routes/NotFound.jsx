import { Link } from 'react-router';

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white">
    <h1 className="text-7xl font-extrabold text-refresh-blue mb-4">404</h1>
    <h2 className="text-2xl font-bold text-refresh-pink mb-2">Pagina non trovata</h2>
    <p className="text-lg text-gray-700 mb-8">La pagina che cerchi non esiste o è stata spostata.</p>
    <Link
      to="/"
      className="bg-refresh-blue hover:bg-refresh-pink text-white font-semibold px-6 py-3 rounded-full transition text-lg shadow"
    >
      Torna alla Home
    </Link>
  </div>
);

export default NotFound; 