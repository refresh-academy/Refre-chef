import React from 'react';

const Privacy = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold text-refresh-blue mb-4">Privacy Policy</h1>
        <p className="text-gray-700 mb-4">
          La presente Privacy Policy descrive come RefreChef raccoglie, utilizza e protegge i dati personali degli utenti che utilizzano il nostro sito web.
        </p>
        <h2 className="text-xl font-semibold text-refresh-blue mt-6 mb-2">1. Titolare del trattamento</h2>
        <p className="text-gray-600 mb-2">
          RefreChef è gestito da un team di sviluppatori privati. Per qualsiasi richiesta relativa alla privacy, puoi contattarci tramite la sezione Contatti del sito.
        </p>
        <h2 className="text-xl font-semibold text-refresh-blue mt-6 mb-2">2. Dati raccolti</h2>
        <ul className="list-disc pl-6 text-gray-600 mb-2">
          <li><b>Dati forniti volontariamente:</b> nickname, email e password (criptata) al momento della registrazione.</li>
          <li><b>Dati relativi alle ricette:</b> ricette create, salvate e recensioni lasciate dagli utenti.</li>
        </ul>
        <h2 className="text-xl font-semibold text-refresh-blue mt-6 mb-2">3. Finalità del trattamento</h2>
        <ul className="list-disc pl-6 text-gray-600 mb-2">
          <li>Permettere la registrazione e l'autenticazione degli utenti.</li>
          <li>Gestire la creazione, il salvataggio e la condivisione di ricette.</li>
          <li>Consentire agli utenti di lasciare recensioni e valutazioni.</li>
          <li>Migliorare l'esperienza d'uso del sito.</li>
        </ul>
        <h2 className="text-xl font-semibold text-refresh-blue mt-6 mb-2">Cookie Policy</h2>
        <p className="text-gray-700 mb-4">
          Questo sito utilizza esclusivamente cookie tecnici e di sessione, necessari al corretto funzionamento della piattaforma (ad esempio per mantenere l'accesso dell'utente dopo il login).<br/>
          Non vengono utilizzati cookie di profilazione o di terze parti a fini pubblicitari o analitici.<br/>
          <b>Se l'utente non accetta i cookie tecnici, potrà comunque navigare il sito e consultare le ricette pubbliche, ma alcune funzionalità come il login, la registrazione, il salvataggio delle ricette e la personalizzazione dell'esperienza non saranno disponibili.</b>
        </p>
        <h2 className="text-xl font-semibold text-refresh-blue mt-6 mb-2">4. Conservazione dei dati</h2>
        <p className="text-gray-600 mb-2">
          I dati vengono conservati per il tempo strettamente necessario a fornire i servizi richiesti e a garantire la sicurezza e il corretto funzionamento della piattaforma.
        </p>
        <h2 className="text-xl font-semibold text-refresh-blue mt-6 mb-2">6. Condivisione dei dati</h2>
        <p className="text-gray-600 mb-2">
          I dati personali non vengono venduti né ceduti a terzi. Potranno essere comunicati solo in caso di obblighi di legge.
        </p>
        <h2 className="text-xl font-semibold text-refresh-blue mt-6 mb-2">7. Diritti dell'utente</h2>
        <p className="text-gray-600 mb-2">
          Gli utenti possono richiedere in qualsiasi momento la modifica o la cancellazione dei propri dati scrivendo tramite la sezione Contatti.
        </p>
        <h2 className="text-xl font-semibold text-refresh-blue mt-6 mb-2">8. Modifiche alla Privacy Policy</h2>
        <p className="text-gray-600 mb-2">
          La presente informativa potrà essere aggiornata. Le modifiche saranno pubblicate su questa pagina.
        </p>
        <p className="text-gray-500 text-sm mt-6">
          Ultimo aggiornamento: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  </div>
);

export default Privacy; 