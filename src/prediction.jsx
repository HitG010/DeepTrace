import { ArrowLeft, Loader, InfoIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { uploadVideo } from "./contractDeets.jsx";
import { ethers } from 'ethers';
import VideoStorage from './artifacts/contracts/Upload.sol/VideoStorage.json';
import { Buffer } from 'buffer';
import axios from "axios";
import process from 'process';
import multihashes from 'multihashes';
import Navbar from "./components/Navbar/navbar2";

function VideoUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [framesPerVideo, setFramesPerVideo] = useState(50); // Default value
  const [result, setResult] = useState(null);
  const [tier, setTier] = useState("tier1");
  const [LoaderActive, setLoaderActive] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // blockchain functions and utilities
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [videos, setVideos] = useState([]);
  // const [videoHash, setVideoHash] = useState('');

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

  // addVideo function
  const uploadVideo = async (file, result) => {
    if (!contract || !file) {
      console.error('Contract not loaded');
      return;
    }
    try{
      const formData = new FormData();
      formData.append("file", file);
      //using Pinata SDK to upload the video to IPFS and then get the hash
      const resFile = await axios({
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        headers: {
          'Content-Type': "multipart/form-data",
          'pinata_api_key': "14cbfa5b8e02de8adae9",
          'pinata_secret_api_key': "ddef17076bf1b4244d06c8a010743a1cefd8a5b483ea9cec3d1e1c1429a117ae"

        },
        data: formData
      });

      console.log('File uploaded to IPFS:', resFile.data.IpfsHash);
      const ipfshash = resFile.data.IpfsHash;
      // setVideoHash(ipfshash);
      
      // arrify the hash
      const deocdedHash = multihashes.decode(multihashes.fromB58String(ipfshash));
      const videoHash = Buffer.from(deocdedHash.digest).toString('hex');
      
      console.log('Video Hash:', videoHash);
        const tx = await contract.addVideo(videoHash, result);
        await tx.wait();
        console.log('Video uploaded successfully');
        alert('Video uploaded successfully');
    }
    catch(err){
      console.log(err);
      alert('An error occurred while uploading the video.');
    }
  }

  // get user videos function
  const fetchUserVideos = async () => {
    if(!contract){
      console.error('Contract not loaded');
      return;
    }
    try {
      const videos = await contract.getUserVideos(account);
      console.log('Fetched videos:', videos);
      return videos;
    } catch (err) {
      console.error('Error fetching videos:', err);
      alert('An error occurred while fetching videos.');
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a video file.");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("frames_per_video", framesPerVideo);

    setLoaderActive(true); // Show loader

    try {
      const response = await fetch("http://127.0.0.1:8080/upload-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Video upload failed");
      }

      const data = await response.json();
      setResult(data);

      if (data.mean_score < 0.5) {
        uploadVideo(file, "Real");
      } else {
        uploadVideo(file, "Deepfake");
      }

      navigate("/result", { state: { result: data, fileName: file.name } });
    } catch (error) {
      console.error(error);
      alert("An error occurred while uploading the video.");
    } finally {
      setLoaderActive(false); // Hide loader when upload finishes
    }
  };

  return (
    <div className="relative flex flex-col justify-center items-center h-screen">
    <Navbar active={1}/>
      {/* Loader Mask */}
      {LoaderActive && (
        <div className="absolute inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60">
          <Loader size={64} className="animate-spin text-white" />
          <div className="text-white text-2xl font-semibold ml-4">
            Uploading Video...
          </div>
        </div>
      )}

      {/* Page Content */}
      <div
        className={`w-screen flex justify-evenly ${
          LoaderActive ? "opacity-50" : ""
        }`}
      >
        <div className="tiers flex flex-col gap-4">
          {/* <button
            className="w-fit flex items-center gap-2 py-2.5 px-5 bg-[#1e1e1e] hover:bg-[#252525] text-[#f1f3f5] text-[0.85rem] rounded-full"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft /> Return To Homepage
          </button> */}
          <div className="text-5xl font-semibold">Upload Video</div>
          <div className="text-2xl font-medium">Select A Tier</div>
          {/* Tier selection */}
          <div className="bg-[#252525] px-6 py-3 rounded-lg border border-[#ffffff10] flex justify-center items-center gap-4">
            <input
              type="radio"
              id="tier1"
              name="tier"
              value="tier1"
              defaultChecked
              className="h-5 w-5"
              onClick={() => setFramesPerVideo(50)}
            />
            <label htmlFor="tier1">
              <div className="text-2xl font-semibold">Basic</div>
              <div>Analyze 50 frames for a 30fps video</div>
            </label>
          </div>
          <div className="bg-[#252525] px-6 py-3 rounded-lg border border-[#ffffff10] flex justify-center items-center gap-4">
            <input
              type="radio"
              id="tier2"
              name="tier"
              value="tier2"
              className="h-5 w-5"
              onClick={() => setFramesPerVideo(100)}
            />
            <label htmlFor="tier2">
              <div className="text-2xl font-semibold">Standard</div>
              <div>Analyze 100 frames for a 30fps video</div>
            </label>
          </div>
          <div className="bg-[#252525] px-6 py-3 rounded-lg border border-[#ffffff10] flex justify-center items-center gap-4">
            <input
              type="radio"
              id="tier3"
              name="tier"
              value="tier3"
              className="h-5 w-5"
              onClick={() => setFramesPerVideo(300)}
            />
            <label htmlFor="tier3">
              <div className="text-2xl font-semibold">Premium</div>
              <div>Analyze 300+ frames for a 30fps video</div>
            </label>
          </div>
        </div>

        {/* Video Upload Section */}
        <div className="flex flex-col justify-center items-center gap-4">
          {!file ? (
            <div className="">
              <label className="flex h-56 w-116 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-600 p-6">
                <div className="space-y-1 text-center">
                  <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-6 w-6 text-gray-900"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                      />
                    </svg>
                  </div>
                  <div className="text-white">
                    <a
                      href="#"
                      className="font-medium text-primary-500 hover:text-primary-700"
                    >
                      Click to upload
                    </a>{" "}
                    or drag and drop
                  </div>
                  <p className="text-sm text-gray-400">
                    mp4, mov, webm, avi, wmv (max 100MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          ) : (
            <div>
              <video width="400" controls>
                <source src={URL.createObjectURL(file)} type={file.type} />
                Your browser does not support HTML video.
              </video>
            </div>
          )}
          <div className="flex gap-4 justify-center items-center">
            <div>
              No. of Frames to be analyzed: <b>{framesPerVideo}</b>
            </div>
            {file && (
              <button
                onClick={() => setFile(null)}
                className="py-1.5 px-3 bg-[#1e1e1e] hover:bg-[#252525] text-red-600 font-semibold rounded-full"
              >
                Remove Video
              </button>
            )}
          </div>

          <button
            onClick={handleUpload}
            className="py-2.5 px-5 bg-[#f1f3f5] hover:bg-[#ddd] text-[1.185rem] text-gray-900 font-semibold rounded-full"
          >
            Upload
          </button>

          {result && (
            <div>
              <h3>Results</h3>
              <p>Mean Score: {result.mean_score}</p>
              <p className="w-96 break-words">
                Pred Scores: {JSON.stringify(result.pred_scores)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoUpload;
