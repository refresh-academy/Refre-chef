import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router";
import  logorefreChef from '/logorefreChef.png'
import Home from './routes/Home.jsx'

const Layout = () => {
  return(<div className='min-h-screen flex flex-col'>
    <div className='flex flex-row bg-white'>
        <Link to={'/'} className='flex flex-row items-center text-just-eat font-bold gap-2 p-2'>
          <img src={logorefreChef} className="w-10 h-10" alt="Refrechef-logo" />
          <p className='text-black'>RefreChef</p>
        </Link>
        <Link to = {'/login'}>
        <p>Login</p></Link>
      </div>
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
