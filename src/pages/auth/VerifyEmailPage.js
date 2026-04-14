import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        {status === 'success' ? (
          <>
            <HiCheckCircle className="text-6xl text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Email verified!</h1>
            <p className="text-gray-400 mb-6">
              Your email has been verified. You can now access all features.
            </p>
            <Link to="/login" className="btn-primary">Go to Login</Link>
          </>
        ) : (
          <>
            <HiXCircle className="text-6xl text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Verification failed</h1>
            <p className="text-gray-400 mb-6">
              The verification link is invalid or has expired. Please request a new one.
            </p>
            <Link to="/login" className="btn-secondary">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
}
