import logorefreChef from '/logorefreChef.png'
import { useState, useEffect } from 'react'
import {Outlet} from 'react-router'
import backGroundImg from '/background.webp'

const Benvenuti = () => {
    return (
        <>
        <div className="flex flex-col md:flex-row w-full h-screen relative">
            {/* Su mobile: stack verticale, su desktop: affiancate */}
            <img 
                className="flex-1 w-1/2 h-1/2 md:h-full object-cover" 
                src={backGroundImg}
                alt="Background"
            />
            <img 
                className="flex-1 w-1/2 h-1/2 md:h-full object-cover" 
                src={backGroundImg}
                alt="Background"
            />
            
            {/* Logo responsive */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <img 
                    src={logorefreChef} 
                    className="w-100 h-100 bg-white opacity-75 rounded-lg p-3 md:p-4 shadow-xl"
                    alt="Logo RefreChef"
                />
                <h1 className=" bg-white opacity-75 text-2xl text-cyan-600 text-shadow-md px-6 py-3 rounded-lg">Benvenuti su Refrechef!</h1>
            </div>
        </div>
        </>
    )
}

export default Benvenuti
