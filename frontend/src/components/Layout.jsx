import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import NavigationBar from './NavigationBar.jsx';
import FilterBar from './FilterBar.jsx';
import Footer from '../Footer.jsx';

const Layout = () => {
  const [search, setSearch] = useState('');
  const [maxTime, setMaxTime] = useState('');
  const [maxKcal, setMaxKcal] = useState('');
  const [alimentazione, setAlimentazione] = useState('');
  const [sortBy, setSortBy] = useState('nome');
  const location = useLocation();

  return (
    <div className='min-h-screen flex flex-col'>
      <NavigationBar />
      
      {/* Show filter bar only on /ricette page */}
      {location.pathname === '/ricette' && (
        <FilterBar 
          maxTime={maxTime}
          setMaxTime={setMaxTime}
          maxKcal={maxKcal}
          setMaxKcal={setMaxKcal}
          alimentazione={alimentazione}
          setAlimentazione={setAlimentazione}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      )}
      
      <Outlet context={
        location.pathname === '/ricette'
          ? { search, setSearch, maxTime, setMaxTime, maxKcal, setMaxKcal, alimentazione, setAlimentazione, sortBy, setSortBy }
          : { search: '', setSearch: () => { }, maxTime: '', setMaxTime: () => { }, maxKcal: '', setMaxKcal: () => { }, alimentazione: '', setAlimentazione: () => { }, sortBy: 'nome', setSortBy: () => { } }
      } />
      
      <Footer />
    </div>
  );
};

export default Layout;