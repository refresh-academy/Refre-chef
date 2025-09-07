import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { FaBell } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext.jsx';
import { API_BASE_URL } from '../apiConfig';

const NotificationDropdown = () => {
  const { user } = useUser();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');
  const notifRef = useRef(null);

  // Fetch notifications for logged-in user
  useEffect(() => {
    if (user) {
      setNotifLoading(true);
      setNotifError('');
      fetch(`${API_BASE_URL}/notifications`, {
        credentials: 'include',
      })
        .then(res => {
          if (res.status === 401 || res.status === 403) {
            setNotifError('Non autorizzato. Effettua di nuovo il login.');
            setNotifications([]);
            return [];
          }
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) setNotifications(data);
          else if (typeof data === 'object' && data !== null && data.error) setNotifError(data.error);
          else if (data !== undefined) setNotifError('Errore nel caricamento delle notifiche');
        })
        .catch(() => setNotifError('Errore di rete'))
        .finally(() => setNotifLoading(false));
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Close notification dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notifOpen]);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: 1 } : n));
    } catch { /* intentionally ignored */ }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) return null;

  return (
    <div className="relative mr-2" ref={notifRef}>
      <button
        className="relative focus:outline-none"
        aria-label="Notifiche"
        onClick={() => setNotifOpen((open) => !open)}
      >
        <FaBell className="text-2xl text-refresh-blue hover:text-refresh-pink transition" />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-pulse" 
            style={{ minWidth: '20px', textAlign: 'center' }}
          >
            {unreadCount}
          </span>
        )}
      </button>
      {notifOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-xs bg-white border rounded shadow-lg z-20 p-2">
          <div className="font-bold text-refresh-blue mb-2">Notifiche</div>
          {notifLoading ? (
            <div className="text-gray-500 text-sm">Caricamento...</div>
          ) : notifError ? (
            <div className="text-red-500 text-sm">{notifError}</div>
          ) : notifications.length === 0 ? (
            <div className="text-gray-500 text-sm">Nessuna notifica</div>
          ) : (
            <ul className="max-h-64 overflow-y-auto divide-y divide-gray-200">
              {notifications.map(n => (
                <li key={n.id} className={`p-2 flex flex-col gap-1 ${!n.read ? 'bg-refresh-blue/10' : ''}`}>
                  {n.type === 'comment' && n.data && (
                    <>
                      <span className="text-sm">
                        <b>{n.data.commenter}</b> ha commentato la tua ricetta <b>"{n.data.ricettaNome}"</b>:
                      </span>
                      <span className="text-gray-700 italic">"{n.data.testo}"</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Link 
                          to={`/ricetta/${n.data.ricettaId}`} 
                          className="text-refresh-blue hover:text-refresh-pink text-xs underline" 
                          onClick={() => { setNotifOpen(false); markAsRead(n.id); }}
                        >
                          Vedi ricetta
                        </Link>
                        {!n.read && (
                          <button 
                            className="text-xs text-gray-500 hover:text-refresh-pink underline" 
                            onClick={() => markAsRead(n.id)}
                          >
                            Segna come letta
                          </button>
                        )}
                      </div>
                    </>
                  )}
                  <span className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;