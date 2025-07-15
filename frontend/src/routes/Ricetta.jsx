import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router';

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
  const [numPorzioni, setNumPorzioni] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [recensione, setRecensione] = useState(null); // stelle dell'utente
  const [mediaStelle, setMediaStelle] = useState(0);
  const [numRecensioni, setNumRecensioni] = useState(0);
  const [reviewMsg, setReviewMsg] = useState('');
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentMsg, setCommentMsg] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
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
      } catch {/* Ignora errori */}
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
          // Fetch numero salvataggi dal nuovo endpoint
          const resSaves = await fetch(`http://localhost:3000/api/ricetta-saves/${id}`);
          const savesData = await resSaves.json();
          setSavedCount(savesData.saved_count || 0);
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

  useEffect(() => {
    if (ricetta && ricetta.porzioni) setNumPorzioni(Number(ricetta.porzioni));
  }, [ricetta]);

  // Carica media stelle e recensione utente
  const fetchRecensioni = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:3000/api/ricette/${id}/recensioni`);
      const data = await res.json();
      if (res.ok) {
        setMediaStelle(Number(data.media) || 0);
        setNumRecensioni(Number(data.numero) || 0);
      }
    } catch {/* Ignora errori */}
    // Se loggato, carica la recensione dell'utente
    if (userId) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/ricette/${id}/recensioni/utente`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        });
        if (res.ok) {
          const data = await res.json();
          setRecensione(data.stelle || null);
        }
      } catch {/* Ignora errori */}
    }
  }, [id, userId]);

  useEffect(() => { fetchRecensioni(); }, [fetchRecensioni]);

  // Funzione per inviare la recensione
  const handleReview = async (stelle) => {
    setReviewMsg('');
    const token = localStorage.getItem('token');
    if (!token || !userId) {
      setReviewMsg('Devi essere loggato per recensire.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/ricette/${id}/recensione`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ stelle }),
      });
      const data = await res.json();
      if (res.ok) {
        setRecensione(stelle);
        setReviewMsg('Recensione salvata!');
        fetchRecensioni();
      } else {
        setReviewMsg(data.error || 'Errore nel salvataggio della recensione');
      }
    } catch {
      setReviewMsg('Errore di rete.');
    }
  };

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
        // Aggiorna subito il counter dopo il like/unlike dal nuovo endpoint
        try {
          const resSaves = await fetch(`http://localhost:3000/api/ricetta-saves/${id}`);
          const savesData = await resSaves.json();
          setSavedCount(savesData.saved_count || 0);
        } catch {/* Silently ignore errors updating the counter */}
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
        body: JSON.stringify({ recipeId: id, porzioni: numPorzioni }),
      });
      const data = await res.json();
      if (res.ok) {
        setGroceryMsg('Ingredienti aggiunti alla lista della spesa!');
        // Show modal with ingredient list
        if (ingredienti && ingredienti.length > 0) {
          setAddedIngredients(ingredienti.map(i => i.ingrediente));
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

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:3000/api/ricette/${id}/commenti`);
      const data = await res.json();
      if (res.ok) setComments(data);
    } catch {/* ignore */}
  }, [id]);
  useEffect(() => { fetchComments(); }, [fetchComments]);
  // Handle submit comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setCommentMsg('');
    if (!isLoggedIn(userId)) {
      setCommentMsg('Devi essere loggato per commentare.');
      return;
    }
    if (!commentText.trim()) {
      setCommentMsg('Il commento non può essere vuoto.');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/ricette/${id}/commento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ testo: commentText }),
      });
      const data = await res.json();
      if (res.ok) {
        setCommentText('');
        setCommentMsg('Commento aggiunto!');
        fetchComments();
      } else {
        setCommentMsg(data.error || 'Errore nel salvataggio del commento');
      }
    } catch {
      setCommentMsg('Errore di rete.');
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.testo);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSaveEditComment = async (commentId) => {
    if (!editingCommentText.trim()) {
      setCommentMsg('Il commento non può essere vuoto.');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/commenti/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ testo: editingCommentText }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditingCommentId(null);
        setEditingCommentText('');
        setCommentMsg('Commento aggiornato!');
        fetchComments();
      } else {
        setCommentMsg(data.error || 'Errore nell\'aggiornamento del commento');
      }
    } catch {
      setCommentMsg('Errore di rete.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo commento?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/commenti/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setCommentMsg('Commento eliminato.');
        fetchComments();
      } else {
        setCommentMsg(data.error || 'Errore nell\'eliminazione del commento');
      }
    } catch {
      setCommentMsg('Errore di rete.');
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
    <div className="relative min-h-screen w-full">
      {/* Overlay bianco trasparente che copre tutta la pagina */}
      <div className="absolute left-0 right-0 top-0 bottom-0 bg-white/70 pointer-events-none z-0" />
      <>
        <div className="flex justify-center bg-gray-50 min-h-screen py-8 px-2 relative z-10">
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
              {/* Pulsanti azione sopra immagine + recensioni */}
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
                <div className="flex gap-2 items-center">
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
                    <>
                      <button
                        onClick={handleSaveRecipe}
                        title={saved ? "Rimuovi dai segnalibri" : "Aggiungi ai segnalibri"}
                        aria-label={saved ? "Rimuovi dai segnalibri" : "Aggiungi ai segnalibri"}
                        className={`bg-white/80 rounded-full p-2 shadow transition hover:bg-refresh-blue ${saved ? "text-refresh-blue hover:text-refresh-pink" : "text-gray-400 hover:text-refresh-blue"}`}
                      >
                        <i className={`${saved ? 'fa-solid' : 'fa-regular'} fa-bookmark text-xl`}></i>
                      </button>
                    </>
                  )}
                </div>
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

            {/* Info rapide con rating */}
            <div className="flex flex-wrap gap-4 px-6 py-4 bg-white border-b border-gray-200 items-center">
              <div className="flex items-center gap-2 text-gray-700 text-base font-semibold"><i className="fa-regular fa-clock mr-1" /> {ricetta.tempo_preparazione} min</div>
              <div className="flex items-center gap-2 text-gray-700 text-base font-semibold"><i className="fa-solid fa-fire mr-1" /> {ricetta.kcal} kcal</div>
              <div className="flex items-center gap-2 text-gray-700 text-base font-semibold"><i className="fa-solid fa-utensils mr-1" /> {ricetta.porzioni} porzioni</div>
              {ricetta.author && (
                <div className="flex items-center gap-2 text-gray-700 text-base font-semibold">
                  <i className="fa-solid fa-user mr-1" />
                  <Link to={`/chef/${ricetta.author_id}`} className="text-refresh-blue hover:underline">
                    {ricetta.author}
                  </Link>
                </div>
              )}
              {/* Stelle e recensioni - ora nella barra info */}
              <div className="flex items-center gap-2 ml-2">
                <span className="text-yellow-400 text-lg md:text-xl animate-pulse">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i key={i} className={
                      i < Math.round(mediaStelle)
                        ? 'fa-solid fa-star drop-shadow'
                        : 'fa-regular fa-star text-gray-300'
                    }></i>
                  ))}
                </span>
                <span className="bg-white border border-yellow-300 text-yellow-600 font-bold rounded-full px-2 py-0.5 text-base shadow-inner ml-1">
                  {mediaStelle.toFixed(1)} / 5
                </span>
                <span className="bg-refresh-blue/10 text-refresh-blue font-semibold rounded-full px-2 py-0.5 text-xs ml-1">
                  {numRecensioni} recensioni
                </span>
              </div>
              {/* Numero di salvataggi */}
              <div className="flex items-center gap-2 text-refresh-blue font-bold text-base" title="Numero di salvataggi">
                <i className="fa-solid fa-bookmark" />
                {savedCount}
              </div>
            </div>

            {/* Ingredienti, preparazione e recensione utente affiancati */}
            <div className="flex flex-col md:flex-row gap-8 px-6 py-8 bg-white">
              {/* Ingredienti */}
              <div className="md:w-1/3 w-full">
                <div className="bg-gray-50 rounded-2xl shadow p-5 mb-6">
                  <h2 className="text-xl font-bold text-refresh-blue mb-3">Ingredienti</h2>
                  {ricetta && (
                    <div className="mb-3 flex items-center gap-2">
                      <label htmlFor="porzioni" className="font-semibold text-refresh-blue">Porzioni:</label>
                      <div className="flex items-center bg-refresh-blue/10 rounded-full px-2 py-1 shadow-inner">
                        <button
                          type="button"
                          className="text-refresh-blue font-bold text-lg px-2 focus:outline-none hover:text-refresh-pink transition"
                          onClick={() => setNumPorzioni(Math.max(1, (numPorzioni || 1) - 1))}
                          aria-label="Diminuisci porzioni"
                        >
                          -
                        </button>
                        <input
                          id="porzioni"
                          type="number"
                          min={1}
                          value={numPorzioni || ''}
                          onChange={e => setNumPorzioni(Number(e.target.value) || 1)}
                          className="w-14 text-center bg-transparent border-none font-bold text-refresh-blue focus:ring-0 focus:outline-none text-lg"
                          style={{ appearance: 'textfield' }}
                        />
                        <button
                          type="button"
                          className="text-refresh-blue font-bold text-lg px-2 focus:outline-none hover:text-refresh-pink transition"
                          onClick={() => setNumPorzioni((numPorzioni || 1) + 1)}
                          aria-label="Aumenta porzioni"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                  <ul className="list-none pl-0 text-gray-800 text-base space-y-2">
                    {ingredienti.length > 0 ? (
                      ingredienti.map((ing, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center bg-white/80 rounded-xl shadow hover:shadow-lg transition-shadow px-4 py-2 border border-gray-100 hover:border-refresh-blue/40 flex-nowrap"
                        >
                          <span className="font-medium text-refresh-blue flex-1 min-w-0 pr-2">{ing.ingrediente}</span>
                          <span className="bg-refresh-pink/10 text-refresh-pink font-bold rounded-full px-3 py-1 text-sm ml-4 shadow-inner">
                            {ing.unita === 'q.b.' ? 'q.b.' : `${((ing.grammi * (numPorzioni || ricetta?.porzioni || 0.1)) / (ricetta?.porzioni || 1))}${ing.unita && ing.unita !== 'n' ? ing.unita : ''}`.replace(/^1q\.b\.$/, 'q.b.')}
                          </span>
                        </li>
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
              {/* Preparazione e recensione utente */}
              <div className="md:w-2/3 w-full flex flex-col gap-4">
                <div className="bg-gray-50 rounded-2xl shadow p-5">
                  <h2 className="text-xl font-bold text-refresh-pink mb-3">Preparazione</h2>
                  {ricetta.steps && ricetta.steps.length > 0 ? (
                    <ol className="list-decimal pl-6 space-y-2 text-gray-800">
                      {ricetta.steps.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  ) : (
                    <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                      {ricetta.preparazione_dettagliata || ricetta.preparazione}
                    </div>
                  )}
                </div>
                {/* Form recensione utente - UI migliorata (ora accanto a ingredienti, sotto preparazione) */}
                {isLoggedIn(userId) && (
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-6 mt-1 bg-gray-50 rounded-2xl shadow p-5">
                    <span className="text-gray-700 font-semibold">La tua recensione:</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`text-base md:text-lg focus:outline-none transition-transform duration-150 ${recensione && i < recensione ? 'scale-110' : ''}`}
                          onClick={() => handleReview(i + 1)}
                          aria-label={`Dai ${i + 1} stelle`}
                          style={{ cursor: 'pointer' }}
                          onMouseOver={e => e.currentTarget.classList.add('text-yellow-300')}
                          onMouseOut={e => e.currentTarget.classList.remove('text-yellow-300')}
                        >
                          <i className={
                            recensione && i < recensione
                              ? 'fa-solid fa-star text-yellow-400 drop-shadow'
                              : 'fa-regular fa-star text-gray-300'
                          }></i>
                        </button>
                      ))}
                    </div>
                    {reviewMsg && <span className="ml-2 text-sm text-refresh-blue font-semibold">{reviewMsg}</span>}
                  </div>
                )}
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

            {/* Modal per link copiato */}
            {showCopied && (
              <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div className="bg-white border border-refresh-blue shadow-lg rounded-xl px-8 py-6 animate-fade-in pointer-events-auto flex flex-col items-center">
                  <i className="fa-solid fa-link text-refresh-blue text-3xl mb-2" />
                  <span className="text-lg font-bold text-refresh-blue mb-1">Link copiato!</span>
                  <span className="text-gray-600 text-base">Il link della ricetta è stato copiato negli appunti.</span>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Commenti - card separata, subito sotto la scheda ricetta */}
        <div className="w-full max-w-2xl mx-auto mt-8 mb-16 bg-white rounded-3xl shadow-2xl p-6 border-t-4 border-refresh-blue relative z-10">
          <h2 className="text-2xl font-bold text-refresh-blue mb-6 text-center">Commenti</h2>
          {comments.length === 0 && <div className="text-gray-500 mb-4 text-center">Nessun commento ancora. Sii il primo a commentare!</div>}
          <ul className="flex flex-col gap-6 mb-8">
            {comments.map(c => (
              <li key={c.id} className="flex flex-col items-start bg-gray-50 rounded-xl shadow p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2 w-full justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-refresh-blue">{c.author || 'Utente'}</span>
                    <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  {isLoggedIn(userId) && userId && c.user_id && String(userId) === String(c.user_id) && (
                    <div className="flex gap-2">
                      <button
                        className="text-xs text-refresh-blue hover:text-refresh-pink underline"
                        onClick={() => handleEditComment(c)}
                      >Modifica</button>
                      <button
                        className="text-xs text-red-500 hover:text-red-700 underline"
                        onClick={() => handleDeleteComment(c.id)}
                      >Elimina</button>
                    </div>
                  )}
                </div>
                {editingCommentId === c.id ? (
                  <div className="w-full flex flex-col gap-2 mt-2">
                    <textarea
                      value={editingCommentText}
                      onChange={e => setEditingCommentText(e.target.value)}
                      rows={3}
                      maxLength={500}
                      className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-refresh-blue"
                    />
                    <div className="flex gap-2">
                      <button
                        className="bg-refresh-blue text-white font-bold px-3 py-1 rounded hover:bg-refresh-pink transition"
                        onClick={() => handleSaveEditComment(c.id)}
                      >Salva</button>
                      <button
                        className="bg-gray-300 text-gray-800 font-bold px-3 py-1 rounded hover:bg-gray-400 transition"
                        onClick={handleCancelEdit}
                      >Annulla</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-800 whitespace-pre-line w-full">{c.testo}</div>
                )}
              </li>
            ))}
          </ul>
          {isLoggedIn(userId) && (
            <form onSubmit={handleSubmitComment} className="flex flex-col gap-2 mt-4">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Scrivi un commento..."
                className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-refresh-blue"
              />
              <div className="flex items-center gap-2">
                <button type="submit" className="bg-refresh-blue text-white font-bold px-4 py-2 rounded hover:bg-refresh-pink transition">Invia</button>
                {commentMsg && <span className="text-sm text-refresh-blue font-semibold">{commentMsg}</span>}
              </div>
            </form>
          )}
        </div>
      </>
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
