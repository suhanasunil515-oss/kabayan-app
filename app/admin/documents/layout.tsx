'use client';

import { useAdminRole } from '@/contexts/admin-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { canAccessDocumentManagement } from '@/lib/admin-roles';

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const adminRole = useAdminRole();

  useEffect(() => {
    if (adminRole && !canAccessDocumentManagement(adminRole)) {
      router.replace('/admin/dashboard');
    }
  }, [adminRole, router]);

  return <>{children}</>;
}
