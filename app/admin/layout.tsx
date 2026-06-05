import { Suspense } from 'react';
import AdminLayoutInner from './layout-inner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading admin...</p>
        </div>
      </div>
    }>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
