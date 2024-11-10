import React from "react";
import { useLocation } from "react-router-dom";
import Chart from "./Chart";
import { ArrowRight, InfoIcon } from "lucide-react";

function ImageResult() {
  const [result, setResult] = React.useState(null);
  const [vidname, setVidname] = React.useState(null);
  const location = useLocation();

  React.useEffect(() => {
    setResult(location.state.result);
    setVidname(location.state.fileName);
  }, [location.state.result, location.state.fileName]);

  return (
    <div className="h-screen flex justify-center items-center">
      {result && (
        <div className="flex flex-col justify-center items-center gap-4">
          <div className="text-5xl font-semibold">Results</div>
          <div className="flex gap-32 justify-evenly items-center bg-[#252525] border border-[#ffffff10] rounded-xl px-12 py-2">
            <div className="text-xl font-medium">{location.state.fileName}</div>
            {result.score < 0.5 ? (
              <div className="px-4 py-1 rounded-full text-lg text-green-500 bg-[#00ff0010] border border-green-600">
                Real
              </div>
            ) : (
              <div className="px-4 py-1 rounded-full text-lg text-[#ff0000] bg-[#ff000010] border border-[#ff0000]">
                Deepfake
              </div>
            )}
            <p className="text-xl font-medium flex gap-2 text-center items-center">
              {Number(result.score.toFixed(2) * 100)}%
              {/* <InfoIcon size={24} className="opacity-20 hover:" /> */}
              &nbsp;&nbsp;
              <span className="text-sm  opacity-40">Deepfake</span>
            </p>
            <p className="flex gap-2 justify-center items-center text-md font-medium">
              <div className="h-2 w-2 bg-green-600 rounded-full"></div> Stored
              on Blockchain
            </p>
          </div>
          {/* <p className='text-xl font-medium'>Mean Score: {result.score}</p> */}
          {/* <p className="w-96 break-words">Pred Scores: {JSON.stringify(result.pred_scores)}</p> */}
          <button
            className=" flex items-center gap-2 py-2.5 px-5 bg-[#f1f3f5] hover:bg-[#ddd] text-[1.185rem] text-gray-900 font-semibold  rounded-full"
            onClick={() => (window.location.href = "/upload-image")}
          >
            Upload Another image <ArrowRight />
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageResult;
