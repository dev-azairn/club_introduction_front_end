import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { socket, type GameState } from '~/utils/socket';
import { SERVER_PATH } from '~/utils/dotenv';

interface LayoutContext {
    gameState: GameState;
}

export default function DrawToImpressForm() {
  const navigate = useNavigate();
  
  
  const [ file, setFile] = useState<File | null>(null);
  const [ studentId, setStudentId ] = useState<string>("");
  const [ isUploading, setIsUploading ] = useState(false);
  const { gameState } = useOutletContext<LayoutContext>();

  useEffect(() => {
      const token = localStorage.getItem('game_token');
      
      // If user has a token and the game hasn't finished yet, send them back to the game!
      if (token && gameState === 'LOBBY') {
          navigate('/draw_to_impress/lobby');
      }
      // If they have a token but game is voting, Layout will handle sending them to /vote
  }, [gameState, navigate]);
  
  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !studentId) return alert("Please fill all fields");

    setIsUploading(true);
    const formData = new FormData();
    formData.append('uploaded_image', file); 
    formData.append('student_id', studentId);

    try {
      const res = await fetch(`${SERVER_PATH}/submit`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.status === 403) {
         alert("Cannot Join: The game has already started.");
         setIsUploading(false);
         return;
      }

      if (data.success) {
        // --- [CORE FIX] FORCE RECONNECTION ---
        
        // 1. Save the new token
        localStorage.setItem('game_token', data.token);

        // 2. Disconnect the "Guest" socket
        socket.disconnect();

        // 3. Attach the token containing the Student ID
        socket.auth = { token: data.token };

        // 4. Reconnect immediately -> Server now sees "User: 12345" instead of "Guest"
        socket.connect();
        
        navigate('/draw_to_impress/lobby'); 
      } else {
        alert("Error: " + (data.msg || data.error));
      }
    } catch (err) {
      console.error(err);
      alert("Network Error");
    } finally {
      setIsUploading(false);
    }
  };

  if (gameState !== 'LOBBY') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 text-center">
            
            {/* STATE: CLOSED */}
            {gameState === 'CLOSED' && (
                <>
                    <div className="text-6xl mb-6 animate-pulse">🔒</div>
                    <h1 className="text-4xl font-extrabold mb-4">Game Closed</h1>
                    <p className="text-xl text-gray-400">
                        The admin has not opened the lobby yet.<br/>
                        Please wait for instructions.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        Waiting for signal...
                    </div>
                </>
            )}

            {/* STATE: VOTING or FINISHED */}
            {(gameState === 'VOTING' || gameState === 'FINISHED') && (
                <>
                    <div className="text-6xl mb-6">🚫</div>
                    <h1 className="text-4xl font-extrabold mb-4">Entry Closed</h1>
                    <p className="text-xl text-gray-400">
                        The game is already in progress or finished.
                    </p>
                </>
            )}

        </div>
      );
  }


  return (
    <form onSubmit={handleUpload} className="p-4">
      <h1 className="text-2xl font-bold mb-4">Join Draw to Impress</h1>
      <div className="flex flex-col gap-4 max-w-sm">
        <input 
            type="text" 
            placeholder="Student ID" 
            className="border p-2 rounded"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)} 
        />
        <input 
            type="file" 
            className="border p-2 rounded"
            onChange={(e) => {
                if(e.target.files) setFile(e.target.files[0]);
            }} 
        />
        {
          (file)? <img src={URL.createObjectURL(file)} /> : <h1>No file Selected!</h1>
        }

        <button 
            disabled={isUploading}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
            {isUploading ? "Joining..." : "Join Game"}
        </button>
      </div>
    </form>
  );
}