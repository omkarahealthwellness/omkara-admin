'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error('Global boundary caught error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-sandstone/10 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg text-center space-y-6 border">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-gray-900">Something went wrong</h2>
          <p className="text-muted-foreground text-sm">
            We encountered an unexpected error while loading this page. Our team has been notified.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={() => reset()}
            className="w-full bg-crimson-spice hover:bg-crimson-spice/90 text-white"
          >
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
