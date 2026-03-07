// Admin Sidebar Navigation Component
'use client';

import { Button } from "@/components/ui/button"
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { LayoutDashboard, Users, FileText, Wallet, Menu, X, ChevronDown, Shield } from 'lucide-react';
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info';
import { canAccessAdministratorManagement, canAccessFundManagement, canAccessDocumentManagement } from '@/lib/admin-roles';

interface AdminSidebarProps {
  adminRole?: string | null;
}

export function AdminSidebar({ adminRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    documents: false,
  });

  const baseNavItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, show: true },
    { label: 'User Management', href: '/admin/users', icon: Users, show: true },
    { label: 'Loan Management', href: '/admin/loans', icon: FileText, show: true },
    { label: 'Fund Management', href: '/admin/funds', icon: Wallet, show: canAccessFundManagement(adminRole) },
  ];

  const navItems = baseNavItems.filter((i) => i.show);

  const showAdministratorManagement = canAccessAdministratorManagement(adminRole);

  const documentItems = [
    {
      label: 'Loan Approval Letter',
      href: '/admin/documents/loan-approval-letter',
    },
    {
      label: 'Loan List Table',
      href: '/admin/documents/loan-list-table',
    },
    {
      label: 'Repayment Schedule',
      href: '/admin/documents/repayment-schedule',
    },
  ];

  const isActive = (href: string) => pathname === href;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const NavContent = () => (
    <>
      {/* Logo/Brand - Updated to KabayanLoan */}
      <div className="p-6 border-b border-[#e9ecef] bg-gradient-to-r from-white to-[#f8f9fa]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 relative">
            <Image
              src={GOVERNMENT_LOGOS.bp}
              alt="KabayanLoan Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
              onError={() => {
                console.log('[v0] KabayanLoan logo failed to load');
              }}
            />
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="text-lg font-black tracking-tight">
                <span className="text-[#0038A8]">KABAYAN</span>
                <span className="text-[#CE1126]">LOAN</span>
              </span>
            </div>
            <p className="text-xs text-[#6C757D] font-medium">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? 'bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white shadow-md hover:shadow-lg'
                  : 'text-[#6C757D] hover:bg-[#f8f9fa] hover:text-[#0038A8]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Administrator Management - Superior Admin only */}
        {showAdministratorManagement && (
          <Link
            href="/admin/administrators"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/admin/administrators')
                ? 'bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white shadow-md hover:shadow-lg'
                : 'text-[#6C757D] hover:bg-[#f8f9fa] hover:text-[#0038A8]'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">Administrator Management</span>
          </Link>
        )}

        {canAccessDocumentManagement(adminRole) && (
        <div className="pt-4 border-t border-[#e9ecef] mt-4">
          <button
            onClick={() => toggleSection('documents')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              expandedSections.documents
                ? 'bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 text-[#0038A8] border-l-4 border-[#0038A8]'
                : 'text-[#6C757D] hover:bg-[#f8f9fa] hover:text-[#0038A8]'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium flex-1">Document Management</span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${expandedSections.documents ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Document Submenu */}
          {expandedSections.documents && (
            <div className="pl-8 mt-2 space-y-1">
              {documentItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${
                      active
                        ? 'bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white'
                        : 'text-[#6C757D] hover:bg-[#f8f9fa] hover:text-[#0038A8]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        )}
      </nav>

      {/* Footer - Optional */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#e9ecef] bg-white">
        <div className="flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-[#00A86B] rounded-full"></div>
          <span className="text-xs text-[#6C757D]">System Online</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r border-[#e9ecef] min-h-screen fixed left-0 top-0 overflow-y-auto shadow-sm">
        <NavContent />
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-[#e9ecef] z-50 flex items-center justify-between px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative">
            <Image
              src={GOVERNMENT_LOGOS.bp}
              alt="KabayanLoan Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="flex items-baseline">
            <span className="text-base font-black tracking-tight">
              <span className="text-[#0038A8]">KABAYAN</span>
              <span className="text-[#CE1126]">LOAN</span>
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)}>
          <aside className="bg-white w-64 h-screen overflow-y-auto shadow-lg">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}
