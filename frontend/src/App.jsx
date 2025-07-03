import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router";
import  logorefreChef from '/logorefreChef.png'
import Home from './routes/Home.jsx'

const Layout = () => {
  return(<div className='min-h-screen flex flex-col'>
    <div className='flex flex-row bg-white shadow-md items-center w-screen'>
        <Link to={'/'} className='flex flex-row items-center font-bold gap-5 p-2'>
          <img src={logorefreChef} className="w-10 h-10" alt="Refrechef-logo" />
          <p className='text-black'>RefreChef</p>
        </Link>
        <div className="flex-2" />
        <Link to={'/login'} className="flex items-center justify-center pr-20">
          <p>Login</p>
        </Link>
      </div>
      <div className='flex flex-row bg-refresh-light-blue items-center w-screen px-20 py-4'>
        <h1 className='text-black text-2xl font-bold'>Questa è la navbar</h1>
      </div>
      <Outlet />
  </div>)
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
