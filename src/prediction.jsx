import React, { useState } from "react";

function VideoUpload() {
  const [file, setFile] = useState(null);
  const [framesPerVideo, setFramesPerVideo] = useState(100); // Default value
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFramesChange = (e) => {
    setFramesPerVideo(e.target.value);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a video file.");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("frames_per_video", framesPerVideo); // Add frames_per_video to form data

    try {
      const response = await fetch("http://127.0.0.1:5000/upload-video", {
        method: "POST",
        body: formData,
      });
      console.log(response);
      if (!response.ok) {
        throw new Error("Video upload failed");
      }

      const data = await response.json();
      console.log(data);
      setResult(data);
    } catch (error) {
      //   console.log(error);
      console.error(error);
      alert("An error occurred while uploading the video.");
    }
  };

  return (
    <div>
      <h2>Upload Video for Face Prediction</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <div>
        <label>
          Frames Per Video:
          <input
            type="number"
            value={framesPerVideo}
            onChange={handleFramesChange}
            min="1"
            max="1000"
          />
        </label>
      </div>
      <button onClick={handleUpload}>Upload</button>

      {result && (
        <div>
          <h3>Results</h3>
          <p>Mean Score: {result.mean_score}</p>
          <p>Pred Scores: {JSON.stringify(result.pred_scores)}</p>
        </div>
      )}
    </div>
  );
}

export default VideoUpload;
