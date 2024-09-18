import React from "react";
import Navbar from "./components/Navbar/Navbar";

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
    <>
      <div className="text-center flex flex-col gap-4 justify-center items-center h-screen bg-[#1e1e1e]">
        <h1 className="text-4xl font-semibold mb-4">Upload a Video</h1>
        <form
          action="http://127.0.0.1:5000/predict"
          method="POST"
          encType="multipart/form-data"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="">
            {/* <label
            htmlFor="example5"
            className="mb-1 block text-sm font-medium text-white"
          >
            Upload file
          </label> */}
            <label className="flex h-48 w-96 w-full cursor-pointer appearance-none items-center justify-center rounded-md border-2 border-dashed border-gray-600 p-6 transition-all hover:border-gray-400">
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
              <input id="example5" type="file" className="sr-only" />
            </label>
          </div>
          <button
            type="submit"
            className="w-96 py-2.5 px-5 bg-[#f1f3f5] hover:bg-[#ddd] text-[1.185rem] text-gray-900 font-semibold  rounded-full"
          >
            Upload and Process
          </button>
        </form>
        {/* <video controls>
        <source src="output_video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video> */}
      </div>
    </>
  );
}

export default Predict;
