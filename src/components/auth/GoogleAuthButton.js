import React, { useEffect, useRef, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { googleLogin } from '../../store/slices/authSlice';

export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

/**
 * "Continue with Google" button.
 * - `role` / `techDomain` are only used if this creates a brand-new account (Register page).
 * - Renders nothing if REACT_APP_GOOGLE_CLIENT_ID is not set, so the app still works without it.
 */
export default function GoogleAuthButton({ role, techDomain, text = 'continue_with' }) {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const wrapRef   = useRef(null);
  const [width, setWidth] = useState(360);

  // Google renders the button at a fixed pixel width (200–400), so fit it to the container
  useEffect(() => {
    if (wrapRef.current) {
      setWidth(Math.min(400, Math.max(200, Math.floor(wrapRef.current.clientWidth))));
    }
  }, []);

  if (!GOOGLE_CLIENT_ID) return null;

  const handleSuccess = async ({ credential }) => {
    if (!credential) return toast.error('Google sign-in failed. Please try again.');
    const payload = { credential };
    if (role) payload.role = role;
    if (techDomain) payload.techDomain = techDomain;

    const result = await dispatch(googleLogin(payload));
    if (!result.error) navigate('/dashboard');
  };

  return (
    <div ref={wrapRef} className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error('Google sign-in was cancelled or failed.')}
        theme="filled_black"
        shape="pill"
        size="large"
        text={text}
        width={width}
        locale="en"
      />
    </div>
  );
}
