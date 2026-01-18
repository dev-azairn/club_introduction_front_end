import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { socket, type GameState, type WinnerData } from '~/utils/socket';

const DrawGameLayout: React.FC = () => {
  const navigate = useNavigate();
  const [ hasToken, setHasToken ] = useState<Boolean>(false);
  const [users, setUsers] = useState<any[]>([]);
  const [results, setResults] = useState<WinnerData[]>([]);
  const [gameState, setGameState] = useState<GameState>('CLOSED');
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('game_token');
    
    // 1. Connect
    if(token)
    {
      setHasToken(true);
    }

    if (!socket.connected) {
        console.log("Socket disconnected, attempting to connect...");
        socket.connect();
    }
    // 2. Events
    const onSyncState = (state: GameState) => {
        const path = location.pathname;
        setGameState(state);
        console.log(state)
        // Timeout prevents render crashes
        setTimeout(() => {
          if( hasToken )
          if(!path.includes('result'))
            if (state === 'LOBBY' && !path.includes('/lobby')) {
                navigate('/draw_to_impress/lobby');
            } 
            else if (state === 'VOTING' && !path.includes('/vote')) {
                navigate('/draw_to_impress/vote');
            } 
            else if (state === 'FINISHED') {
                // DELETE TOKEN NOW
                localStorage.removeItem('game_token');
                
                if (!path.includes('/result')) {
                    navigate('/draw_to_impress/result');
                }
            }
        }, 50);
    };

    const onTokenExpired = () => {
        localStorage.removeItem('game_token');
        socket.disconnect();
        navigate('/draw_to_impress');
    };


    const onUpdateUserList = (list: any[]) => setUsers(list);
    const onGameOver = (winners: WinnerData[]) => setResults(winners);

    socket.on('sync_state', onSyncState);
    socket.on('token_expired', onTokenExpired);
    socket.on('update_user_list', onUpdateUserList);
    socket.on('game_over', onGameOver);
    socket.on('delete_token', onTokenExpired);

    // Initial Request
    if (socket.connected) socket.emit('request_user_list');

    return () => {
      socket.off('sync_state', onSyncState);
      socket.off('token_expired', onTokenExpired);
      socket.off('update_user_list', onUpdateUserList);
      socket.off('game_over', onGameOver);
      socket.off('delete_token', onTokenExpired);
    };
  }, [navigate, location.pathname]);
  
  return (
    <div className="min-h-screen bg-black">
       <Outlet context={{ users, results, gameState }} />
    </div>
  );
};

export default DrawGameLayout;