import logorefreChef from '/logorefreChef.png';
import { Link } from 'react-router';
import backGroundImg from '/background.webp';

const Benvenuti = () => {
    return (
        <div className="relative w-full min-h-screen overflow-hidden font-sans">
            {/* Background Image */}
            <img 
                src={backGroundImg}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-white/10 z-10" />

            {/* Main Content */}
            <div className="relative z-20 flex flex-col items-center px-6 pt-18 md:pt-18 text-center space-y-8 pb-16">
                
                {/* Logo */}
                <div className="bg-white/60 p-4 rounded-3xl shadow-xl backdrop-blur-sm">
                    <img 
                        src={logorefreChef} 
                        alt="RefreChef Logo"
                        className="w-44 md:w-56 lg:w-64 object-contain"
                    />
                </div>

                {/* Headline */}
                <h1 className="text-xl md:text-4xl font-extrabold text-cyan-700 drop-shadow-xl bg-white/70 px-6 py-4 rounded-xl backdrop-blur-sm">
                    Benvenuti su RefreChef!
                </h1>

                {/* Subheading */}
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 bg-white/70 px-4 py-3 rounded-lg backdrop-blur-sm shadow">
                    Ricette deliziose con un pizzico di originalità
                </h2>

                {/* Description */}
                <p className="text-lg md:text-l text-gray-700 max-w-2xl bg-white/60 px-6 py-4 rounded-lg backdrop-blur-sm shadow-sm">
                    Scopri il mondo dei sapori autentici con le nostre ricette uniche e gustose, pensate per trasformare ogni pasto in un'esperienza indimenticabile.
                </p>

                {/* CTA Button */}
                <Link 
                    to="/ricette" 
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out"
                >
                    Vai alle ricette
                </Link>
            </div>
        </div>
    );
};

export default Benvenuti;
