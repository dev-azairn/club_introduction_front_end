import { io, type Socket } from 'socket.io-client';
import { SERVER_PATH } from './dotenv';

// autoConnect: false is crucial to prevent the "Chicken and Egg" error
export type GameState = 'CLOSED' | 'LOBBY' | 'VOTING' | 'FINISHED' ;

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
    token_expired: () => void;
    delete_token: () => void;
}

export interface ClientToServerEvents {
    send_vote: (score: number) => void;
    request_user_list: () => void;
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_PATH, {
    autoConnect: false,
    reconnection: true,
    transports: ['websocket'],
});