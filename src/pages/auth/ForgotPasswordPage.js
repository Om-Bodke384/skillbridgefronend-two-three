import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { HiMail, HiCheckCircle } from 'react-icons/hi';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {} finally { setLoading(false); }
  };

  if (sent) return (
    <div className="text-center animate-fade-in">
      <div className="w-16 h-16 bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <HiCheckCircle className="text-4xl text-green-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
      <p className="text-gray-400 mb-6">We've sent password reset instructions to your email.</p>
      <Link to="/login" className="btn-secondary">Back to Login</Link>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Forgot password?</h1>
        <p className="text-gray-400">Enter your email and we'll send reset instructions</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input {...register('email', { required: 'Email required' })} type="email"
              placeholder="you@example.com" className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Email'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-gray-400">
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">← Back to Login</Link>
      </p>
    </div>
  );
}
