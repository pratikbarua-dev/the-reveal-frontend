'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Button from '../ui/Button';

export default function LoginButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signIn('google');
    } catch (error) {
      console.error('Sign in failed:', error);
      setLoading(false);
    }
  };

  return (
    <Button
      variant="primary"
      size="lg"
      loading={loading}
      onClick={handleLogin}
      className="w-full max-w-xs font-bold text-sm tracking-widest gap-3"
      icon={
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.19-2.77-6.19-6.19 0-3.41 2.78-6.19 6.19-6.19 1.488 0 2.85.53 3.916 1.408l3.1-3.1C18.99 1.956 15.82 1 12.24 1c-6.08 0-11 4.92-11 11s4.92 11 11 11c6.07 0 10.84-4.25 10.84-11 0-.765-.08-1.484-.23-2.115H12.24z" />
        </svg>
      }
    >
      Sign In With Google
    </Button>
  );
}
