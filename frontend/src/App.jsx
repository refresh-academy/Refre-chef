import { useState, useRef, useEffect } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, Link, Outlet, useLocation } from "react-router";
import  logorefreChef from '/logorefreChef.png'
import Home from './routes/Home.jsx'
import Benvenuti from './routes/Welcome.jsx'
import Login from './routes/Login.jsx'
import Registration from './routes/Registration.jsx'
import SavedRecipes from './routes/SavedRecipes.jsx'
import AddRecipe from './routes/AddRecipe.jsx'
import Ricetta from './routes/Ricetta.jsx'
import GroceryList from './routes/GroceryList.jsx'


const Layout = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [maxTime, setMaxTime] = useState('');
  const [maxKcal, setMaxKcal] = useState('');
  const [alimentazione, setAlimentazione] = useState('');
  const dropdownRef = useRef(null);
  const location = useLocation();
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
  return(<div className='min-h-screen flex flex-col'>
    <div className='flex flex-row bg-white shadow-md items-center w-screen'>
        <div className='flex flex-row items-center font-bold gap-5 p-2'>
          <Link to={'/'} className='flex flex-row items-center font-bold gap-5'>
            <img src={logorefreChef} className="w-10 h-10" alt="Refrechef-logo" />
            <p className='text-black'>RefreChef</p>
          </Link>
          <Link to={'/ricette'} className='ml-4 text-refresh-blue font-semibold hidden md:inline'>Ricette</Link>
        </div>
        <div className="flex-1" />
        {/* Desktop nav links */}
        <div className="hidden md:flex flex-row items-center gap-2 pr-4">
          {user ? (
            <>
              <Link to="/add-recipe" className="flex items-center justify-center pr-4">
                <p>Crea ricetta</p>
              </Link>
              <Link to={`/saved-recipes/${user.userId}`} className="flex items-center justify-center pr-10">
                <p>Ricette Salvate</p>
              </Link>
              <Link to="/grocery-list" className="flex items-center justify-center pr-10">
                <p>Lista Spesa</p>
              </Link>
              <div className="relative" ref={dropdownRef}>
                <span
                  className="pr-8 cursor-pointer select-none"
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  Welcome, {user.nickname}!
                </span>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        if (typeof window.setUser === 'function') window.setUser(null);
                        localStorage.removeItem('userId');
                        setDropdownOpen(false);
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
              <Link to={'/login'} className="flex items-center justify-center pr-8">
                <p>Login</p>
              </Link>
              <Link to={'/register'} className="flex items-center justify-center pr-10">
                <p>Register</p>
              </Link>
            </>
          )}
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
              <Link to={'/ricette'} className="px-4 py-2 hover:bg-gray-100 border-b" onClick={() => setMobileMenuOpen(false)}>Ricette</Link>
              {user ? (
                <>
                  <Link to="/add-recipe" className="px-4 py-2 hover:bg-gray-100 border-b" onClick={() => setMobileMenuOpen(false)}>Crea ricetta</Link>
                  <Link to={`/saved-recipes/${user.userId}`} className="px-4 py-2 hover:bg-gray-100 border-b" onClick={() => setMobileMenuOpen(false)}>Ricette Salvate</Link>
                  <Link to="/grocery-list" className="px-4 py-2 hover:bg-gray-100 border-b" onClick={() => setMobileMenuOpen(false)}>Lista Spesa</Link>
                  <button
                    className="px-4 py-2 text-left hover:bg-gray-100 border-b"
                    onClick={() => {
                      if (typeof window.setUser === 'function') window.setUser(null);
                      localStorage.removeItem('userId');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to={'/login'} className="px-4 py-2 hover:bg-gray-100 border-b" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link to={'/register'} className="px-4 py-2 hover:bg-gray-100 border-b" onClick={() => setMobileMenuOpen(false)}>Register</Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Only show the second navbar on /ricette */}
      {location.pathname === '/ricette' && (
        <div className='flex flex-row bg-white items-center w-screen px-20 py-4'>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Cerca nelle ricette..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-72 p-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-refresh-blue"
            />
            <input
              type="number"
              min="0"
              value={maxTime}
              onChange={e => setMaxTime(e.target.value)}
              placeholder="Tempo massimo (min)"
              className="w-40 p-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-refresh-blue"
              style={{maxWidth: '160px'}}
            />
            <input
              type="number"
              min="0"
              value={maxKcal}
              onChange={e => setMaxKcal(e.target.value)}
              placeholder="Chilocalorie massime"
              className="w-40 p-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-refresh-blue"
              style={{maxWidth: '160px'}}
            />
            <select
              value={alimentazione}
              onChange={e => setAlimentazione(e.target.value)}
              className="w-48 p-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-refresh-blue"
            >
              <option value="">🍽️ Tutte le alimentazioni</option>
              <option value="Onnivora">🥩 Onnivoro</option>
              <option value="Vegetariana">🥬 Vegetariano</option>
              <option value="Vegan">🌱 Vegano</option>
            </select>
          </div>
        </div>
      )}
      <Outlet context={
        location.pathname === '/ricette'
          ? { search, setSearch, maxTime, setMaxTime, maxKcal, setMaxKcal, alimentazione, setAlimentazione }
          : { search: '', setSearch: () => {}, maxTime: '', setMaxTime: () => {}, maxKcal: '', setMaxKcal: () => {}, alimentazione: '', setAlimentazione: () => {} }
      } />
  </div>)
}

function App() {
  const [user, setUser] = useState(null);
  // Make setUser available globally for logout in Layout
  useEffect(() => { window.setUser = setUser; }, [setUser]);
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout user={user} />}>
          <Route path="/" element={<Benvenuti />} />
          <Route path="/ricette" element={<Home user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/saved-recipes/:userId" element={<SavedRecipes />} />
          <Route path="/saved-recipes" element={<SavedRecipes />} />
          <Route path="/add-recipe" element={<AddRecipe user={user} />} />
          <Route path="/ricetta/:id" element={<Ricetta user={user} />} />
          <Route path="/grocery-list" element={<GroceryList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
