import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"

const isLoggedIn = (userId) => {
    return userId && userId !== 'null' && userId !== '' && userId !== undefined && userId !== 'undefined';
};

const Ricetta = () => {
    const { id } = useParams();
    const [ricetta, setRicetta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imgError, setImgError] = useState(false);
    const [showCopied, setShowCopied] = useState(false);
    const [userId, setUserId] = useState(null);
    const [saved, setSaved] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('userId');
        if (isLoggedIn(stored)) {
            setUserId(stored);
        } else {
            setUserId(null);
        }
    }, []);

    useEffect(() => {
        // Check if this recipe is saved for the user
        const checkSaved = async () => {
            if (!isLoggedIn(userId)) return;
            try {
                const res = await fetch(`http://localhost:3000/api/ricetteSalvate/${userId}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setSaved(data.some(r => String(r.id) === String(id)));
                }
            } catch {
                // Silently ignore errors
            }
        };
        checkSaved();
    }, [userId, id]);

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

    const handleSaveRecipe = async (event) => {
        event.stopPropagation();
        if (!isLoggedIn(userId)) {
            alert('Devi essere loggato per salvare le ricette.');
            return;
        }
        if (saved) {
            // Unsave
            try {
                const res = await fetch('http://localhost:3000/api/salvaRicetta', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_user: userId, id_ricetta: id }),
                    credentials: 'include',
                });
                if (res.ok) {
                    setSaved(false);
                } else {
                    const data = await res.json();
                    alert(data.error || 'Errore nella rimozione della ricetta salvata');
                }
            } catch {
                alert('Errore di rete nella rimozione.');
            }
        } else {
            // Save
            try {
                const res = await fetch('http://localhost:3000/api/salvaRicetta', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_user: userId, id_ricetta: id }),
                    credentials: 'include',
                });
                if (res.ok) {
                    setSaved(true);
                } else {
                    const data = await res.json();
                    alert(data.error || 'Errore nel salvataggio della ricetta');
                }
            } catch {
                alert('Errore di rete nel salvataggio.');
            }
        }
    };

    const handleShare = () => {
        const tweetText = encodeURIComponent(`Guarda questa ricetta: ${ricetta.nome}`);
        const tweetUrl = encodeURIComponent(window.location.href);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`;
        window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        } catch {
            alert('Errore nella copia del link');
        }
    };

    if (loading) return <div className="flex flex-col items-center justify-center min-h-[60vh]">Caricamento...</div>;
    if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">{error}</div>;
    if (!ricetta) return null;

    const imageUrl = ricetta.immagine && ricetta.immagine.trim() !== '' && !imgError ? ricetta.immagine : '/fallback-food.jpg';

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
            <div className="w-full max-w-2xl bg-white/90 rounded-lg shadow-lg p-6 flex flex-col items-center relative">
                <h1 className="text-3xl font-bold mb-4">{ricetta.nome}</h1>
                <div className="relative w-96 h-96 mb-4">
                    <img
                        src={imageUrl}
                        alt={ricetta.nome}
                        className="w-full h-full object-cover rounded"
                        onError={() => setImgError(true)}
                    />
                    {isLoggedIn(userId) && (
                        <span
                            onClick={handleSaveRecipe}
                            className={`absolute top-2 left-2 text-3xl cursor-pointer transition-colors z-10 ${
                                saved
                                    ? 'text-red-500 hover:text-red-600'
                                    : 'text-gray-400 hover:text-red-500'
                            }`}
                            title={saved ? 'Rimuovi dalle salvate' : 'Salva ricetta'}
                        >
                            {saved ? '❤️' : '🤍'}
                        </span>
                    )}
                </div>
                <div className="w-full flex flex-col gap-3">
                    <div className="bg-gray-50 p-3 rounded"><span className="font-semibold">Tipologia:</span> {ricetta.tipologia}</div>
                    <div className="bg-gray-50 p-3 rounded"><span className="font-semibold">Alimentazione:</span> {ricetta.alimentazione}</div>
                    <div className="bg-gray-50 p-3 rounded"><span className="font-semibold">Ingredienti:</span> {ricetta.ingredienti}</div>
                    {ricetta.preparazione_dettagliata && (
                      <div className="bg-gray-50 p-3 rounded whitespace-pre-line">
                        <span className="font-semibold">Passaggi dettagliati:</span>
                        <div className="mt-1">{ricetta.preparazione_dettagliata}</div>
                      </div>
                    )}
                    <div className="bg-gray-50 p-3 rounded"><span className="font-semibold">Origine:</span> {ricetta.origine}</div>
                    <div className="bg-gray-50 p-3 rounded"><span className="font-semibold">Porzioni:</span> {ricetta.porzioni}</div>
                    <div className="bg-gray-50 p-3 rounded"><span className="font-semibold">Allergeni:</span> {ricetta.allergeni}</div>
                    <div className="bg-gray-50 p-3 rounded"><span className="font-semibold">Tempo di preparazione:</span> {ricetta.tempo_preparazione ? `${ricetta.tempo_preparazione} min` : ''}</div>
                    <div className="bg-gray-50 p-3 rounded"><span className="font-semibold">Kcal:</span> {ricetta.kcal}</div>
                    <div className="bg-gray-50 p-3 rounded"><span className="font-semibold">Creatore:</span> {ricetta.author}</div>
                </div>
                <div className="flex gap-4 mt-6">
                    <button onClick={handleShare} className="px-4 py-2 rounded bg-refresh-blue text-white font-bold hover:bg-refresh-pink transition">Condividi su X</button>
                    <button onClick={handleCopyLink} className="px-4 py-2 rounded bg-refresh-blue text-white font-bold hover:bg-refresh-pink transition">Copia link</button>
                </div>
                {showCopied && <div className="mt-2 text-green-600 font-semibold">Link copiato!</div>}
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 rounded bg-refresh-blue text-white font-bold hover:bg-refresh-pink transition">Torna indietro</button>
            </div>
        </div>
    );
};

export default Ricetta;