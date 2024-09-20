import React from "react";
import { useState, useEffect } from "react";
import { getUserDetails } from "../../APIs/userDetails";

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDetails = await getUserDetails();
      if (userDetails) setUser(userDetails);
    };
    fetchUserDetails();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <div className="text-3xl">Hello {user.username} 👋</div>
      <div className="text-6xl font-bold">This is the homepage</div>
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
      </button>
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
