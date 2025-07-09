import { useEffect, useState } from 'react';

const GroceryList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState(1);

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

  const handleRemove = async (ingredient) => {
    if (!window.confirm(`Rimuovere "${ingredient}" dalla lista?`)) return;
    try {
      const res = await fetch('http://localhost:3000/api/groceryList/ingredient', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ ingredient }),
      });
      if (res.ok) {
        setItems(items.filter(i => i.ingredient !== ingredient));
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

  const handleEditSave = async (ingredient) => {
    if (editValue < 1) return;
    try {
      const res = await fetch('http://localhost:3000/api/groceryList/ingredient', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ ingredient, quantity: editValue }),
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <h1 className="text-2xl font-bold mb-4">La tua lista della spesa</h1>
      {loading && <div>Caricamento...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div>La lista della spesa è vuota.</div>
      )}
      {!loading && !error && items.length > 0 && (
        <div className="w-full max-w-lg bg-white rounded shadow p-6">
          <ul className="divide-y">
            {items.map((item, idx) => (
              <li key={item.ingredient} className="flex items-center gap-4 py-2 border-b last:border-b-0">
                <span className="font-medium w-1/3 min-w-[120px]">{item.ingredient}</span>
                {editIndex === idx ? (
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
                  {editIndex === idx ? (
                    <>
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded"
                        onClick={() => handleEditSave(item.ingredient)}
                      >Salva</button>
                      <button
                        className="bg-gray-300 text-gray-700 px-2 py-1 rounded"
                        onClick={() => setEditIndex(null)}
                      >Annulla</button>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() => handleEdit(idx, item.quantity)}
                      >Modifica</button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleRemove(item.ingredient)}
                      >Rimuovi</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <button
            className="mt-6 w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 transition"
            onClick={handleClear}
          >Svuota lista</button>
        </div>
      )}
    </div>
  );
};

export default GroceryList; 