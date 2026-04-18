import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiMicrophone, HiVideoCamera, HiPhoneMissedCall, HiEye } from 'react-icons/hi';

const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

export default function LiveRoomPage() {
  const { id }       = useParams();
  const { state }    = useLocation();
  const navigate     = useNavigate();
  const isHost       = state?.isHost;
  const localVideoRef  = useRef(null);
  const [joined, setJoined]         = useState(false);
  const [micOn, setMicOn]           = useState(true);
  const [camOn, setCamOn]           = useState(true);
  const [viewerCount, setViewerCount] = useState(state?.live?.viewerCount || 0);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const localTracksRef = useRef({ audio: null, video: null });

  useEffect(() => {
    if (!state?.token) { navigate('/live'); return; }
    startAgora();

    return () => { leaveAgora(); };
  }, []); // eslint-disable-line

  const startAgora = async () => {
    try {
      await client.setClientRole(isHost ? 'host' : 'audience');
      await client.join(
        process.env.REACT_APP_AGORA_APP_ID,
        state.channelName,
        state.token,
        state.uid
      );

      if (isHost) {
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracksRef.current = { audio: audioTrack, video: videoTrack };
        videoTrack.play(localVideoRef.current);
        await client.publish([audioTrack, videoTrack]);
      }

      // Handle remote users (viewers see host video)
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          setRemoteUsers((prev) => [...prev, user]);
          setTimeout(() => user.videoTrack?.play(`remote-${user.uid}`), 500);
        }
        if (mediaType === 'audio') user.audioTrack?.play();
      });

      client.on('user-unpublished', (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      setJoined(true);
    } catch (err) {
      toast.error('Failed to join live: ' + err.message);
      navigate('/live');
    }
  };

  const leaveAgora = async () => {
    localTracksRef.current.audio?.close();
    localTracksRef.current.video?.close();
    await client.leave();
    if (isHost) {
      try { await api.patch(`/live/${id}/end`); } catch { /* ignore */ }
    }
  };

  const handleLeave = async () => {
    await leaveAgora();
    toast.success(isHost ? 'Live ended' : 'Left live session');
    navigate('/live');
  };

  const toggleMic = async () => {
    await localTracksRef.current.audio?.setEnabled(!micOn);
    setMicOn(!micOn);
  };

  const toggleCam = async () => {
    await localTracksRef.current.video?.setEnabled(!camOn);
    setCamOn(!camOn);
  };

  return (
    <div className="h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
          <h1 className="text-white font-semibold">{state?.live?.title}</h1>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <HiEye /> {viewerCount} watching
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {/* Host's local video */}
        {isHost && (
          <div ref={localVideoRef} className="w-full h-full" />
        )}

        {/* Remote video (viewers see host) */}
        {!isHost && remoteUsers.map((user) => (
          <div
            key={user.uid}
            id={`remote-${user.uid}`}
            className="w-full h-full"
          />
        ))}

        {!joined && (
          <div className="text-gray-500 text-lg">Connecting...</div>
        )}

        {!isHost && remoteUsers.length === 0 && joined && (
          <div className="text-gray-500">Waiting for host to share video...</div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-800">
        {isHost && (
          <>
            <button
              onClick={toggleMic}
              className={`p-3 rounded-full text-white transition-colors ${micOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600'}`}
            >
              <HiMicrophone className="text-xl" />
            </button>
            <button
              onClick={toggleCam}
              className={`p-3 rounded-full text-white transition-colors ${camOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600'}`}
            >
              <HiVideoCamera className="text-xl" />
            </button>
          </>
        )}
        <button
          onClick={handleLeave}
          className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors"
        >
          <HiPhoneMissedCall className="text-xl" />
        </button>
      </div>
    </div>
  );
}