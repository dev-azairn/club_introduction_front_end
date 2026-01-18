import React, { useState, useEffect } from 'react';
import { socket, type RoundData } from '~/utils/socket';



const VoteApp: React.FC = () => {
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [selectedScore, setSelectedScore] = useState<number>(1);
  const [waitingMessage, setWaitingMessage] = useState<string>("Waiting for the next round...");

  useEffect(() => {
    // --- EVENT HANDLERS ---

    const onNewRound = (data: RoundData) => {
      console.log("New Round Data Received:", data);
      setRoundData(data);
      setTimeLeft(data.timeLeft); // Reset timer to 10s
      setHasVoted(false);         // Re-enable buttons
      setSelectedScore(1);     // Clear previous selection
      setWaitingMessage("");
    };

    const onVoteConfirmed = (score: number) => {
      console.log("Vote Confirmed:", score);
      setHasVoted(true);
      setSelectedScore(score);
    };

    const onGameOver = () => {
        setWaitingMessage("Game Over! Calculating results...");
        setRoundData(null);
    };

    // --- ATTACH LISTENERS ---
    socket.on('new_round', onNewRound);
    socket.on('vote_confirmed', onVoteConfirmed);
    socket.on('game_over', onGameOver); // Optional: clear screen on game over

    // --- CLEANUP ---
    return () => {
      socket.off('new_round', onNewRound);
      socket.off('vote_confirmed', onVoteConfirmed);
      socket.off('game_over', onGameOver);
    };
  }, []);

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  // --- ACTION ---
  const handleVote = (score: number) => {
    if (hasVoted) return;
    
    // 1. Optimistic UI update (feels faster)
    setSelectedScore(score);
    
    // 2. Send to server
    socket.emit('send_vote', score);
  };

  // --- RENDER HELPERS ---
  // Drive images often need slightly different URL structure for embedding
  // The server sends: https://drive.google.com/file/d/FILE_ID/view
  // We need: https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000 (Better for images)
  const getEmbedUrl = (fileId: string) => {
    console.log(fileId)
     return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  };

  // --- RENDER ---
  if (!roundData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <h2 className="text-xl font-bold text-gray-500 animate-pulse">{waitingMessage}</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 max-w-lg mx-auto min-h-screen bg-gray-50">
      
      {/* HEADER: Student ID & Timer */}
      <div className="w-full flex justify-between items-center mb-4 bg-white p-3 rounded shadow-sm">
        <span className="font-semibold text-gray-700">Student: {roundData.studentId}</span>
        <span className={`font-bold text-lg ${timeLeft <= 3 ? 'text-red-500' : 'text-blue-600'}`}>
           ⏱ {timeLeft}s
        </span>
      </div>

      {/* IMAGE CONTAINER */}
      <div className="w-full aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-md mb-6 relative">
        <img 
            src={getEmbedUrl(roundData.fileId)} 
            className="w-full h-full object-contain"
        />
        {hasVoted && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-bold text-xl bg-green-600 px-4 py-2 rounded-full">
                    Vote Sent: {selectedScore}
                </span>
            </div>
        )}
      </div>

      {/* VOTING BUTTONS */}
      <div className="grid grid-cols-5 gap-2 w-full">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            onClick={() => handleVote(score)}
            disabled={hasVoted}
            className={`
                h-16 rounded-lg font-bold text-xl transition-all shadow-sm
                ${hasVoted 
                    ? (selectedScore === score ? 'bg-green-500 text-white scale-105' : 'bg-gray-300 text-gray-500') 
                    : 'bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 hover:border-blue-400 active:scale-95'
                }
            `}
          >
            {score}
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-400">
         {hasVoted ? "Waiting for next round..." : "Select a score above"}
      </div>

    </div>
  );
};

export default VoteApp;