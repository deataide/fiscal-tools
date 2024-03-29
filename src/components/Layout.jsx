import React from 'react'
import { Link } from 'react-router-dom'

export default function Layout({children}) {
  return (
<div>

<header className='bg-gray-900 text-white h-20 flex justify-between items-center px-6'>
      <Link to="/fiscal-tools" className="text-2xl font-bold">
        Fiscal Tools
      </Link>
      <div>
        <Link title='Soon' to="/fiscal-tools" className="mr-4 text-white hover:border rounded-lg p-2 transition duration-300 ease-in-out">Sign-in</Link>
        <Link title='Soon' to="/fiscal-tools" className="text-white hover:border rounded-lg p-2 transition duration-300 ease-in-out">Log-in</Link>
      </div>
    </header>

 <main>{children}</main>


</div>
  )
}
