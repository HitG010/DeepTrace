import React from "react";
import { ChevronDown } from "lucide-react";
import { set } from "mongoose";
import { useState } from "react";

const Navbar = ({ active }) => {
    const [hamburger, setHamburger] = useState(false);
    function handlehamburger(){
        setHamburger(!hamburger);
    }
  return (
    <nav className="z-100 fixed top-0 px-12 py-4 flex justify-between items-center w-[85%] bg-[#252525] rounded-full mt-4">
      <a className="text-3xl font-bold leading-none" href="#">
        <p className="text-3xl font-semibold">DeepTrace</p>
      </a>
      <div className="lg:hidden">
        <button className="navbar-burger flex items-center text-blue-600 p-3">
          <svg
            className="block h-4 w-4 fill-current"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Mobile menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
          </svg>
        </button>
      </div>
      <ul className="hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 lg:flex lg:mx-auto lg:flex lg:items-center lg:w-auto lg:space-x-6">
        <li>
          <a
            className={
              active === 0
                ? `text-sm text-white hover:text-gray-500`
                : `text-sm text-gray-400 hover:text-gray-500`
            }
            href="/home"
          >
            Dashboard
          </a>
        </li>

        <li>
          <a
            className={
              active === 1
                ? "text-sm text-white hover:text-gray-500"
                : "text-sm text-gray-400 hover:text-gray-500"
            }
            href="/upload-video"
          >
            Upload Video
          </a>
        </li>

        <li>
          <a
            className={
              active === 2
                ? "text-sm text-white hover:text-gray-500"
                : "text-sm text-gray-400 hover:text-gray-500"
            }
            href="/upload-image"
          >
            Upload Image
          </a>
        </li>
        <li>
          <a
            className={
              active === 3
                ? "text-sm text-white hover:text-gray-500"
                : "text-sm text-gray-400 hover:text-gray-500"
            }
            href="/api"
          >
            API for businesses
          </a>
        </li>
      </ul>
      <div className="">
        {/* avatar */}
        <div className="flex gap-2">
        <div className="h-12 w-12 rounded-full bg-[#ffffff30] flex items-center justify-center">
        <svg
          class="h-1/2 w-1/2 text-secondary-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2 7.5 4.019 7.5 6.5zM20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h1 1 14H20z"></path>
        </svg>
        </div>
        <div className="flex flex-col items-center justify-center">
        {/* drop down svg*/}
        <ChevronDown onClick={handlehamburger}/>
        {/* dropdown */}
        {hamburger && <div className="absolute top-16 right-0 bg-[#252525] rounded-lg shadow-lg py-4 px-8 flex flex-col gap-2">
          <a href="#" className="block text-sm text-[#ffffff] hover:text-[#ffffff50]">
            Profile
          </a>
          <a href="#" className="block text-sm text-[#ffffff] hover:text-[#ffffff50]">
            Settings
          </a>
          <a href="#" className="block text-sm text-[#ffffff] hover:text-[#ffffff50]">
            Logout
          </a>
        </div>}
        </div>
        </div>
        {/* <button className="px-4 py-2 bg-[#252525] text-[#f1f3f5] rounded-full font-semibold text-xl mt-6">
                    Logout
                </button> */}
      </div>
    </nav>
  );
};

export default Navbar;
