'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignIn() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new auth page
    router.push('/auth');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>Redirecting to login...</p>
      </div>
    </div>
  );
}