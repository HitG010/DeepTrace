import React from "react";

function Predict() {
  const [videoUrl, setVideoUrl] = React.useState(null);
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        setVideoUrl("output_video.mp4");
      }) // Convert the response to a Blob
      .catch((error) => {
        console.error("Error processing video:", error);
        console.error("Response object:", error.response);
        console.error("Fetch details:", { method: "POST", body: formData });
      });
  };

  return (
    <div>
      <h1>Upload a Video</h1>
      <form
        action="http://127.0.0.1:5000/predict"
        method="POST"
        encType="multipart/form-data"
        onSubmit={handleSubmit}
      >
        <input type="file" name="video" accept="video/*" required />
        <button type="submit">Upload and Process</button>
      </form>
      <video controls>
        <source src="output_video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default Predict;
