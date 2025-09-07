import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { FaBell } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';
import logorefreChef from '/logorefreChef.png';

const NavigationBar = () => {
  const { user, logout } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
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
    <div className='flex flex-row bg-white shadow-md items-center w-full'>
      {/* Logo and main navigation */}
      <div className='flex flex-row items-center font-bold gap-5 p-2'>
        <Link to={'/'} className='flex flex-row items-center font-bold gap-5'>
          <img src={logorefreChef} className="w-10 h-10" alt="Refrechef-logo" />
          <p className='text-refresh-blue font-extrabold'>RefreChef</p>
        </Link>
        <Link to={'/ricette'} className='ml-4 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink rounded px-3 py-1 transition hidden md:inline'>
          Ricette
        </Link>
      </div>
      
      <div className="flex-1" />
      
      {/* Desktop navigation */}
      <div className="hidden md:flex flex-row items-center gap-2 pr-4">
        {user ? (
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
            
            {/* Notification dropdown */}
            <NotificationDropdown />
            
            {/* User dropdown */}
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
                      logout();
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
        )}
      </div>
      
      {/* Mobile menu */}
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
                <Link to="/add-recipe" className="px-4 py-2 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink border-b rounded transition" onClick={() => setMobileMenuOpen(false)}>
                  Crea ricetta
                </Link>
                <Link to={`/saved-recipes/${user.userId}`} className="px-4 py-2 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink border-b rounded transition" onClick={() => setMobileMenuOpen(false)}>
                  Ricette Salvate
                </Link>
                <Link to="/my-recipes" className="px-4 py-2 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink border-b rounded transition" onClick={() => setMobileMenuOpen(false)}>
                  Le mie ricette
                </Link>
                <Link to="/grocery-list" className="px-4 py-2 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink border-b rounded transition" onClick={() => setMobileMenuOpen(false)}>
                  Lista Spesa
                </Link>
                <button
                  className="px-4 py-2 text-left text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink border-b rounded transition"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to={'/login'} className="px-4 py-2 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink border-b rounded transition" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to={'/register'} className="px-4 py-2 text-refresh-blue font-semibold hover:bg-white hover:text-refresh-pink border-b rounded transition" onClick={() => setMobileMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationBar;