import { useEffect, useState } from 'react';

const GroceryList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState(1);
  const [removingRecipeId, setRemovingRecipeId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchList = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3000/api/groceryList', {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Errore nel caricamento della lista');
      } else {
        setItems(data);
      }
    } catch {
      setError('Errore di rete.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line
  }, []);

  const handleRemove = async (ingredient, recipe_id) => {
    if (!window.confirm(`Rimuovere "${ingredient}" dalla lista?`)) return;
    try {
      const res = await fetch('http://localhost:3000/api/groceryList/ingredient', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ ingredient, recipe_id }),
      });
      if (res.ok) {
        setItems(items.filter(i => !(i.ingredient === ingredient && i.recipe_id === recipe_id)));
      } else {
        const data = await res.json();
        setError(data.error || 'Errore nella rimozione');
      }
    } catch {
      setError('Errore di rete.');
    }
  };

  const handleEdit = (index, quantity) => {
    setEditIndex(index);
    setEditValue(quantity);
  };

  const handleEditSave = async (ingredient, recipe_id) => {
    if (editValue < 1) return;
    try {
      const res = await fetch('http://localhost:3000/api/groceryList/ingredient', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ ingredient, quantity: editValue, recipe_id }),
      });
      if (res.ok) {
        setItems(items.map((i, idx) => idx === editIndex ? { ...i, quantity: editValue } : i));
        setEditIndex(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Errore nella modifica');
      }
    } catch {
      setError('Errore di rete.');
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Svuotare tutta la lista della spesa?')) return;
    try {
      const res = await fetch('http://localhost:3000/api/groceryList/clear', {
        method: 'POST',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      });
      if (res.ok) {
        setItems([]);
      } else {
        const data = await res.json();
        setError(data.error || 'Errore nello svuotamento');
      }
    } catch {
      setError('Errore di rete.');
    }
  };

  const handleRemoveRecipe = async (recipe_id, recipe_name) => {
    if (!window.confirm(`Rimuovere tutti gli ingredienti di "${recipe_name}" dalla lista?`)) return;
    setRemovingRecipeId(recipe_id);
    try {
      const res = await fetch('http://localhost:3000/api/groceryList/recipe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ recipe_id }),
      });
      if (res.ok) {
        setItems(items.filter(i => String(i.recipe_id) !== String(recipe_id)));
      } else {
        const data = await res.json();
        setError(data.error || 'Errore nella rimozione della ricetta dalla lista');
      }
    } catch {
      setError('Errore di rete.');
    } finally {
      setRemovingRecipeId(null);
    }
  };

  // Utility: calcola porzioni attuali per una ricetta nella lista
  const getPorzioniInfo = (groupItems) => {
    if (!groupItems.length) return { attuali: 1, originali: 1 };
    const porzioniOriginali = groupItems[0].porzioni_originali ? Number(groupItems[0].porzioni_originali) : 1;
    // Calcola la media delle porzioni attuali su tutti gli ingredienti (più robusto)
    const porzioniAttuali = Math.max(1, Math.round(
      groupItems.reduce((sum, item) => {
        const qtyAttuale = Number(item.quantity);
        const qtyOriginale = item.grammi_originali ? Number(item.grammi_originali) : qtyAttuale;
        return sum + (qtyAttuale / qtyOriginale * porzioniOriginali);
      }, 0) / groupItems.length
    ));
    return { attuali: porzioniAttuali, originali: porzioniOriginali };
  };

  // Funzione per cambiare le porzioni di una ricetta nella lista
  const handleChangePorzioni = async (recipeId, delta) => {
    const groupItems = items.filter(i => String(i.recipe_id) === String(recipeId));
    if (!groupItems.length) return;
    const { attuali: porzioniAttuali, originali: porzioniOriginali } = getPorzioniInfo(groupItems);
    const nuovePorzioni = Math.max(1, porzioniAttuali + delta);
    const moltiplicatore = nuovePorzioni / porzioniAttuali;
    const newItems = await Promise.all(groupItems.map(async (item) => {
      const newQty = Math.max(1, Math.round(item.quantity * moltiplicatore));
      try {
        const res = await fetch('http://localhost:3000/api/groceryList/ingredient', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ ingredient: item.ingredient, quantity: newQty, recipe_id: item.recipe_id }),
        });
        if (res.ok) {
          return { ...item, quantity: newQty };
        } else {
          return item;
        }
      } catch {
        return item;
      }
    }));
    setItems(prev => prev.map(i => String(i.recipe_id) === String(recipeId) ? (newItems.find(ni => ni.ingredient === i.ingredient) || i) : i));
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Overlay bianco trasparente sotto la navbar (navbar height 64px) */}
      <div className="absolute left-0 right-0 top-0" style={{ height: '100%', background: 'rgba(255,255,255,0.7)', zIndex: 0, pointerEvents: 'none' }} />
      <div className="relative z-10 w-full flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <h1 className="text-2xl font-bold mb-4 text-refresh-blue">La tua lista della spesa</h1>
        {loading && <div>Caricamento...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div>La lista della spesa è vuota.</div>
        )}
        {!loading && !error && items.length > 0 && (
          <div className="w-full max-w-lg bg-white rounded shadow p-6">
            {/* Raggruppa per ricetta */}
            {Object.entries(
              items.reduce((acc, item) => {
                const key = item.recipe_id || 'manual';
                if (!acc[key]) acc[key] = { recipe_name: item.recipe_name, recipe_image: item.recipe_image, items: [] };
                acc[key].items.push(item);
                return acc;
              }, {})
            ).map(([recipeId, group]) => (
              <div key={recipeId} className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  {group.recipe_image && <img src={group.recipe_image} alt={group.recipe_name} className="w-10 h-10 object-cover rounded" />}
                  <h2 className="text-lg font-semibold text-refresh-pink">{group.recipe_name || 'Aggiunti manualmente'}</h2>
                  {group.recipe_name && (
                    <div className="flex items-center gap-1 ml-auto justify-end sticky top-0 right-0 bg-white z-10" style={{ minWidth: '120px' }}>
                      <button
                        className="px-2 py-1 rounded bg-refresh-blue text-white text-xs font-bold hover:bg-refresh-pink transition"
                        onClick={() => handleChangePorzioni(recipeId, -1)}
                        type="button"
                        aria-label="Diminuisci porzioni"
                      >-</button>
                      <span className="px-2 font-bold text-refresh-blue text-base select-none w-16 text-right">
                        {(() => {
                          const info = getPorzioniInfo(group.items);
                          return `${info.attuali} porz.`;
                        })()}
                      </span>
                      <button
                        className="px-2 py-1 rounded bg-refresh-blue text-white text-xs font-bold hover:bg-refresh-pink transition"
                        onClick={() => handleChangePorzioni(recipeId, 1)}
                        type="button"
                        aria-label="Aumenta porzioni"
                      >+</button>
                    </div>
                  )}
                  {group.recipe_name && (
                    <button
                      className={`ml-2 px-2 py-1 rounded bg-refresh-pink text-white text-xs font-bold hover:bg-refresh-blue transition ${removingRecipeId === recipeId ? 'opacity-60 pointer-events-none' : ''}`}
                      onClick={() => handleRemoveRecipe(recipeId, group.recipe_name)}
                      disabled={removingRecipeId === recipeId}
                    >
                      {removingRecipeId === recipeId ? 'Rimozione...' : 'Rimuovi'}
                    </button>
                  )}
                </div>
                <ul className="divide-y">
                  {group.items.map((item, idx) => (
                    <li key={item.ingredient + '-' + item.recipe_id} className="flex items-center gap-4 py-2 border-b last:border-b-0">
                      <span className="font-medium w-1/3 min-w-[120px]">{item.ingredient}</span>
                      {editIndex === items.findIndex(i => i.ingredient === item.ingredient && i.recipe_id === item.recipe_id) ? (
                        <div className="flex items-center gap-2 w-1/3 min-w-[120px]">
                          <input
                            type="number"
                            min={1}
                            value={editValue}
                            onChange={e => setEditValue(Number(e.target.value))}
                            className="border rounded w-16 p-1"
                          />
                          <span className="text-gray-500 font-normal">{item.unita ? item.unita : 'g'}</span>
                        </div>
                      ) : (
                        <span className="w-1/3 min-w-[120px] text-center">{item.quantity} <span className="text-gray-500 font-normal">{item.unita ? item.unita : 'g'}</span></span>
                      )}
                      <div className="flex items-center gap-2 w-1/3 min-w-[120px] justify-end">
                        {editIndex === items.findIndex(i => i.ingredient === item.ingredient && i.recipe_id === item.recipe_id) ? (
                          <>
                            <button
                              className="bg-green-500 text-white px-2 py-1 rounded"
                              onClick={() => handleEditSave(item.ingredient, item.recipe_id)}
                            >Salva</button>
                            <button
                              className="bg-gray-300 text-gray-700 px-2 py-1 rounded"
                              onClick={() => setEditIndex(null)}
                            >Annulla</button>
                          </>
                        ) : (
                          <>
                            <button
                              className="bg-refresh-pink text-white px-2 py-1 rounded hover:bg-refresh-blue transition"
                              onClick={() => handleEdit(items.findIndex(i => i.ingredient === item.ingredient && i.recipe_id === item.recipe_id), item.quantity)}
                            >Modifica</button>
                            <button
                              className="bg-refresh-blue text-white px-2 py-1 rounded hover:bg-refresh-pink transition"
                              onClick={() => handleRemove(item.ingredient, item.recipe_id)}
                            >Rimuovi</button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <button
              className="mt-6 w-full bg-refresh-blue text-white font-bold py-2 rounded hover:bg-refresh-pink transition"
              onClick={handleClear}
            >Svuota elementi</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroceryList; 