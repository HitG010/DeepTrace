import React from 'react'

const Navbar = () => {
    return (
        <nav className="z-100 fixed top-0 px-4 py-4 flex justify-between items-center w-[85%]">
            <a className="text-3xl font-bold leading-none" href="#">
                <p className='text-3xl font-semibold'>DeepTrace</p>
            </a>
            <div className="lg:hidden">
                <button className="navbar-burger flex items-center text-blue-600 p-3">
                    <svg className="block h-4 w-4 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <title>Mobile menu</title>
                        <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                    </svg>
                </button>
            </div>
            <ul className="hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 lg:flex lg:mx-auto lg:flex lg:items-center lg:w-auto lg:space-x-6">
                <li><a className="text-sm text-gray-400 hover:text-gray-500" href="#">How it works?</a></li>

                <li><a className="text-sm text-gray-400 hover:text-gray-500" href="#">API services</a></li>

                <li><a className="text-sm text-gray-400 hover:text-gray-500" href="#">Browser Extension</a></li>
            </ul>
            <a className="hidden lg:inline-block lg:ml-auto lg:mr-3 py-2.5 px-5 bg-[#f1f3f5] hover:bg-[#ddd] text-4 text-gray-900 font-bold  rounded-full transition duration-200" href="/login">Log In</a>
            <a className="hidden lg:inline-block lg:mr-3 py-2.5 px-5 border border-[#787878] hover:bg-[#252525] text-4 text-[#f1f3f5] font-bold  rounded-full transition duration-200" href="/signup">Sign Up</a>
        </nav>
    )
}

export default Navbar
