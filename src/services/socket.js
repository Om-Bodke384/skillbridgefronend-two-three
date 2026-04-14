import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => console.log('Socket connected:', socket.id));
  socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinCommunityRoom = (communityId) => {
  socket?.emit('join_community', communityId);
};

export const leaveCommunityRoom = (communityId) => {
  socket?.emit('leave_community', communityId);
};

export const joinTownhallRoom = (townhallId) => {
  socket?.emit('join_townhall', townhallId);
};

export const sendGlobalMessage = (data) => socket?.emit('global_message', data);
export const sendCommunityMessage = (data) => socket?.emit('community_message', data);
export const sendTownhallMessage = (data) => socket?.emit('townhall_message', data);
export const emitTyping = (room) => socket?.emit('typing', { room });
export const emitStopTyping = (room) => socket?.emit('stop_typing', { room });
