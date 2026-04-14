import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import { HiMail, HiLockClosed, HiArrowRight } from 'react-icons/hi';

export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { isLoading, error } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => { return () => dispatch(clearError()); }, [dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(login(data));
    if (!result.error) navigate('/dashboard');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-gray-400">Sign in to continue your journey</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
              })}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Password</label>
            <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              {...register('password', { required: 'Password is required' })}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className={`input pl-10 ${errors.password ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full justify-center py-3 text-base"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><span>Sign in</span><HiArrowRight /></>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Create one free
        </Link>
      </p>
    </div>
  );
}
