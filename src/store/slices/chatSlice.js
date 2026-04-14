import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async ({ room, page = 1 }) => {
  const res = await api.get('/chats', { params: { room, page, limit: 50 } });
  return { messages: res.data.data, room, page };
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async (messageData) => {
  const res = await api.post('/chats', messageData);
  return res.data.data;
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    rooms: {},        // { [room]: { messages: [], isLoading, hasMore } }
    activeRoom: null,
    typingUsers: {},  // { [room]: [userId, ...] }
    isLoading: false,
  },
  reducers: {
    setActiveRoom: (state, action) => { state.activeRoom = action.payload; },
    addMessage: (state, action) => {
      const { room, message } = action.payload;
      if (!state.rooms[room]) state.rooms[room] = { messages: [], isLoading: false, hasMore: true };
      const exists = state.rooms[room].messages.some((m) => m._id === message._id);
      if (!exists) state.rooms[room].messages.push(message);
    },
    deleteMessage: (state, action) => {
      const { room, messageId } = action.payload;
      if (state.rooms[room]) {
        const msg = state.rooms[room].messages.find((m) => m._id === messageId);
        if (msg) { msg.isDeleted = true; msg.content = 'This message was deleted'; }
      }
    },
    setTyping: (state, action) => {
      const { room, user } = action.payload;
      if (!state.typingUsers[room]) state.typingUsers[room] = [];
      if (!state.typingUsers[room].find((u) => u.id === user.id)) {
        state.typingUsers[room].push(user);
      }
    },
    clearTyping: (state, action) => {
      const { room, userId } = action.payload;
      if (state.typingUsers[room]) {
        state.typingUsers[room] = state.typingUsers[room].filter((u) => u.id !== userId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state, action) => {
        const room = action.meta.arg.room;
        if (!state.rooms[room]) state.rooms[room] = { messages: [], isLoading: true, hasMore: true };
        else state.rooms[room].isLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { messages, room, page } = action.payload;
        if (!state.rooms[room]) state.rooms[room] = { messages: [], isLoading: false, hasMore: true };
        state.rooms[room].isLoading = false;
        state.rooms[room].hasMore = messages.length === 50;
        if (page === 1) state.rooms[room].messages = messages;
        else state.rooms[room].messages = [...messages, ...state.rooms[room].messages];
      });
  },
});

export const { setActiveRoom, addMessage, deleteMessage, setTyping, clearTyping } = chatSlice.actions;
export default chatSlice.reducer;
