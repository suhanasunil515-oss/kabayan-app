'use client';

import React, { createContext, useContext } from 'react';

interface AdminContextValue {
  adminRole: string | null;
}

const AdminContext = createContext<AdminContextValue>({ adminRole: null });

export function AdminProvider({ children, adminRole }: { children: React.ReactNode; adminRole: string | null }) {
  return <AdminContext.Provider value={{ adminRole }}>{children}</AdminContext.Provider>;
}

export function useAdminRole() {
  return useContext(AdminContext).adminRole;
}
