// src/layouts/DrawGameLayout.tsx
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { socket, type GameState, type WinnerData } from '~/utils/socket';

const DrawGameLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State to hold the user list and the final results
  const [users, setUsers] = useState<any[]>([]);
  const [results, setResults] = useState<WinnerData[]>([]); // <--- NEW STATE

  useEffect(() => {
    // ... (Connection logic remains the same) ...
    const token = localStorage.getItem('game_token');
    if (token && !socket.connected) {
        socket.auth = { token };
        socket.connect();
    }

    // --- EVENT LISTENERS ---

    // 1. Handle Game Over Signal
    const onGameOver = (winners: WinnerData[]) => {
        console.log("🏆 Game Over received! Winners:", winners);
        setResults(winners); // Save data so Result page can see it
    };

    const onSyncState = (state: GameState) => {
      const currentPath = location.pathname;
      
      // Redirect Logic
      if (state === 'LOBBY' && currentPath !== '/draw_to_impress/lobby') {
        navigate('/draw_to_impress/lobby');
      } 
      else if (state === 'VOTING' && currentPath !== '/draw_to_impress/vote') {
        navigate('/draw_to_impress/vote');
      } 
      // [REDIRECT TO RESULT]
      else if (state === 'FINISHED' && currentPath !== '/draw_to_impress/result') {
        navigate('/draw_to_impress/result');
      }
    };

    const onUpdateUserList = (list: any[]) => setUsers(list);

    // Attach Listeners
    socket.on('sync_state', onSyncState);
    socket.on('update_user_list', onUpdateUserList);
    socket.on('game_over', onGameOver); // <--- ATTACH HERE

    // Cleanup
    return () => {
      socket.off('sync_state', onSyncState);
      socket.off('update_user_list', onUpdateUserList);
      socket.off('game_over', onGameOver); // <--- DETACH HERE
    };
  }, [navigate]);

  // Pass 'results' down to the Result Page via Context
  return (
    <div className="draw-game-container">
       <Outlet context={{ users, results }} />
    </div>
  );
};

export default DrawGameLayout;