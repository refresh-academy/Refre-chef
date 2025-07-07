import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

const isLoggedIn = (userId) =>
  userId && userId !== "null" && userId !== "" && userId !== undefined && userId !== "undefined";

const Ricetta = () => {
  const { id } = useParams();
  const [ricetta, setRicetta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [userId, setUserId] = useState(null);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("userId");
    setUserId(isLoggedIn(stored) ? stored : null);
  }, []);

  useEffect(() => {
    const checkSaved = async () => {
      if (!isLoggedIn(userId)) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/ricetteSalvate', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setSaved(data.some((r) => String(r.id) === String(id)));
        }
      } catch {
        // Ignore errors
      }
    };
    checkSaved();
  }, [userId, id]);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://localhost:3000/api/ricette`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Errore nel caricamento della ricetta");
        } else {
          const found = data.find((r) => String(r.id) === String(id));
          setRicetta(found || null);
          if (!found) setError("Ricetta non trovata");
        }
      } catch {
        setError("Errore di rete.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleSaveRecipe = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn(userId)) {
      alert("Devi essere loggato per salvare le ricette.");
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const method = saved ? "DELETE" : "POST";
      const res = await fetch("http://localhost:3000/api/salvaRicetta", {
        method,
        headers: {
          "Content-Type": "application/json",
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ id_ricetta: id }),
      });
      if (res.ok) {
        setSaved(!saved);
      } else {
        const data = await res.json();
        alert(data.error || "Errore durante l'operazione.");
      }
    } catch {
      alert("Errore di rete.");
    }
  };

  const handleShare = () => {
    const tweetText = encodeURIComponent(`Guarda questa ricetta: ${ricetta.nome}`);
    const tweetUrl = encodeURIComponent(window.location.href);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch {
      alert("Errore nella copia del link");
    }
  };

  if (loading)
    return <div className="flex items-center justify-center min-h-[60vh] text-lg">Caricamento...</div>;
  if (error)
    return <div className="flex items-center justify-center min-h-[60vh] text-red-500">{error}</div>;
  if (!ricetta) return null;

  const imageUrl =
    ricetta.immagine && ricetta.immagine.trim() !== "" && !imgError ? ricetta.immagine : "/fallback-food.jpg";

  return (
    <div className="flex justify-center items-start p-6 bg-gray-50 min-h-screen">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="relative group">
          <img
            src={imageUrl}
            alt={ricetta.nome}
            className="w-full h-[350px] object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
          {isLoggedIn(userId) && (
            <button
              onClick={handleSaveRecipe}
              title={saved ? "Rimuovi dalle salvate" : "Salva ricetta"}
              className={`absolute top-5 left-5 text-3xl ${
                saved ? "text-red-500" : "text-white"
              } drop-shadow-md hover:scale-110 transition-transform`}
            >
              {saved ? "❤️" : "🤍"}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">{ricetta.nome}</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <Info label="Tipologia" value={ricetta.tipologia} />
            <Info label="Alimentazione" value={ricetta.alimentazione} />
            <Info label="Origine" value={ricetta.origine} />
            <Info label="Porzioni" value={ricetta.porzioni} />
            <Info label="Allergeni" value={ricetta.allergeni} />
            <Info label="Tempo di preparazione" value={`${ricetta.tempo_preparazione} min`} />
            <Info label="Kcal" value={ricetta.kcal} />
            <Info label="Creatore" value={ricetta.author} />
          </div>

          <div>
            <h2 className="text-lg font-semibold mt-4 mb-1">Ingredienti</h2>
            <p className="bg-gray-100 p-3 rounded-lg">{ricetta.ingredienti}</p>
          </div>

          {ricetta.preparazione_dettagliata && (
            <div>
              <h2 className="text-lg font-semibold mt-4 mb-1">Passaggi dettagliati</h2>
              <div className="bg-gray-100 p-3 rounded-lg whitespace-pre-line text-gray-800 leading-relaxed">
                {ricetta.preparazione_dettagliata}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            <Button onClick={handleShare}>Condividi</Button>
            <Button onClick={handleCopyLink}>Copia Link</Button>
            <Button onClick={() => navigate(-1)} variant="gray">
              Torna Indietro
            </Button>
          </div>

          {showCopied && <div className="text-center text-green-600 font-medium">Link copiato!</div>}
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-gray-100 p-3 rounded-lg">
    <span className="font-semibold">{label}:</span> {value}
  </div>
);

const Button = ({ onClick, children, variant = "blue" }) => {
  const base = "px-4 py-2 rounded-full font-semibold transition";
  const colors =
    variant === "blue"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-300 text-gray-800 hover:bg-gray-400";

  return (
    <button onClick={onClick} className={`${base} ${colors}`}>
      {children}
    </button>
  );
};

export default Ricetta;
