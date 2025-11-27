import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white overflow-hidden relative font-sans">
      {/* --- Animated Background --- */}
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-gradient {
          background: linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #111827);
          background-size: 400% 400%;
          animation: gradient-shift 20s ease infinite;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
      <div className="animated-gradient absolute inset-0 -z-10"></div>

      {/* --- Professional Header / Navbar --- */}
      <nav className="w-full p-6 flex justify-between items-center z-10 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          {/* Simple SVG Logo */}
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Re<span className="text-indigo-500">Connect</span>
          </span>
        </div>

        {/* Dummy Authority Stats */}
        <div className="hidden md:flex items-center space-x-6 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-gray-400 text-xs uppercase tracking-wider">Items Returned</span>
            <span className="text-green-400 font-bold font-mono">14,205</span>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <div className="flex flex-col items-end">
            <span className="text-gray-400 text-xs uppercase tracking-wider">Active Cases</span>
            <span className="text-indigo-400 font-bold font-mono">842</span>
          </div>
          <div className="bg-indigo-900/30 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-300 text-xs font-semibold">
            ✓ Authorized Partner
          </div>
        </div>
      </nav>

      {/* --- Main Hero Content --- */}
      <div className="flex-grow flex items-center justify-center p-6 relative z-10">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Text */}
          <div className="text-left space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-4">
              AI-Powered Recovery System
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
              Lost It? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Let's Find It.
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
              The official centralized platform for recovering lost valuables. 
              Secure, verified, and powered by advanced image recognition technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => navigate('/search')}
                className="group relative px-8 py-4 bg-white text-gray-900 font-bold rounded-xl shadow-xl shadow-white/10 hover:shadow-white/20 transition-all transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative flex items-center">
                  <span className="mr-2 text-xl">🔍</span> I Lost Something
                </span>
              </button>

              <button 
                onClick={() => navigate('/post')}
                className="group relative px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all transform hover:-translate-y-1 border border-indigo-500"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative flex items-center">
                  <span className="mr-2 text-xl">📷</span> I Found Something
                </span>
              </button>
            </div>
          </div>

          {/* Right Side: Professional Glass Card / Abstract Graphic */}
          <div className="hidden lg:block">
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
               {/* Decorative Circles */}
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
               <div className="absolute bottom-10 left-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"></div>
               
               <div className="relative z-10 space-y-6">
                 <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                    <h3 className="text-lg font-semibold text-white">Recent Matches</h3>
                    <span className="text-xs text-green-400 flex items-center">● Live Feed</span>
                 </div>
                 
                 {/* Dummy List Items */}
                 {[1, 2, 3].map((item) => (
                   <div key={item} className="flex items-center space-x-4 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-default">
                     <div className="w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center text-xl">
                       {item === 1 ? '🎒' : item === 2 ? '📱' : '🔑'}
                     </div>
                     <div className="flex-1">
                       <p className="text-sm font-medium text-gray-200">
                         {item === 1 ? 'Black Backpack' : item === 2 ? 'iPhone 13 Pro' : 'Car Keys (Toyota)'}
                       </p>
                       <p className="text-xs text-gray-500">Found 2m ago • Central Station</p>
                     </div>
                     <button className="text-xs bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded text-white">
                       View
                     </button>
                   </div>
                 ))}
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- Simple Footer --- */}
      <footer className="w-full p-6 text-center text-gray-600 text-xs border-t border-gray-800 bg-gray-900">
        <p>© 2025 ReConnect Systems. All rights reserved. Secure & Encrypted.</p>
      </footer>
    </div>
  );
};

export default Home;