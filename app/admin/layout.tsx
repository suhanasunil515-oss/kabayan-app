'use client';

import React, { useEffect, useState } from "react";
import { AdminSidebar } from '@/components/admin-sidebar';
import { AdminProvider } from '@/contexts/admin-context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          console.log('[v0] Admin not authenticated, redirecting to login');
          router.push('/admin-login');
          return;
        }

        const data = await response.json();
        if (data.success) {
          setAdminRole(data.admin?.role || null);
          setIsAuthorized(true);
        } else {
          router.push('/admin-login');
        }
      } catch (error) {
        console.error('[v0] Auth check error:', error);
        router.push('/admin-login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-blue-50 to-red-50 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 relative">
              <Image
                src={GOVERNMENT_LOGOS.bp}
                alt="KabayanLoan"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          {/* Brand Name */}
          <div className="flex items-baseline justify-center gap-1 mb-6">
            <span className="text-3xl font-black tracking-tight text-[#0038A8]">KABAYAN</span>
            <span className="text-3xl font-black tracking-tight text-[#CE1126]">LOAN</span>
          </div>
          
          {/* Spinner */}
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-16 h-16 border-4 border-[#0038A8] border-t-[#CE1126] rounded-full animate-spin" />
          </div>
          
          {/* Loading Text */}
          <p className="text-[#212529] font-medium text-lg">Loading Admin Portal...</p>
          <p className="text-[#6C757D] text-sm">Please wait while we verify your credentials</p>
          
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <AdminProvider adminRole={adminRole}>
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-blue-50 to-red-50">
        {/* Sidebar - role-based navigation */}
        <AdminSidebar adminRole={adminRole} />

        {/* Main Content */}
        <main className="md:ml-64 mt-14 md:mt-0 min-h-screen">
          {children}
        </main>
      </div>
    </AdminProvider>
  );
}
