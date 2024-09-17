import './App.css'
import Navbar from './components/Navbar/Navbar.jsx'
import {ArrowRight} from 'lucide-react'

function Landing() {
  return (
    <div id='root' className='w-full h-screen flex justify-center items-center bg-[#1e1e1e]'>
      <div className="background fixed inset-0 z-0 flex items-center justify-center">
      <div className="circle1 relative w-[75rem] h-[75rem] rounded-full bg-[#f1f3f501] border border-2 border-[#f1f3f503] opacity-70">
        <div className="icon top-0 left-1/2 transform -translate-x-1/2">
          {/* <ArrowRight size={24} className="text-white bg-white" /> hello */}
        </div>
      </div>
      <div className="circle2 absolute w-[60rem] h-[60rem] rounded-full bg-[#f1f3f502] border border-2 border-[#f1f3f506] opacity-80"></div>
      <div className="circle3 absolute w-[40rem] h-[40rem] bg-[#f1f3f503] border border-2 border-[#f1f3f509] opacity-90"></div>
      <div className="absolute w-[50rem] h-[25rem] bg-[#212121] blur-lg"></div>
    </div>
      <Navbar />
      <div className='z-10 text-center flex flex-col gap-4 justify-center items-center'>
      <a className='flex rounded-full border border-[#78787836] px-3 py-1 scale-[0.9]' href='/login'>
        <div className='text-gray-400'>Always be sure of what you see. </div><div className='italic ml-1'> Get Started</div>
        </a>
        <h1 className='font-semibold text-6xl '>Exposing Digital Deception. <br/>
        Frame by Frame.</h1>
        <p className='text-lg font-400'>Leveraging the power of Blockchain and Machine Learning for detection of deep fake <br/> videos over the internet!</p>
        <div className='flex justify-center items-center gap-4'>
          <button className='hidden lg:inline-block py-2.5 px-5 bg-[#f1f3f5] hover:bg-[#ddd] text-[1.185rem] text-gray-900 font-bold  rounded-full transition duration-200' onClick={()=>{
            window.location.href = '/login'
          }}>
            <div className='flex items-center gap-2'>Try Now <ArrowRight size={20} /></div>
          </button>
          <button className='hidden lg:inline-block py-2.5 px-5 border border-[#787878] hover:bg-[#252525] text-[1.185rem] text-[#f1f3f5] font-normal  rounded-full transition duration-200'>How it works?</button>
        </div>
      </div>
    </div>
  )
}

export default Landing
