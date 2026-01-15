import { io, type Socket } from 'socket.io-client';

// autoConnect: false is crucial to prevent the "Chicken and Egg" error
export type GameState = 'LOBBY' | 'VOTING' | 'FINISHED';

export interface WinnerData {
    studentId: string;
    fileId: string;
    finalScore: number;
}

export interface RoundData {
    studentId: string;
    fileId: string;
    timeLeft: number;
}

// Socket.io Type Definitions
export interface ServerToClientEvents {
    sync_state: (state: GameState) => void;
    new_round: (data: RoundData) => void;
    vote_confirmed: (score: number) => void;
    game_over: (winners: WinnerData[]) => void;
    connect_error: (err: Error) => void;
    update_user_list: (users: any[]) => void;
}

export interface ClientToServerEvents {
    send_vote: (score: number) => void;
    request_user_list: () => void;
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://localhost:3000", {
    autoConnect: false,
    reconnection: true,
    transports: ['websocket'],
});