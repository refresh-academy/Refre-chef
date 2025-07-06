import logorefreChef from '/logorefreChef.png'
import { Link } from 'react-router'
import backGroundImg from '/background.webp'

const Benvenuti = () => {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Background Image */}
            <img 
                src={backGroundImg}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover object-center z-0"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-white/20 z-10" />

            {/* Content */}
            <div className="relative z-20 flex flex-col items-center justify-center h-full px-6 text-center space-y-6">
                {/* Logo */}
                <div className="bg-white/80 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
                    <img 
                        src={logorefreChef} 
                        alt="Logo RefreChef"
                        className="w-48 md:w-64 object-contain"
                    />
                </div>

                {/* Heading */}
                <h1 className="text-3xl md:text-5xl font-bold text-cyan-700 drop-shadow-lg bg-white/80 px-6 py-3 rounded-xl backdrop-blur-sm">
                    Benvenuti su RefreChef!
                </h1>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 bg-white/80 px-4 py-2 rounded-lg backdrop-blur-sm"> Ricette deliziose con un pizzico di originalità </h2>

                {/* Link Button */}
                <Link 
                    to="/ricette" 
                    className="bg-cyan-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-cyan-700 transition-all duration-300"
                >
                    Vai alle ricette
                </Link>
            </div>
        </div>
    )
}

export default Benvenuti
