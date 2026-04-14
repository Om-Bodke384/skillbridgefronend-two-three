import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchMessages, addMessage, deleteMessage, setActiveRoom } from '../../store/slices/chatSlice';
import { getSocket, sendGlobalMessage, sendCommunityMessage, emitTyping, emitStopTyping, joinCommunityRoom } from '../../services/socket';
import { Avatar, Badge } from '../../components/ui/index';
import { HiPaperAirplane, HiGlobe, HiTrash, HiEmojiHappy, HiReply } from 'react-icons/hi';
import { format, isToday, isYesterday } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ROOMS = [
  { id: 'global', label: '🌍 Global Chat', type: 'global' },
];

export default function ChatPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { rooms, typingUsers } = useSelector((s) => s.chat);
  const { user } = useSelector((s) => s.auth);
  const { myCommunities } = useSelector((s) => s.community);

  const [activeRoom, setRoom] = useState(searchParams.get('room') || 'global');
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  const allRooms = [
    ...ROOMS,
    ...myCommunities.map((c) => ({ id: `community:${c._id}`, label: `# ${c.name}`, type: 'community', communityId: c._id })),
  ];

  const currentRoom = rooms[activeRoom] || { messages: [], isLoading: false };
  const typing = typingUsers[activeRoom] || [];

  useEffect(() => {
    dispatch(fetchMessages({ room: activeRoom }));
    dispatch(setActiveRoom(activeRoom));

    const socket = getSocket();
    if (!socket) return;

    // Join room
    if (activeRoom.startsWith('community:')) {
      const communityId = activeRoom.split(':')[1];
      joinCommunityRoom(communityId);
    }

    const handleMsg = (msg) => {
      if (msg.room === activeRoom || (!msg.room && activeRoom === 'global')) {
        dispatch(addMessage({ room: activeRoom, message: msg }));
      }
    };

    socket.on('global_message', handleMsg);
    socket.on('community_message', handleMsg);

    return () => {
      socket.off('global_message', handleMsg);
      socket.off('community_message', handleMsg);
    };
  }, [activeRoom, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentRoom.messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);

    const messageData = {
      content: input.trim(),
      room: activeRoom,
      ...(replyTo && { replyTo: replyTo._id }),
    };

    if (activeRoom.startsWith('community:')) {
      messageData.communityId = activeRoom.split(':')[1];
    }

    try {
      const res = await api.post('/chats', messageData);
      const saved = res.data.data;
      dispatch(addMessage({ room: activeRoom, message: saved }));

      const socket = getSocket();
      if (socket) {
        if (activeRoom === 'global') sendGlobalMessage({ ...saved, room: 'global' });
        else sendCommunityMessage({ ...saved, communityId: messageData.communityId });
      }

      setInput('');
      setReplyTo(null);
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = useCallback(() => {
    emitTyping(activeRoom);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitStopTyping(activeRoom), 1500);
  }, [activeRoom]);

  const handleDelete = async (messageId) => {
    try {
      await api.delete(`/chats/${messageId}`);
      dispatch(deleteMessage({ room: activeRoom, messageId }));
    } catch { toast.error('Cannot delete'); }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, 'HH:mm');
    if (isYesterday(d)) return `Yesterday ${format(d, 'HH:mm')}`;
    return format(d, 'MMM d, HH:mm');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6 animate-fade-in">
      {/* Room List */}
      <div className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-700 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-700">
          <h2 className="font-bold text-white">Messages</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {allRooms.map((room) => (
            <button key={room.id} onClick={() => setRoom(room.id)}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${activeRoom === room.id ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-800/50' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
              <span className="truncate">{room.label}</span>
              {activeRoom === room.id && <div className="w-2 h-2 bg-green-400 rounded-full ml-auto flex-shrink-0" />}
            </button>
          ))}
        </nav>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-950">
        {/* Header */}
        <div className="h-14 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="font-semibold text-white text-sm">
              {allRooms.find((r) => r.id === activeRoom)?.label || activeRoom}
            </span>
          </div>
          <Badge variant="gray">{currentRoom.messages.length} messages</Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {currentRoom.isLoading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          )}
          {currentRoom.messages.map((msg, i) => {
            const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
            const senderName = msg.sender?.name || 'Unknown';
            const senderAvatar = msg.sender?.avatar;

            return (
              <div key={msg._id || i} className={`flex gap-3 group ${isMine ? 'flex-row-reverse' : ''}`}>
                {!isMine && <Avatar src={senderAvatar} name={senderName} size="sm" className="flex-shrink-0 mt-1" />}
                <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {!isMine && <span className="text-xs font-medium text-indigo-300 px-1">{senderName}</span>}
                  {msg.replyTo && (
                    <div className="text-xs bg-gray-700 border-l-2 border-indigo-500 px-2 py-1 rounded text-gray-400 mb-1">
                      ↩ {msg.replyTo.content?.slice(0, 60)}…
                    </div>
                  )}
                  <div className={`px-4 py-2.5 text-sm text-white break-words ${isMine ? 'message-bubble-self' : 'message-bubble-other'} ${msg.isDeleted ? 'opacity-50 italic' : ''}`}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-gray-500 px-1">{formatTime(msg.createdAt)}</span>
                </div>
                {/* Actions */}
                <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${isMine ? 'mr-2' : 'ml-2'}`} style={{ alignSelf: 'center' }}>
                  <button onClick={() => setReplyTo(msg)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="Reply">
                    <HiReply className="text-sm" />
                  </button>
                  {isMine && !msg.isDeleted && (
                    <button onClick={() => handleDelete(msg._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors" title="Delete">
                      <HiTrash className="text-sm" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typing.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>{typing.map((u) => u.name).join(', ')} {typing.length === 1 ? 'is' : 'are'} typing…</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Reply preview */}
        {replyTo && (
          <div className="mx-5 mb-2 bg-gray-800/80 border-l-2 border-indigo-500 rounded-lg px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-300 font-medium">Replying to {replyTo.sender?.name}</p>
              <p className="text-xs text-gray-400 truncate">{replyTo.content?.slice(0, 80)}</p>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-white ml-4">✕</button>
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <div className="flex items-center gap-3 bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-indigo-500 transition-colors">
            <input
              value={input}
              onChange={(e) => { setInput(e.target.value); handleTyping(); }}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={`Message ${allRooms.find((r) => r.id === activeRoom)?.label || ''}…`}
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
            />
            <button onClick={handleSend} disabled={!input.trim() || sending}
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
              <HiPaperAirplane className="text-white text-sm rotate-90" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
