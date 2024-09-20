// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VideoStorage {
    
    struct VideoResult {
        bytes32 videoHash;      // Hash of the video
        string result;          // Deepfake test result (e.g., "fake", "real")
        uint256 timestamp;      // Time of the video analysis
    }
    
    struct User {
        address userAddress;            // User's Ethereum address
        VideoResult[] uploadedVideos;   // List of videos uploaded by the user
    }
    
    // Mapping of user address to their corresponding User struct
    mapping(address => User) public users;
    
    // Mapping of video hash to video result
    mapping(bytes32 => VideoResult) public videoResults;

    // Event when a new video is uploaded
    event VideoUploaded(address indexed user, bytes32 indexed videoHash, string result, uint256 timestamp);
    
    // Add video along with its deepfake result to the blockchain
    function addVideo(bytes32 videoHash, string memory result) public {
        require(videoResults[videoHash].videoHash == bytes32(0), "Video already analyzed and exists on blockchain.");
        
        // Create the VideoResult struct
        VideoResult memory newVideo = VideoResult({
            videoHash: videoHash,
            result: result,
            timestamp: block.timestamp
        });
        
        // Add the video to the mapping
        videoResults[videoHash] = newVideo;
        
        // Add the video to the user's uploaded videos
        if(users[msg.sender].userAddress == address(0)){
            users[msg.sender].userAddress = msg.sender;
        }
        users[msg.sender].uploadedVideos.push(newVideo);
        
        // Emit an event for the new video upload
        emit VideoUploaded(msg.sender, videoHash, result, block.timestamp);
    }
    
    // Retrieve all videos uploaded by a specific user
    function getUserVideos(address userAddress) public view returns (VideoResult[] memory) {
        return users[userAddress].uploadedVideos;
    }
    
    // Retrieve a video result by its hash
    function getVideoResult(bytes32 videoHash) public view returns (VideoResult memory) {
        require(videoResults[videoHash].videoHash != 0, "Video not found on blockchain.");
        return videoResults[videoHash];
    }
}
