import { ArrowLeft, ArrowRight } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadVideo } from "./contractDeets.jsx";

function VideoUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [framesPerVideo, setFramesPerVideo] = useState(150); // Default value
  const [result, setResult] = useState(null);
  const [tier, setTier] = useState("tier1");

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

    const fileName = file.name;
    console.log("File Name: ", fileName);
    // navigate('/result');

    try {
      const response = await fetch("http://127.0.0.1:8080/upload-video", {
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

      //check if the video result is real or deepfake
      if (data.mean_score < 0.5) {
        uploadVideo(file, "Real");
      } else {
        uploadVideo(file, "Deepfake");
      }

      navigate("/result", { state: { result: data, fileName: fileName } });
    } catch (error) {
      //   console.log(error);
      console.error(error);
      alert("An error occurred while uploading the video.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="w-screen flex justify-evenly">
        <div className="tiers flex flex-col gap-4">
          <button
            className="w-fit flex items-center gap-2 py-2.5 px-5 bg-[#1e1e1e] hover:bg-[#252525] text-[#f1f3f5] text-[0.85rem]  rounded-full"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft /> Return To Homepage{" "}
          </button>
          <div className="text-5xl font-semibold">Upload Video</div>
          <div className="text-2xl font-medium">Select A Tier</div>
          <div className="bg-[#252525] px-6 py-3 rounded-lg border border-[#ffffff10] flex justify-center items-center gap-4">
            <input
              type="radio"
              id="tier1"
              name="tier"
              value="tier1"
              defaultChecked
              className="h-5 w-5"
              onClick={() => {
                setTier("tier1");
                setFramesPerVideo(150);
              }}
            />
            <label for="tier1">
              <div className="text-2xl font-semibold">Basic</div>
              <div>
                Analyze a video of atmost 15 seconds <br />
                (150 frames for a 30fps video)
              </div>
            </label>
          </div>
          <div className="bg-[#252525] px-6 py-3 rounded-lg border border-[#ffffff10] flex justify-center items-center gap-4">
            <input
              type="radio"
              id="tier2"
              name="tier"
              value="tier2"
              className="h-5 w-5"
              onClick={() => {
                setTier("tier2");
                setFramesPerVideo(300);
              }}
            />
            <label for="tier2">
              <div className="text-2xl font-semibold">Standard</div>
              <div>
                Analyze a video of atmost 30 seconds <br />
                (300 frames for a 30fps video)
              </div>
            </label>
          </div>
          <div className="bg-[#252525] px-6 py-3 rounded-lg border border-[#ffffff10] flex justify-center items-center gap-4">
            <input
              type="radio"
              id="tier3"
              name="tier"
              value="tier3"
              className="h-5 w-5"
              onClick={() => {
                setTier("tier3");
                setFramesPerVideo(500);
              }}
            />
            <label for="tier3">
              <div className="text-2xl font-semibold">Premium</div>
              <div>
                Analyze a video of more than 15 seconds <br />
                (500+ frames for a 30fps video)
              </div>
            </label>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-4">
          {!file ? (
            <>
              {/* <input type="file" accept="video/*" onChange={handleFileChange} /> */}
              <div className="">
                <label className="flex h-56 w-116 px-24 w-full cursor-pointer appearance-none items-center justify-center rounded-md border-2 border-dashed border-gray-600 p-6 transition-all hover:border-gray-400">
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
                    id="example5"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </>
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
              No. of Frames to be analysed: <b>{framesPerVideo}</b>
            </div>
            {file && (
              <button
                onClick={() => setFile(null)}
                className="py-1.5 px-3 bg-[#1e1e1e] hover:bg-[#252525] text-[0.85rem] text-red-600 font-semibold rounded-full border border-red-600"
              >
                Remove Video
              </button>
            )}
          </div>

          <button
            onClick={handleUpload}
            className="py-2.5 px-5 bg-[#f1f3f5] hover:bg-[#ddd] text-[1.185rem] text-gray-900 font-semibold  rounded-full"
          >
            Upload
          </button>

          {result && (
            <div className="">
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
