import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiLockClosed } from 'react-icons/hi';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ password }) => {
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch {
      // error handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Set new password</h1>
        <p className="text-gray-400">Choose a strong, secure password</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label">New Password</label>
          <div className="relative">
            <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                  message: 'Must include uppercase, lowercase, number and special character',
                },
              })}
              type="password"
              placeholder="••••••••"
              className={`input pl-10 ${errors.password ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="label">Confirm Password</label>
          <div className="relative">
            <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) =>
                  val === watch('password') || 'Passwords do not match',
              })}
              type="password"
              placeholder="••••••••"
              className={`input pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
}
