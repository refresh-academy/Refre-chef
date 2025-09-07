import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";
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
import ForgotPassword from './routes/ForgotPassword.jsx';
import ResetPassword from './routes/ResetPassword.jsx';
import React from 'react';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import { UserProvider } from './contexts/UserContext.jsx';
import { ApiContext, apiFetch } from './contexts/ApiContext.jsx';
import Layout from './components/Layout.jsx';
import CookieConsentBanner from './components/CookieConsentBanner.jsx';





// AppContent component that uses the UserContext
function AppContent() {
  const [cookieConsent, setCookieConsent] = useState(() => {
    const val = localStorage.getItem('cookieConsent');
    return val === 'true' ? true : val === 'false' ? false : null;
  });
  // Show banner on first visit if no choice made
  const [showConsentBanner, setShowConsentBanner] = useState(() => {
    const val = localStorage.getItem('cookieConsent');
    return val !== 'true';
  });
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
    <ApiContext.Provider value={apiFetch}>
      {/* Global background image below everything */}
      <div className="fixed inset-0 -z-10 w-full h-full bg-cover bg-center bg-no-repeat bg-fixed bg-white" style={{ backgroundImage: "url('/background.webp')" }} />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/ricette" element={<Ricettario />} />
            <Route path="/login" element={
              <ProtectedRoute
                cookieConsent={cookieConsent}
                showCookieBlock={showCookieBlock}
                requireAuth={false}
                requireConsent={true}
                message="Devi accettare i cookie tecnici per effettuare il login."
              >
                <Login />
              </ProtectedRoute>
            } />
            <Route path="/register" element={
              <ProtectedRoute
                cookieConsent={cookieConsent}
                showCookieBlock={showCookieBlock}
                requireAuth={false}
                requireConsent={true}
                message="Devi accettare i cookie tecnici per effettuare la registrazione."
              >
                <Registration />
              </ProtectedRoute>
            } />
            <Route path="/saved-recipes/:userId" element={
              <ProtectedRoute
                cookieConsent={cookieConsent}
                showCookieBlock={showCookieBlock}
                requireAuth={true}
                requireConsent={true}
                message="Devi accettare i cookie tecnici per poter accedere alle ricette salvate"
              >
                <SavedRecipes />
              </ProtectedRoute>
            } />
            <Route path="/saved-recipes" element={
              <ProtectedRoute
                cookieConsent={cookieConsent}
                showCookieBlock={showCookieBlock}
                requireAuth={true}
                requireConsent={true}
                message="Devi accettare i cookie tecnici per poter accedere alle ricette salvate"
              >
                <SavedRecipes />
              </ProtectedRoute>
            } />
            <Route path="/add-recipe" element={
              <ProtectedRoute
                cookieConsent={cookieConsent}
                showCookieBlock={showCookieBlock}
                requireAuth={true}
                requireConsent={true}
                message="Devi accettare i cookie tecnici per aggiungere ricette."
              >
                <AddRecipe />
              </ProtectedRoute>
            } />
            <Route path="/edit-recipe/:id" element={
              <ProtectedRoute
                cookieConsent={cookieConsent}
                showCookieBlock={showCookieBlock}
                requireAuth={true}
                requireConsent={true}
                message="Devi accettare i cookie tecnici per modificare ricette."
              >
                <AddRecipe editMode={true} />
              </ProtectedRoute>
            } />
            <Route path="/ricetta/:id" element={<Ricetta />} />
            <Route path="/grocery-list" element={
              <ProtectedRoute
                cookieConsent={cookieConsent}
                showCookieBlock={showCookieBlock}
                requireAuth={true}
                requireConsent={true}
                message="Devi accettare i cookie tecnici per usare la lista spesa."
              >
                <GroceryList />
              </ProtectedRoute>
            } />
            <Route path="/my-recipes" element={
              <ProtectedRoute
                cookieConsent={cookieConsent}
                showCookieBlock={showCookieBlock}
                requireAuth={true}
                requireConsent={true}
                message="Devi accettare i cookie tecnici per vedere le tue ricette."
              >
                <MyRecipes />
              </ProtectedRoute>
            } />
            <Route path="/chef/:authorId" element={<ChefProfile />} />
            <Route path="chi-siamo" element={<ChiSiamo />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="contatti" element={<Contatti />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <CookieConsentBanner onConsentChange={handleConsentChange} forceShow={showConsentBanner} />
      </BrowserRouter>
    </ApiContext.Provider>
  )
}

// Main App component that provides the UserContext
function App() {
  const [cookieConsent] = useState(() => {
    const val = localStorage.getItem('cookieConsent');
    return val === 'true' ? true : val === 'false' ? false : null;
  });

  return (
    <UserProvider cookieConsent={cookieConsent}>
      <AppContent />
    </UserProvider>
  );
}

export default App
