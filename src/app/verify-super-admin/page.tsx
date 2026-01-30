// app/verify-super-admin/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

// Separate component for the search params logic
function VerificationContent() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
  
      // Alternative way to get token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromURL = urlParams.get('token');
            
      const finalToken = token || tokenFromURL;
      
      if (!finalToken) {
        setStatus('error');
        setMessage('No verification token found in URL. Please check the verification link.');
        
        await Swal.fire({
          icon: 'error',
          title: 'Invalid Link',
          text: 'The verification link is missing the token. Please request a new verification email.',
          confirmButtonText: 'Request New Email',
          confirmButtonColor: '#dc2626',
        });
        
        router.push('/');
        return;
      }

      try { 
        const response = await fetch(`${API_URL}/api/admin/verify-super-admin`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: finalToken }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          
          await Swal.fire({
            icon: 'success',
            title: 'Verified Successfully!',
            html: `
              <div style="text-align: left;">
                <p>Your Super Admin account is now active!</p>
              </div>
            `,
            confirmButtonText: 'Go to Login',
            confirmButtonColor: '#dc2626',
            width: 500
          });
          
          // Redirect to login
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
          
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
          
          await Swal.fire({
            icon: 'error',
            title: 'Verification Failed',
            html: `
              <div style="text-align: left;">
                <p>❌ ${data.error || 'Invalid or expired token'}</p>
                <p style="margin-top: 10px; color: #666;">
                  Possible reasons:
                  <ul style="margin-left: 20px;">
                    <li>Token expired (1 hour validity)</li>
                    <li>Already verified</li>
                    <li>Invalid token</li>
                  </ul>
                </p>
              </div>
            `,
            confirmButtonText: 'Go to Login',
            confirmButtonColor: '#dc2626',
            width: 500
          });
          
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please try again.');
        
        await Swal.fire({
          icon: 'error',
          title: 'Connection Error',
          text: 'Unable to connect to server. Please check your internet connection.',
          confirmButtonText: 'Retry',
          confirmButtonColor: '#dc2626',
        });
        
        // Try again after 3 seconds
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    };

    verifyToken();
  }, [searchParams, router, API_URL]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
         style={{ backgroundImage: "url('/login-background.jpg')" }}>
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
        
        <div className="flex justify-center items-center mb-6">
          <Image
            src="/images/logo/logo.png"
            alt="Logo"
            width={300}
            height={60}
            priority
            className="object-contain"
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {status === 'verifying' && 'Verifying Email'}
          {status === 'success' && 'Verification Complete!'}
          {status === 'error' && 'Verification Failed'}
        </h1>

        <div className="my-6">
          {status === 'verifying' && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mb-4"></div>
              <p className="text-gray-600">{message}</p>
              <p className="text-gray-500 text-sm mt-2">
                Please wait while we verify your token...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium">{message}</p>
              <p className="text-gray-600 mt-2">Redirecting to login page...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium">{message}</p>
              <p className="text-gray-500 text-sm mt-2">
                Please try again or contact support
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          {status !== 'verifying' && (
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition duration-200"
            >
              Go to Login Page
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-lg transition duration-200 hover:bg-gray-50"
          >
            Back to Home
          </button>
          
          {status === 'error' && (
            <button
              onClick={() => window.location.reload()}
              className="w-full border border-blue-300 text-blue-600 font-medium py-3 rounded-lg transition duration-200 hover:bg-blue-50"
            >
              ↻ Try Again
            </button>
          )}
        </div>

        <div className="text-gray-500 text-sm mt-6 space-y-1">
          <p>Having issues? Contact support</p>
          <p className="text-xs">Token troubleshooting guide:</p>
          <ul className="text-xs text-left mt-2 space-y-1">
            <li>• Ensure you clicked the complete link from email</li>
            <li>• Token expires in 1 hour</li>
            <li>• Try copying and pasting the full URL</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function VerifySuperAdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
           style={{ backgroundImage: "url('/login-background.jpg')" }}>
        <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="flex justify-center items-center mb-6">
            <Image
              src="/images/logo/logo.png"
              alt="Logo"
              width={300}
              height={60}
              priority
              className="object-contain"
            />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verification page...</p>
        </div>
      </div>
    }>
      <VerificationContent />
    </Suspense>
  );
}