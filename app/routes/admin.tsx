import { useState } from 'react';
import { SERVER_PATH } from '~/utils/dotenv'

export default function AdminPanel() {
    const [statusMsg, setStatusMsg] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("");

    const handleOpenGame = async () => {
        try {
            console.log(await fetch(`${SERVER_PATH}/admin/open-game`, { method: 'POST' }));
            setStatusMsg("Game Opened! Students can now join.");
        } catch (err) {
            console.error(err);
        }
    };

    const handleFinishGame = async () => {
        if (!confirm("Are you sure? This will kick all players and invalidate tokens.")) return;

        try {
            const res = await fetch(`${SERVER_PATH}/admin/finish-game`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await res.json();
            if (res.ok) {
                setStatus("✅ Game Finished! All tokens expired.");
            } else {
                setStatus("❌ Error: " + data.error);
            }
        } catch (err) {
            setStatus("❌ Network Error");
        }
    };

    const handleStartVoting = async () => {
        try {
            const res = await fetch(`${SERVER_PATH}/admin/start-voting`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            if (res.ok) setStatus("✅ Voting Started! Players redirected.");
            else setStatus("❌ Error starting vote.");
        } catch (err) {
            setStatus("❌ Network Error");
        }
    };
    
    const handleResetGame = async () => {
        if (!confirm("Are you sure? This will kick all players and delete current results.")) return;

        try {
            const res = await fetch(`${SERVER_PATH}/admin/reset-game`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                setStatusMsg("Game reset to Lobby! Ready for new players.");
            }
        } catch (err) {
            console.error(err);
            setStatusMsg("Error resetting game.");
        }
    };

    return (
        <div className="p-10 flex flex-col items-center gap-6">
            <h1 className="text-3xl font-bold text-red-600">⚠️ Admin Control</h1>
            
            <input 
                type="password" 
                placeholder="Enter Admin Password" 
                className="border p-2 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button 
                    onClick={handleOpenGame}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-bold shadow-lg"
                >
                    🔓 Open Lobby
            </button>

            <button 
                    onClick={handleStartVoting}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
                >
                    START VOTING 🗳️
            </button>
            <button 
                onClick={handleFinishGame}
                className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition"
            >
                FINISH GAME (Expire All Tokens)
            </button>
            <button 
                    onClick={handleResetGame}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-bold shadow-md border-2 border-red-800"
                >
                    🔄 Start New Game (Reset)
            </button>
            {status && <p className="text-lg font-bold">{status}</p>}
            {statusMsg && <p className="text-lg font-bold">{statusMsg}</p>}
        </div>
    );
}