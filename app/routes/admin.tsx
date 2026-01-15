import { useState } from 'react';

export default function AdminPanel() {
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("");

    const handleFinishGame = async () => {
        if (!confirm("Are you sure? This will kick all players and invalidate tokens.")) return;

        try {
            const res = await fetch('http://localhost:3000/admin/finish-game', {
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
            const res = await fetch('http://localhost:3000/admin/start-voting', {
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

            {status && <p className="text-lg font-bold">{status}</p>}
        </div>
    );
}