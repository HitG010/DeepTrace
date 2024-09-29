import React from "react";
import { useState, useEffect } from "react";
import { getUserDetails } from "../../APIs/userDetails";
import { fetchVideos, loadProvider } from "../../contractDeets";
import logo from '/src/assets/deeptrace_logo_transparent.png'


function Home() {
  const [user, setUser] = useState(null);
  // const [account, setAccount] = useState(null);
  async function getUserAddress() {
    await newProvider.send('eth_requestAccounts', []);
    const signer = newProvider.getSigner();
    const Useraccount = await signer.getAddress();
    setAccount(Useraccount);
  }
  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDetails = await getUserDetails();
      if (userDetails) setUser(userDetails);
    };
    fetchUserDetails();
  }, []);

  // using fetchVideos function to get the videos data
  // useEffect(() => {
  //   // loadProvider();
  //   // const contract = sendcontractAdd();
  //   const fetchVideosData = async () => {
  //     const videos = await fetchVideos();
  //     console.log("Fetched videos:", videos);
  //   };
  //   fetchVideosData();
  // }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      {/* <img src="deeptrace_logo_transparent.png" alt="DeepTrace Logo" className="h-24 w-24" /> */}
      {/* <div className='flex gap-[30px]'> */}
        <img src={logo} className='h-16 mb-16'></img>
      <div className="text-3xl">Hello {user.username} 👋</div>
      <div className="text-6xl font-bold">Welcome to DeepTrace</div>
      <div className="flex gap-4++">
      <button
        onClick={() => {
          window.location.href = "/upload-video";
        }}
        className="px-4 py-2 bg-[#f1f3f5] text-[#1e1e1e] rounded-full font-semibold text-xl mt-6"
      >
        Test A Video
      </button>
      <button
        onClick={() => {
          window.location.href =
            "https://0x46527403138b59e6ca8aba0bd37c77831f6a65b6.us.gaianet.network";
        }}
        className="px-4 py-2 bg-[#f1f3f5] text-[#1e1e1e] rounded-full font-semibold text-xl mt-6"
      >
        Chatbot
      </button></div>
      <button
        onClick={() => {
          window.location.href = "http://localhost:5000/logout";
        }}
        className="px-4 py-2 bg-[#252525] text-[#f1f3f5] rounded-full font-semibold text-xl mt-6"
      >
        Logout
      </button>
    </div>
  );
}

export default Home;
