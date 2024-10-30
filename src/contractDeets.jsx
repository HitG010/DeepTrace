import { ethers } from 'ethers';
import VideoStorage from './artifacts/contracts/Upload.sol/VideoStorage.json';
import { Buffer } from 'buffer';
window.Buffer = Buffer;
let account = '';
let contractGlobal = null;
async function loadProvider() {
  // Ensure the provider is loaded only if Metamask is available
  if (window.ethereum) {
    const isBrowser = typeof window !== "undefined";
    const newProvider = isBrowser ? new ethers.providers.Web3Provider(window.ethereum) : null;
    
    // Request wallet connection and get account details
    await newProvider.send('eth_requestAccounts', []);
    const signer = newProvider.getSigner();
    account = await signer.getAddress();
    console.log(account);
    
    // Load contract
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const newContract = new ethers.Contract(contractAddress, VideoStorage.abi, signer);
    contractGlobal = newContract;
    
    console.log('Connected account:', account);
    console.log('Contract:', newContract);
  } else {
    console.error('Ethereum object not found, install MetaMask.');
    alert('MetaMask not installed! Please install MetaMask to continue.');
  }
}

// Call the async function to load provider and contract
await loadProvider();

// uploading video to the blockchain
  const uploadVideo = async (file, result) => {
    if (!contractGlobal || !file) {
      console.error('Contract not loaded');
      return;
    }
    
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const videoHash = ethers.utils.keccak256(buffer);
      
      // Call the contract function
      try {
        console.log('Uploading video:', videoHash);
        const tx = await contractGlobal.addVideo(videoHash, result);
        await tx.wait();
        console.log('Video uploaded successfully');
        alert('Video uploaded successfully');
      } catch (err) {
        console.error('Error uploading video:', err);
        alert('An error occurred while uploading the video.');
      }
    }

    // fetching the user details of the uploaded videos data ( all )
    const fetchVideos = async () => {
      await loadProvider();
      if (!contractGlobal) {
        console.error('Contract not loaded');
        return;
      }
      
      try {
        // console.log(`In fetchVideos : ${account}`);
        const isBrowser = typeof window !== "undefined";
        const newProvider = isBrowser ? new ethers.providers.Web3Provider(window.ethereum) : null;
        const signer = newProvider.getSigner();
        const UserAccount = await signer.getAddress();
        console.log(UserAccount);
        console.log(contractGlobal);
        const videos = await contractGlobal.getUserVideos(UserAccount)
        .then((res) => {
          if(res.length === 0) {
            alert('No videos found');
          }
          // console.log(res);
        });
        console.log('Fetched videos:', videos);
        return videos;
      } catch (err) {
        console.error('Error fetching videos:', err);
        alert('An error occurred while fetching videos.');
      }
    };

  export { uploadVideo, fetchVideos, loadProvider };
  