import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register as registerUser, clearError } from '../../store/slices/authSlice';
import { HiMail, HiLockClosed, HiUser, HiArrowRight, HiCheckCircle } from 'react-icons/hi';

const DOMAINS = [
  'Web Development', 'Mobile Development', 'Data Science',
  'Machine Learning', 'DevOps', 'Cybersecurity', 'Blockchain',
  'Cloud Computing', 'UI/UX Design', 'Other',
];

export default function RegisterPage() {
  const dispatch = useDispatch();
  const { isLoading, error, justRegistered, user } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { role: 'student' } });

  useEffect(() => { return () => dispatch(clearError()); }, [dispatch]);

  const onSubmit = async (data) => {
    dispatch(registerUser(data));
    // ✅ We do NOT navigate — we wait for justRegistered to show success screen
  };

  // ✅ Show email verification screen after register — not dashboard
  if (justRegistered) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <HiCheckCircle className="text-5xl text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Check your email!</h1>
        <p className="text-gray-400 mb-2">
          We sent a verification link to:
        </p>
        <p className="text-indigo-300 font-semibold text-lg mb-6">
          {user?.email}
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Click the link in the email to verify your account, then come back to log in.
        </p>
        <Link to="/login" className="btn-primary w-full justify-center py-3">
          Go to Login <HiArrowRight />
        </Link>
        <p className="mt-4 text-xs text-gray-500">
          Didn't receive it? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Join SkillBridge</h1>
        <p className="text-gray-400">Start your learning journey today</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <div className="relative">
            <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
              })}
              placeholder="John Doe"
              className={`input pl-10 ${errors.name ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">Email</label>
          <div className="relative">
            <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
              })}
              type="email"
              placeholder="you@example.com"
              className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                  message: 'Need uppercase, lowercase, number & special character (@$!%*?&)',
                },
              })}
              type="password"
              placeholder="Min 8 chars, e.g. Hello@123"
              className={`input pl-10 ${errors.password ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">I am a…</label>
            <select {...register('role')} className="input">
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>
          <div>
            <label className="label">Tech Domain</label>
            <select {...register('techDomain')} className="input">
              <option value="">Select domain</option>
              {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full justify-center py-3 text-base mt-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><span>Create Account</span><HiArrowRight /></>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
