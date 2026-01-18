import React, { useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router';
import { type WinnerData } from '~/utils/socket';
import { SERVER_PATH } from'~/utils/dotenv';
 
interface ResultContextType {
    results: WinnerData[];
}

const DrawResult: React.FC = () => {
  const { results } = useOutletContext<ResultContextType>();
  const navigate = useNavigate();
  useEffect(
    () => {
        if (results.length == 0)
           navigate('/draw_to_impress');
    }, [navigate])
  // [FIX 1] Use your server proxy, NOT Google directly
  const getImageUrl = (fileId: string) => {
      // Make sure this port matches your server (3000)
      return `${SERVER_PATH}/api/image/${fileId}`;
  };

  const handleGoHome = () => {
      // 1. Clear the token to ensure a fresh start
      localStorage.removeItem('game_token');
      
      // 2. Use window.location to force a full page refresh
      // This ensures the socket disconnects and React state resets completely.
      window.location.href = '/draw_to_impress'; 
  };
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center py-10 px-4">
      
      <h1 className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse">
        🏆 Final Results 🏆
      </h1>
      <p className="text-gray-400 mb-10">And the winners are...</p>

      <div className="flex flex-col gap-6 w-full max-w-4xl">
        {results.length === 0 ? (
            <div className="text-center text-xl text-gray-500">
                Waiting for results...
            </div>
        ) : (
            results.map((player, index) => (
                <div 
                    key={`${player.studentId}-${index}`}
                    className={`
                        relative flex items-center p-4 rounded-xl border shadow-2xl transition-transform hover:scale-105
                        ${index === 0 ? 'bg-gradient-to-r from-yellow-600/20 to-yellow-900/40 border-yellow-500' : ''}
                        ${index === 1 ? 'bg-gradient-to-r from-gray-600/20 to-gray-800/40 border-gray-400' : ''}
                        ${index === 2 ? 'bg-gradient-to-r from-orange-800/20 to-orange-900/40 border-orange-600' : ''}
                        ${index > 2 ? 'bg-slate-800 border-slate-700 opacity-80' : ''}
                    `}
                >
                    {/* Rank Badge */}
                    <div className={`
                        flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full font-bold text-xl mr-4
                        ${index === 0 ? 'bg-yellow-500 text-black' : 
                          index === 1 ? 'bg-gray-300 text-black' : 
                          index === 2 ? 'bg-orange-600 text-white' : 'bg-slate-700 text-gray-300'}
                    `}>
                        #{index + 1}
                    </div>

                    {/* Image Container */}
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-600 bg-black relative">
                         {/* [FIX 2] Robust Image Tag */}
                         <img 
                            src={getImageUrl(player.fileId)} 
                            alt="Art" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            onError={(e) => {
                                // Fallback if Proxy fails: Try direct thumbnail
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; 
                                target.src = `https://drive.google.com/thumbnail?id=${player.fileId}&sz=w400`;
                            }}
                         />
                    </div>

                    {/* Info */}
                    <div className="ml-6 flex-grow">
                        <h2 className="text-2xl font-bold tracking-wide">
                            {player.studentId}
                        </h2>
                        <div className="text-sm text-gray-400 uppercase tracking-widest mt-1">
                            Total Score
                        </div>
                    </div>

                    {/* Score */}
                    <div className="text-4xl font-black text-white mr-4">
                        {player.finalScore}
                    </div>
                    
                </div>
            ))
        )}
      </div>
        <button 
        onClick={handleGoHome}
        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full shadow-lg transition-transform transform hover:scale-105 active:scale-95"
      >
        🏠 Back to Home
      </button>
    </div>
  );
};

export default DrawResult;