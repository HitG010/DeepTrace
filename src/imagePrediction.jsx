import React, { useState } from "react";
import "./App.css";

function ImagePredict() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    setLoading(true);

    // Prepare the image for upload
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });
      console.log(response);
      const data = await response.json();
      setResult(`Score: ${data.score.toFixed(4)} - Result: ${data.result}`);
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
      setResult("Error: Unable to get a prediction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Face Manipulation Detection</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Upload Image"}
        </button>
      </form>
      {preview && (
        <img
          src={preview}
          alt="Uploaded"
          style={{ maxWidth: "100%", marginTop: "20px" }}
        />
      )}
      {result && (
        <div id="result" style={{ marginTop: "20px", fontSize: "1.2em" }}>
          {result}
        </div>
      )}
    </div>
  );
}

export default ImagePredict;
