'use client';

import React, { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL 

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState<boolean>(true); 
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('🔍 Checking auth status...');
        const response = await fetch(`${API_URL}/api/admin/me`, {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Already logged in:', data);
          
          // Redirect based on user type
          if (data.userType === 'SUPER_ADMIN') {
            console.log('👑 Redirecting SUPER_ADMIN to dashboard');
            router.push('/super-admin-dashboard');
          } else if (data.userType === 'ADMIN') {
            console.log('👤 Redirecting ADMIN to dashboard');
            router.push('/admin-dashboard');
          } else {
            console.log('👤 Redirecting USER to dashboard');
            router.push('/dashboard');
          }
        } else {
          console.log('ℹ️ Not logged in');
        }
      } catch (error) {
        console.log('❌ Auth check failed:', error);
      }
    };

    // If just logged in, wait a bit for cookies
    if (justLoggedIn) {
      setTimeout(() => {
        checkAuthStatus();
        setJustLoggedIn(false);
      }, 500);
    } else {
      checkAuthStatus();
    }
  }, [router, justLoggedIn]);

  const validation = (): boolean => {
    // Login validation
    if (isLogin) {
      if (username.length === 0 || password.length === 0) {
        return false;
      }
    } 
    // Registration validation
    else {
      if (email.length === 0 || username.length === 0 || password.length === 0 || confirmPassword.length === 0) {
        return false;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Please enter a valid email address",
          showConfirmButton: false,
          timer: 2000,
        });
        return false;
      }
      
      if (password.length < 6) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Password must be at least 6 characters",
          showConfirmButton: false,
          timer: 2000,
        });
        return false;
      }
      if (password !== confirmPassword) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Passwords do not match",
          showConfirmButton: false,
          timer: 2000,
        });
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validation()) {
      if (isLogin && (username.length === 0 || password.length === 0)) {
        await Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Please Fill All Fields",
          showConfirmButton: false,
          timer: 2000,
        });
      }
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login request
        console.log('🔐 Attempting login...');
        
        const response = await fetch(`${API_URL}/api/admin/login`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            username: username.trim(),
            password: password
          })
        });

        const data = await response.json();
        console.log('📥 Login response:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        console.log('✅ Login successful');
        setJustLoggedIn(true);

        await Swal.fire({
          icon: "success",
          text: "Login Successfully!",
          html: `
            <div style="text-align: center;">
              <p>✅ Login successful!</p>
              <p class="mt-2 text-sm text-gray-600">
                Redirecting to dashboard...
              </p>
            </div>
          `,
          timer: 1500,
          showConfirmButton: false
        });

        // Clear form
        setUsername("");
        setPassword("");
        setShowPassword(false);

      } else {
        // Registration request (Super Admin creation)
        const response = await fetch(`${API_URL}/api/admin/create-super-admin`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            username: username.trim(),
            password: password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        await Swal.fire({
          icon: "success",
          title: "Success!",
          html: `
            <div style="text-align: left;">
              <p>✅ Super Admin created successfully!</p>
              <p class="mt-2">A verification email has been sent to:</p>
              <p class="font-bold text-red-500">${email}</p>
              <p class="mt-2 text-sm text-gray-600">
                Please check your inbox and click the verification link.
              </p>
              ${data.token ? `
                <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p class="text-sm font-medium text-yellow-800">Development Token:</p>
                  <p class="text-xs font-mono text-yellow-600 mt-1 break-all">${data.token}</p>
                  <p class="text-xs text-yellow-700 mt-1">Use this token in verification page</p>
                </div>
              ` : ''}
            </div>
          `,
          confirmButtonText: 'OK',
          confirmButtonColor: '#dc2626',
          width: 500
        });

        // Registration success - switch to login mode
        setIsLogin(true);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        
        await Swal.fire({
          icon: "info",
          text: "Please login with your credentials",
          showConfirmButton: false,
          timer: 2000,
        });
      }

    } catch (error: any) {
      console.error('❌ Error:', error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        html: `
          <div style="text-align: left;">
            <p class="font-medium">${error.message}</p>
            <p class="mt-2 text-sm text-gray-600">
              Please check your credentials and try again.
            </p>
          </div>
        `,
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc2626',
        width: 400
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
         style={{ 
           backgroundImage: "url('/login-background.jpg')",
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      
      {/* Fallback background if image fails */}
      
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Logo Section */}
          <div className="flex justify-center items-center mb-6">
            <div className="relative w-64 h-16">
              <Image
                src="/images/logo/logo.png"
                alt="Logo"
                fill
                priority
                sizes="(max-width: 256px) 100vw, 256px"
                className="object-contain"
                onError={(e) => {
                  console.log('Logo image failed, showing text fallback');
                  // You can set a state here to show text fallback
                }}
              />
            </div>
          </div>

          {/* Registration Fields - Email (Only for Registration) */}
          {!isLogin && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your email"
                required
              />
            </div>
          )}

          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password *
              {!isLogin && (
                <span className="text-xs text-gray-500 ml-2">(min 6 characters)</span>
              )}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder={isLogin ? "Enter your password" : "Enter password (min 6 characters)"}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Only for Registration) */}
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium text-lg py-3 rounded-lg transition duration-200 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? "Logging in..." : "Creating Account..."}
              </>
            ) : (
              isLogin ? "Login" : "Create Super Admin"
            )}
          </button>

          {/* Toggle Mode Button */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={toggleMode}
              disabled={loading}
              className="text-red-500 hover:text-red-600 font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLogin 
                ? "Don't have an account? Create Super Admin" 
                : "Already have an account? Login"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}