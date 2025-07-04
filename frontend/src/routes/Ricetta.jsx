import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"

const Ricetta = () => {
    const { id } = useParams();
    const [ricetta, setRicetta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        const fetchRecipe = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`http://localhost:3000/api/ricette`);
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || 'Errore nel caricamento della ricetta');
                } else {
                    const found = data.find(r => String(r.id) === String(id));
                    if (found) setRicetta(found);
                    else setError('Ricetta non trovata');
                }
            } catch {
                setError('Errore di rete.');
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, [id]);

    if (loading) return <div className="flex flex-col items-center justify-center min-h-[60vh]">Caricamento...</div>;
    if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">{error}</div>;
    if (!ricetta) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
            <div className="w-full max-w-2xl bg-white/90 rounded-lg shadow-lg p-6 flex flex-col items-center">
                <h1 className="text-3xl font-bold mb-4">Ricetta</h1>
                {ricetta.immagine && (
                    <img src={ricetta.immagine} alt={ricetta.nome} className="w-64 h-64 object-cover rounded mb-4" />
                )}
                <div className="w-full flex flex-col gap-2">
                    <div><span className="font-semibold">Tipologia:</span> {ricetta.tipologia}</div>
                    <div><span className="font-semibold">Alimentazione:</span> {ricetta.alimentazione}</div>
                    <div><span className="font-semibold">Ingredienti:</span> {ricetta.ingredienti}</div>
                    <div><span className="font-semibold">Preparazione:</span> {ricetta.preparazione}</div>
                    <div><span className="font-semibold">Origine:</span> {ricetta.origine}</div>
                    <div><span className="font-semibold">Allergeni:</span> {ricetta.allergeni}</div>
                    <div><span className="font-semibold">Tempo di preparazione:</span> {ricetta.tempo_preparazione ? `${ricetta.tempo_preparazione} min` : ''}</div>
                    <div><span className="font-semibold">Kcal:</span> {ricetta.kcal}</div>
                    <div><span className="font-semibold">Creatore:</span> {ricetta.author}</div>
                </div>
                <button onClick={() => navigate(-1)} className="mt-6 px-4 py-2 rounded bg-refresh-blue text-white font-bold hover:bg-refresh-pink transition">Torna indietro</button>
            </div>
        </div>
    );
};








export default Ricetta;