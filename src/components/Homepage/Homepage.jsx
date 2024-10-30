import React from "react";
import { useState, useEffect } from "react";
import { getUserDetails } from "../../APIs/userDetails";
// import { fetchVideos, loadProvider } from "../../contractDeets";
import logo from '/src/assets/deeptrace_logo_transparent.png'
import { ethers } from 'ethers';
import VideoStorage from '../../artifacts/contracts/Upload.sol/VideoStorage.json';
import multihashes from 'multihashes';


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

  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [videos, setVideos] = useState([]);
  useEffect(() => {
    async function loadProvider() {
      // Ensure the provider is loaded only if Metamask is available
      if (window.ethereum) {
        const isBrowser = typeof window !== "undefined";
        const newProvider = isBrowser ? new ethers.providers.Web3Provider(window.ethereum) : null;
        
        // Request wallet connection and get account details
        await newProvider.send('eth_requestAccounts', []);
        const signer = newProvider.getSigner();
        const Useraccount = await signer.getAddress();
        setAccount(Useraccount);
        
        // Load contract
        const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
        const newContract = new ethers.Contract(contractAddress, VideoStorage.abi, signer);
        setContract(newContract);
        
        console.log('Connected account:', account);
        console.log('Contract:', newContract);
      } else {
        console.error('Ethereum object not found, install MetaMask.');
        alert('MetaMask not installed! Please install MetaMask to continue.');
      }
    }

    loadProvider();
  }, []);
  useEffect(() => {
    const fetchUserVideos = async () => {
      if(!contract){
        console.error('Contract not loaded');
        return;
      }
      try {
        const videos = await contract.getUserVideos(account);
        console.log('Fetched videos:', videos);
        setVideos(videos);
      } catch (err) {
        console.error('Error fetching videos:', err);
        alert('An error occurred while fetching videos.');
      }
    };
    fetchUserVideos();
  }, [contract, account]);

  // converting decodedhashes to ipfs original hashes fo all the videos
  // for (let i = 0; i < videos.length; i++) {
  //   const originalipfshash = multihashes.toB58String(multihashes.encode(videos[i].videoHash, 'sha2-256'));
  //   videos[i].videoHash = originalipfshash;
  // }

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
      {/* appending videos */}
      <div className="text-3xl mt-8">Your Videos</div>
      <div className="flex flex-col gap-4 mt-4">
      {videos.length === 0 && (
          <div className="text-xl">No videos uploaded yet</div>
      )}

        {videos.length !== 0 && videos.map((video, index) => (
          <div key={index} className="flex gap-4 items-center">
            {video.videoHash} {video.result}
            <div className="text-2xl">{video.title}</div>
            {/* <video
              src={`https://aqua-rear-kite-738.mypinata.cloud/ipfs/${video.videoHash}?pinataGatewayToken=mlfXfOkZ2EXqWeNvbaqvIF-Q7j9JlzEaFYCudxHSMxIvMjuygNYRJEVR--gFd6O6`}
              controls
              className="h-48"
            ></video> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
