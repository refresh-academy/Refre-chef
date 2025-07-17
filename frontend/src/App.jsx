import { useState, useRef, useEffect } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, Link, Outlet, useLocation, useNavigate } from "react-router";
import  logorefreChef from '/logorefreChef.png'
import Ricettario from './routes/Ricettario.jsx'
import Login from './routes/Login.jsx'
import Registration from './routes/Registration.jsx'
import SavedRecipes from './routes/SavedRecipes.jsx'
import AddRecipe from './routes/AddRecipe.jsx'
import Ricetta from './routes/Ricetta.jsx'
import GroceryList from './routes/GroceryList.jsx'
import NotFound from './routes/NotFound.jsx'
import HomePage from './routes/HomePage.jsx'
import MyRecipes from './routes/MyRecipes.jsx'
import ChefProfile from './routes/ChefProfile.jsx';
import ChiSiamo from './routes/ChiSiamo.jsx';
import Privacy from './routes/Privacy.jsx';
import Contatti from './routes/Contatti.jsx';
import { jwtDecode } from 'jwt-decode';
import Footer from './Footer.jsx';


const Layout = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [maxTime, setMaxTime] = useState('');
  const [maxKcal, setMaxKcal] = useState('');
  const [alimentazione, setAlimentazione] = useState('');
  const [sortBy, setSortBy] = useState('nome');
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);
  return (
    <div className='min-h-screen flex flex-col'>
    <div className='flex flex-row bg-white shadow-md items-center w-full'>
        <div className='flex flex-row items-center font-bold gap-5 p-2'>
          <Link to={'/'} className='flex flex-row items-center font-bold gap-5'>
            <img src={logorefreChef} className="w-10 h-10" alt="Refrechef-logo" />
            <p className='text-refresh-blue font-extrabold'>RefreChef</p>
          </Link>
          <Link to={'/ricette'} className='ml-4 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink rounded px-3 py-1 transition hidden md:inline'>Ricette</Link>
        </div>
        <div className="flex-1" />
        {/* Desktop nav links */}
        <div className="hidden md:flex flex-row items-center gap-2 pr-4">
          {
            user ? (
              <>
                <Link to="/add-recipe" className="flex items-center justify-center pr-4 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink rounded px-3 py-1 transition">
                  <p>Crea ricetta</p>
                </Link>
                <Link to={`/saved-recipes/${user.userId}`} className="flex items-center justify-center pr-10 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink rounded px-3 py-1 transition">
                  <p>Ricette Salvate</p>
                </Link>
                <Link to="/my-recipes" className="flex items-center justify-center pr-10 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink rounded px-3 py-1 transition">
                  <p>Le mie ricette</p>
                </Link>
                <Link to="/grocery-list" className="flex items-center justify-center pr-10 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink rounded px-3 py-1 transition">
                  <p>Lista Spesa</p>
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <span
                    className="pr-8 cursor-pointer select-none text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink rounded px-3 py-1 transition"
                    onClick={() => setDropdownOpen((open) => !open)}
                  >
                    Welcome, {user.nickname}!
                  </span>
                  {dropdownOpen && (
                    <div className=" absolute right-0 mt-2 w-32 bg-white border rounded shadow z-15">
                      <button
                        className="w-full text-left px-4 py-2 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink rounded transition"
                        onClick={() => {
                          if (typeof window.setUser === 'function') window.setUser(null);
                          localStorage.removeItem('userId');
                          setDropdownOpen(false);
                          navigate('/');
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to={'/login'} className="flex items-center justify-center pr-8 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink rounded px-3 py-1 transition">
                  <p>Login</p>
                </Link>
                <Link to={'/register'} className="flex items-center justify-center pr-10 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink rounded px-3 py-1 transition">
                  <p>Register</p>
                </Link>
              </>
            )
          }
        </div>
        {/* Hamburger menu for mobile */}
        <div className="md:hidden flex items-center pr-4">
          <button
            className="text-3xl focus:outline-none"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Apri menu"
          >
            &#9776;
          </button>
          {mobileMenuOpen && (
            <div className="absolute top-16 right-4 bg-white border rounded shadow-lg z-50 flex flex-col min-w-[180px]">
              {user ? (
                <>
                  <Link to="/add-recipe" className="px-4 py-2 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink border-b rounded transition" onClick={() => setMobileMenuOpen(false)}>Crea ricetta</Link>
                  <Link to={`/saved-recipes/${user.userId}`} className="px-4 py-2 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink border-b rounded transition" onClick={() => setMobileMenuOpen(false)}>Ricette Salvate</Link>
                  <Link to="/my-recipes" className="px-4 py-2 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink border-b rounded transition" onClick={() => setMobileMenuOpen(false)}>Le mie ricette</Link>
                  <Link to="/grocery-list" className="px-4 py-2 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink border-b rounded transition" onClick={() => setMobileMenuOpen(false)}>Lista Spesa</Link>
                  <button
                    className="px-4 py-2 text-left text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink border-b rounded transition"
                    onClick={() => {
                      if (typeof window.setUser === 'function') window.setUser(null);
                      localStorage.removeItem('userId');
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to={'/login'} className="px-4 py-2 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink border-b rounded transition" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link to={'/register'} className="px-4 py-2 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink border-b rounded transition" onClick={() => setMobileMenuOpen(false)}>Register</Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Only show the second navbar on /ricette */}
      {location.pathname === '/ricette' && (
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
            <div className="filter-bar backdrop-blur-md bg-white/80 border-2 border-refresh-blue shadow-xl rounded-2xl px-8 py-6 flex flex-row gap-8 items-end transition-all duration-300" style={{minWidth: 'fit-content'}}>
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
              <button
                className="ml-8 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-refresh-blue to-refresh-pink text-white font-bold shadow-lg border-none transition-all duration-200 hover:from-refresh-pink hover:to-refresh-blue hover:scale-105 focus:outline-none focus:ring-2 focus:ring-refresh-pink focus:ring-offset-2"
                onClick={() => { setMaxTime(''); setMaxKcal(''); setAlimentazione(''); setSortBy('nome'); }}
                style={{height: '40px', minWidth: '140px'}}
                title="Reset filtri"
              >
                <i className="fa-solid fa-rotate-left text-lg" />
                Reset filtri
              </button>
            </div>
          </div>
        </>
      )}
      <Outlet context={
        location.pathname === '/ricette'
          ? { search, setSearch, maxTime, setMaxTime, maxKcal, setMaxKcal, alimentazione, setAlimentazione, sortBy, setSortBy }
          : { search: '', setSearch: () => {}, maxTime: '', setMaxTime: () => {}, maxKcal: '', setMaxKcal: () => {}, alimentazione: '', setAlimentazione: () => {}, sortBy: 'nome', setSortBy: () => {} }
      } />
      <Footer />
    </div>
  );
}

function ProtectedGroceryList({ user }) {
  const navigate = useNavigate();
  if (!user) {
    navigate('/login');
    return null;
  }
  return <GroceryList />;
}

function CookieConsentBanner({ onConsentChange, forceShow }) {
  const [visible, setVisible] = useState(forceShow);
  useEffect(() => { setVisible(forceShow); }, [forceShow]);
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      zIndex: 1000,
      background: 'rgba(255,255,255,0.98)',
      borderTop: '1px solid #e0e0e0',
      boxShadow: '0 -2px 12px rgba(0,0,0,0.07)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontSize: '1rem',
      color: '#333',
    }}>
      <span style={{ marginRight: '1.5rem' }}>
        Questo sito utilizza solo cookie tecnici necessari al funzionamento. Nessun cookie di profilazione viene utilizzato.
      </span>
      <button
        onClick={() => {
          localStorage.setItem('cookieConsent', 'true');
          setVisible(false);
          if (onConsentChange) onConsentChange(true);
        }}
        style={{
          background: 'linear-gradient(90deg, #3b82f6 0%, #ec4899 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.5rem 1.5rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontSize: '1rem',
        }}
        aria-label="Accetta cookie tecnici"
      >
        OK
      </button>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [cookieConsent, setCookieConsent] = useState(() => {
    const val = localStorage.getItem('cookieConsent');
    return val === 'true' ? true : val === 'false' ? false : null;
  });
  // Show banner on first visit if no choice made
  const [showConsentBanner, setShowConsentBanner] = useState(() => {
    const val = localStorage.getItem('cookieConsent');
    return val !== 'true';
  });
  // Make setUser available globally for logout in Layout
  useEffect(() => { window.setUser = setUser; }, [setUser]);
  // Persist user session after refresh ONLY if cookies are accepted
  useEffect(() => {
    if (cookieConsent) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded && decoded.userId && decoded.nickname) {
            setUser({ userId: decoded.userId, nickname: decoded.nickname });
          }
        } catch {
          // Ignore invalid token
        }
      }
    } else if (cookieConsent === false) {
      // Remove all session data if cookies are refused
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      setUser(null);
    }
  }, [cookieConsent]);
  // Block login, registration, and save if cookies are refused
  const showCookieBlock = (msg) => {
    if (cookieConsent === null) {
      setShowConsentBanner(true);
    } else {
      alert(msg || 'Devi accettare i cookie tecnici per usare questa funzionalità.');
    }
  };
  const handleConsentChange = (consent) => {
    setCookieConsent(consent);
    setShowConsentBanner(false);
  };
  return (
    <BrowserRouter>
      {/* Global background image below everything */}
      <div className="fixed inset-0 -z-10 w-full h-full bg-cover bg-center bg-no-repeat bg-fixed bg-white" style={{ backgroundImage: "url('/background.webp')" }} />
      <Routes>
        <Route element={<Layout user={user} cookieConsent={cookieConsent} showCookieBlock={showCookieBlock} />}> 
          <Route index element={<HomePage user={user} />} />
          <Route path="/ricette" element={<Ricettario user={user} />} />
          <Route path="/login" element={cookieConsent === false ? (() => { showCookieBlock('Devi accettare i cookie tecnici per effettuare il login.'); return null; })() : <Login setUser={setUser} />} />
          <Route path="/register" element={cookieConsent === false ? (() => { showCookieBlock('Devi accettare i cookie tecnici per registrarti.'); return null; })() : <Registration />} />
          <Route path="/saved-recipes/:userId" element={cookieConsent === false ? (() => { showCookieBlock('Devi accettare i cookie tecnici per salvare le ricette.'); return null; })() : <SavedRecipes />} />
          <Route path="/saved-recipes" element={cookieConsent === false ? (() => { showCookieBlock('Devi accettare i cookie tecnici per salvare le ricette.'); return null; })() : <SavedRecipes />} />
          <Route path="/add-recipe" element={cookieConsent === false ? (() => { showCookieBlock('Devi accettare i cookie tecnici per aggiungere ricette.'); return null; })() : <AddRecipe user={user} />} />
          <Route path="/edit-recipe/:id" element={cookieConsent === false ? (() => { showCookieBlock('Devi accettare i cookie tecnici per modificare ricette.'); return null; })() : <AddRecipe user={user} editMode={true} />} />
          <Route path="/ricetta/:id" element={<Ricetta user={user} />} />
          <Route path="/grocery-list" element={cookieConsent === false ? (() => { showCookieBlock('Devi accettare i cookie tecnici per usare la lista spesa.'); return null; })() : <ProtectedGroceryList user={user} />} />
          <Route path="/my-recipes" element={cookieConsent === false ? (() => { showCookieBlock('Devi accettare i cookie tecnici per vedere le tue ricette.'); return null; })() : <MyRecipes user={user} />} />
          <Route path="/chef/:authorId" element={<ChefProfile />} />
          <Route path="chi-siamo" element={<ChiSiamo />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="contatti" element={<Contatti />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <CookieConsentBanner onConsentChange={handleConsentChange} forceShow={showConsentBanner} />
    </BrowserRouter>
  )
}

export default App
