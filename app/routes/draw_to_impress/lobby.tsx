import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { socket } from '~/utils/socket'; // Import socket to manually request list

// 1. Define the data shape we get from Layout
interface LobbyContextType {
    users: Array<{ studentId: string; fileId: string }>;
}

const DrawLobby: React.FC = () => {
  // 2. Instead of useState, we grab 'users' from the parent Layout
  const { users } = useOutletContext<LobbyContextType>();
  // 3. Safety Check: Ask server for the list again when this specific page loads
  // This ensures if the user refreshed or navigated quickly, we get the data.
  useEffect(() => {
    if (socket.connected) {
        socket.emit('request_user_list');
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl text-center">
        
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">
          Lobby
        </h1>
        <p className="text-gray-500 mb-6">
            Waiting for admin to start...
        </p>

        <div className="mb-4">
            <span className="font-bold text-lg">
                Players Joined: {users.length}
            </span>
        </div>

        {/* 4. Render the list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
            {users.length === 0 ? (
                <div className="col-span-full text-gray-400">Loading players...</div>
            ) : (
                users.map((user) => (
                    <div 
                        key={user.studentId} 
                        className="p-3 border rounded bg-gray-100 flex items-center justify-center"
                    >
                        <span className="font-mono font-semibold text-gray-700">
                            {user.studentId}
                        </span>
                    </div>
                ))
            )}
        </div>

      </div>
    </div>
  );
};

export default DrawLobby;