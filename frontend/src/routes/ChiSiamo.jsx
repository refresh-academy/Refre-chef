import React from 'react';

const ChiSiamo = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold text-refresh-blue mb-4">Chi siamo</h1>
        <p className="text-lg text-gray-700 mb-4">
          Benvenuto su <span className="font-semibold text-refresh-pink">RefreChef</span>!<br/>
          Siamo un team appassionato di cucina e tecnologia, con l'obiettivo di rendere la condivisione e la scoperta di ricette semplice, divertente e accessibile a tutti.
        </p>
        <p className="text-gray-600 mb-2">
          Il nostro progetto nasce dalla voglia di creare una community dove ogni chef, dal principiante al professionista, possa trovare ispirazione, salvare le proprie ricette preferite e contribuire con le proprie creazioni.
        </p>
        <p className="text-gray-600 mb-2">
          RefreChef è sviluppato con amore da un piccolo gruppo di sviluppatori e food lovers. Crediamo nella collaborazione, nella creatività e nella buona cucina!
        </p>
        <p className="text-gray-500 text-sm mt-6">
          &copy; {new Date().getFullYear()} RefreChef. Tutti i diritti riservati.
        </p>
      </div>
    </div>
  </div>
);

export default ChiSiamo; 