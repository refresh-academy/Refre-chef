import { useState, useRef, useEffect } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, Link, Outlet, useLocation } from "react-router";
import  logorefreChef from '/logorefreChef.png'
import Home from './routes/Home.jsx'
import Login from './routes/Login.jsx'
import Registration from './routes/Registration.jsx'
import SavedRecipes from './routes/SavedRecipes.jsx'
import AddRecipe from './routes/AddRecipe.jsx'
import Ricetta from './routes/Ricetta.jsx'


const Layout = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
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
        </div>
        {location.pathname === '/' && (
          <div className="flex-1 flex justify-center">
            <input
              type="text"
              placeholder="Cerca nelle ricette..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-72 p-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-refresh-blue"
            />
          </div>
        )}
        <div className="flex-1" />
        <div className="flex flex-row items-center gap-2 pr-4">
          {user ? (
            <>
              <Link to="/add-recipe" className="flex items-center justify-center pr-4">
                <p>Crea ricetta</p>
              </Link>
              <Link to={`/saved-recipes/${user.userId}`} className="flex items-center justify-center pr-10">
                <p>Ricette Salvate</p>
              </Link>
              <div className="relative" ref={dropdownRef}>
                <span
                  className="pr-8 cursor-pointer select-none"
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  Benvenuto, {user.nickname}!
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
      </div>
      <div className='flex flex-row bg-refresh-light-blue items-center w-screen px-20 py-4'>
        <h1 className='text-black text-2xl font-bold'>Questa è la navbar</h1>
      </div>
      <Outlet context={location.pathname === '/' ? { search, setSearch } : { search: '', setSearch: () => {} }} />
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
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/saved-recipes/:userId" element={<SavedRecipes />} />
          <Route path="/add-recipe" element={<AddRecipe user={user} />} />
          <Route path="/ricetta/:id" element={<Ricetta user={user} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
