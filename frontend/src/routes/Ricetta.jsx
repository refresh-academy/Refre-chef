import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

const isLoggedIn = (userId) =>
  userId && userId !== "null" && userId !== "" && userId !== undefined && userId !== "undefined";

const Ricetta = () => {
  const { id } = useParams();
  const [ricetta, setRicetta] = useState(null);
  const [ingredienti, setIngredienti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [userId, setUserId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [groceryMsg, setGroceryMsg] = useState("");
  const [showGroceryModal, setShowGroceryModal] = useState(false);
  const [addedIngredients, setAddedIngredients] = useState([]);
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

  useEffect(() => {
    if (!id) return;
    const fetchIngredienti = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/ingredienti/${id}`);
        const data = await res.json();
        if (Array.isArray(data)) setIngredienti(data);
      } catch {
        // Optionally log or ignore
      }
    };
    fetchIngredienti();
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

  const handleAddToGroceryList = async () => {
    setGroceryMsg("");
    setAddedIngredients([]);
    if (!isLoggedIn(userId)) {
      alert("Devi essere loggato per aggiungere alla lista della spesa.");
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/addToGroceryList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ recipeId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setGroceryMsg('Ingredienti aggiunti alla lista della spesa!');
        // Show modal with ingredient list
        if (ricetta && ricetta.ingredienti) {
          const ingredients = ricetta.ingredienti.split(',').map(i => i.trim()).filter(i => i);
          setAddedIngredients(ingredients);
          setShowGroceryModal(true);
          setTimeout(() => setShowGroceryModal(false), 2500);
        }
      } else {
        setGroceryMsg(data.error || 'Errore durante l\'aggiunta alla lista della spesa.');
      }
    } catch {
      setGroceryMsg('Errore di rete.');
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
    <div className="flex justify-center bg-gray-50 min-h-screen py-8 px-2">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden">
        {/* Immagine grande e titolo */}
        <div className="relative">
          <img
            src={imageUrl}
            alt={ricetta.nome}
            className="w-full h-[340px] md:h-[420px] object-cover object-center"
            onError={() => setImgError(true)}
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-6 pb-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">{ricetta.nome}</h1>
          </div>
          {/* Pulsanti azione sopra immagine */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={handleCopyLink}
              title="Copia link ricetta"
              className="bg-white/80 hover:bg-refresh-blue text-refresh-blue hover:text-white rounded-full p-2 shadow transition"
            >
              <i className="fa-solid fa-link"></i>
            </button>
            <button
              onClick={handleShare}
              title="Condividi su Twitter"
              className="bg-white/80 hover:bg-refresh-pink text-refresh-pink hover:text-white rounded-full p-2 shadow transition"
            >
              <i className="fa-solid fa-share-nodes"></i>
            </button>
            {isLoggedIn(userId) && (
              <button
                onClick={handleSaveRecipe}
                title={saved ? "Rimuovi dai segnalibri" : "Aggiungi ai segnalibri"}
                aria-label={saved ? "Rimuovi dai segnalibri" : "Aggiungi ai segnalibri"}
                className={`rounded-full p-2 shadow transition text-2xl ${saved ? "bg-refresh-blue text-white hover:bg-refresh-pink" : "bg-white/80 text-gray-400 hover:text-refresh-blue"}`}
              >
                <i className={`${saved ? 'fa-solid' : 'fa-regular'} fa-bookmark`}></i>
              </button>
            )}
          </div>
          {/* Bottone carrello */}
          {isLoggedIn(userId) && (
            <button
              onClick={handleAddToGroceryList}
              title="Aggiungi ingredienti alla lista della spesa"
              className="absolute top-4 left-4 bg-refresh-blue text-white px-4 py-2 rounded-full font-semibold hover:bg-refresh-pink transition flex items-center text-base shadow"
              style={{ minHeight: '2.5rem' }}
            >
              <span className="mr-2">🛒</span> Lista spesa
            </button>
          )}
          {/* Modal per ingredienti aggiunti */}
          {showGroceryModal && (
            <div className="fixed inset-0 flex items-start justify-center z-50 pointer-events-none">
              <div className="mt-24 bg-white border border-refresh-blue shadow-lg rounded-xl px-6 py-4 animate-fade-in pointer-events-auto">
                <h3 className="text-lg font-bold text-refresh-blue mb-2">Ingredienti aggiunti al carrello:</h3>
                <ul className="list-disc pl-5 text-gray-800">
                  {addedIngredients.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Info rapide */}
        <div className="flex flex-wrap gap-4 px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-700 text-base font-semibold"><i className="fa-regular fa-clock mr-1" /> {ricetta.tempo_preparazione} min</div>
          <div className="flex items-center gap-2 text-gray-700 text-base font-semibold"><i className="fa-solid fa-fire mr-1" /> {ricetta.kcal} kcal</div>
          <div className="flex items-center gap-2 text-gray-700 text-base font-semibold"><i className="fa-solid fa-utensils mr-1" /> {ricetta.porzioni} porzioni</div>
          {ricetta.author && <div className="flex items-center gap-2 text-gray-700 text-base font-semibold"><i className="fa-solid fa-user mr-1" /> {ricetta.author}</div>}
        </div>

        {/* Ingredienti e preparazione affiancati */}
        <div className="flex flex-col md:flex-row gap-8 px-6 py-8 bg-white">
          {/* Ingredienti */}
          <div className="md:w-1/3 w-full">
            <div className="bg-gray-50 rounded-2xl shadow p-5 mb-6">
              <h2 className="text-xl font-bold text-refresh-blue mb-3">Ingredienti</h2>
              <ul className="list-disc pl-5 text-gray-800 text-base space-y-1">
                {ingredienti.length > 0 ? (
                  ingredienti.map((ing, idx) => (
                    <li key={idx}>{ing.ingrediente} <span className="text-gray-500 font-normal">({ing.grammi}g)</span></li>
                  ))
                ) : (
                  <li className="italic text-gray-400">Nessun ingrediente trovato.</li>
                )}
              </ul>
              {groceryMsg && (
                <div className="text-center text-blue-600 font-medium mt-2">{groceryMsg}</div>
              )}
            </div>
          </div>
          {/* Preparazione */}
          <div className="md:w-2/3 w-full">
            <div className="bg-gray-50 rounded-2xl shadow p-5">
              <h2 className="text-xl font-bold text-refresh-pink mb-3">Preparazione</h2>
              <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                {ricetta.preparazione_dettagliata || ricetta.preparazione}
              </div>
            </div>
          </div>
        </div>

        {/* Info aggiuntive */}
        <div className="px-6 pb-8 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info label="Tipologia" value={ricetta.tipologia} />
            <Info label="Alimentazione" value={ricetta.alimentazione} />
            <Info label="Origine" value={ricetta.origine} />
            <Info label="Allergeni" value={ricetta.allergeni} />
          </div>
        </div>

        {/* Pulsante torna indietro */}
        <div className="flex justify-center pb-8">
          <Button onClick={() => navigate(-1)} variant="gray">
            Torna Indietro
          </Button>
        </div>

        {showCopied && <div className="text-center text-green-600 font-medium pb-4">Link copiato!</div>}
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
