// Company information for admin documents (loan approval letters, repayment schedules, etc.)
export const COMPANY_INFO_FALLBACK = {
  name: process.env.COMPANY_NAME || 'PESO SHOP SUN FINANCE Corporation',
  secNumber: process.env.COMPANY_SEC_NUMBER || 'CS201916052',
  dateRegisteredSec: process.env.COMPANY_DATE_REGISTERED_SEC || 'October 2, 2019',
  address: process.env.COMPANY_ADDRESS || 'Unit 801 8th floor Bank of Makati Building , Ayala Avenue Ext. cor. Metropolitan Avenue , FOURTH DISTRICT, NATIONAL CAPITAL REGION (NCR), 1209',
  contactPhone: process.env.COMPANY_CONTACT_PHONE || '(9123) 345 6789',
  tagline: 'Empowering OFWs with fast, accessible, and secure financial solutions worldwide.',
  officerName: process.env.COMPANY_OFFICER_NAME || 'Patrick Dela Cruz',
  officerTitle: process.env.COMPANY_OFFICER_TITLE || 'FINANCIAL DEPARTMENT',
  status: process.env.COMPANY_STATUS || 'Registered',
  secondaryLicense: {
    type: process.env.SECONDARY_LICENSE_TYPE || 'Financing',
    licenseNumber: process.env.SECONDARY_LICENSE_NUMBER || '1239',
    dateIssued: process.env.SECONDARY_LICENSE_DATE_ISSUED || 'none',
    status: process.env.SECONDARY_LICENSE_STATUS || 'none'
  }
}

// Government logos for frontend (landing page) - Generic OFW-focused
export const GOVERNMENT_LOGOS = {
  // Primary OFW agencies (for landing page)
  dmw: '/logos/dmw.png',           // Department of Migrant Workers
  owwa: '/logos/OWWA.png',          // Overseas Workers Welfare Administration
  bsp: '/logos/BSP.png',            // Bangko Sentral ng Pilipinas
  dof: '/logos/DOF.png',            // Department of Finance
  sec: '/logos/SEC.png',            // Securities and Exchange Commission
  bp: '/logos/BP.png',              // Bagong Pilipinas
  npc: '/logos/npc.png',            // National Privacy Commission (ADD THIS LINE)
}

// Company logos for admin documents ONLY
export const COMPANY_LOGOS = {
  main: '/logos/PSSFC.png',         // Your company logo - ONLY appears in admin docs
  stamp: '/logos/Signature_Stamp.png',
  approvalStamp: '/logos/LOAN_APPROVED.png',
  signature: '/logos/Signature.png'
}

// Helper function to check if we're on admin side vs frontend
export const isAdminRoute = (pathname: string): boolean => {
  return pathname?.startsWith('/admin') || false
}

// Combined logos for admin documents (company + government)
export const ADMIN_DOCUMENT_LOGOS = {
  company: COMPANY_LOGOS.main,
  government: {
    sec: GOVERNMENT_LOGOS.sec,
    bsp: GOVERNMENT_LOGOS.bsp,
    dof: GOVERNMENT_LOGOS.dof,
    dmw: GOVERNMENT_LOGOS.dmw,
    owwa: GOVERNMENT_LOGOS.owwa,
    bp: GOVERNMENT_LOGOS.bp
  }
}
