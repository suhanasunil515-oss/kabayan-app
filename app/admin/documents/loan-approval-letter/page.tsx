'use client';

import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Loader, Upload, X, Search, Printer, Shield, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import LoanApprovalLetterTemplate from '@/components/documents/loan-approval-letter-template';
import { COMPANY_INFO_FALLBACK, COMPANY_LOGOS, GOVERNMENT_LOGOS } from '@/lib/constants/company-info';

interface LoanData {
  documentNumber: string;
  borrowerName: string;
  idCardNumber: string;
  borrowerPhone: string;
  applicationDate: string;
  loanApprovalCode: string;
  loanAmount: string;
  interestRate: string;
  interestAmount: string;
  loanTerm: string;
  installmentDate: string;
  monthlyInstallment: string;
  totalRepayment: string;
  effectiveDate: string;
  idCardImage?: string;
  signatureImage?: string;
  nextInstallmentDate?: string;
}

export default function LoanApprovalLetterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLoanData, setCurrentLoanData] = useState<LoanData | null>(null);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [showNotFound, setShowNotFound] = useState(false);
  const [idCardImage, setIdCardImage] = useState<string | null>(null);

  // Clear not found message when typing
  useEffect(() => {
    if (showNotFound) {
      setShowNotFound(false);
    }
  }, [searchQuery]);

  // Calculate next installment date (15th of next month)
  const calculateNextInstallmentDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        const today = new Date();
        let nextMonth = today.getMonth() + 1;
        let year = today.getFullYear();
        if (nextMonth > 11) {
          nextMonth = 0;
          year += 1;
        }
        const nextDate = new Date(year, nextMonth, 15);
        return nextDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: '2-digit' 
        }).replace(/,/g, '');
      }
      
      let nextMonth = date.getMonth() + 1;
      let year = date.getFullYear();
      if (nextMonth > 11) {
        nextMonth = 0;
        year += 1;
      }
      const nextDate = new Date(year, nextMonth, 15);
      return nextDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      }).replace(/,/g, '');
    } catch (e) {
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 1);
      nextDate.setDate(15);
      return nextDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      }).replace(/,/g, '');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: '2-digit' 
        }).replace(/,/g, '');
      }
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      }).replace(/,/g, '');
    } catch (e) {
      return new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      }).replace(/,/g, '');
    }
  };

  // Search for EXACT document number only
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchQuery(query);
      setShowNotFound(false);
      setCurrentLoanData(null);
      setIdCardImage(null);
      return;
    }

    try {
      console.log('[v0] Search initiated with query:', query);
      
      const response = await fetch(`/api/admin/loans?search=${encodeURIComponent(query.trim())}&exact=true&limit=1`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Search failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Search returned unsuccessful response');
      }
      
      if (data.loans && data.loans.length > 0) {
        const loan = data.loans[0];
        console.log('[v0] Exact match found - Document:', loan.document_number, 'ID:', loan.id, 'Borrower:', loan.borrower_name);
        
        setSearchResult(loan);
        setShowNotFound(false);
        setSearchQuery(loan.document_number);
        fetchCompleteLoanData(loan.id, loan.document_number);
      } else {
        console.log('[v0] No exact match found for query:', query);
        setSearchQuery(query);
        setSearchResult(null);
        setCurrentLoanData(null);
        setIdCardImage(null);
        setShowNotFound(true);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown search error';
      console.error('[v0] Search error:', errorMsg);
      setSearchQuery(query);
      setCurrentLoanData(null);
      setIdCardImage(null);
      setShowNotFound(true);
      
      if (!errorMsg.includes('No exact') && query.length >= 3) {
        alert('Search Error:\n\n' + errorMsg);
      }
    }
  }, []);

  // Fetch complete loan data including KYC
  const fetchCompleteLoanData = async (loanId: string, documentNumber: string) => {
    try {
      setIsLoading(true);
      console.log('[v0] Fetching loan data for Document:', documentNumber);
      
      const loanResponse = await fetch(`/api/admin/loans/by-document/${encodeURIComponent(documentNumber)}`);
      
      if (!loanResponse.ok) {
        const errorData = await loanResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Fetch failed with status ${loanResponse.status}`);
      }
      
      const result = await loanResponse.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Invalid response format');
      }
      
      const loan = result.data;
      console.log('[v0] ✓ Loan data received - Document:', loan.document_number, 'Borrower:', loan.borrower_name);

      if (loan.document_number !== documentNumber) {
        console.error('[v0] ERROR: Document mismatch! Requested:', documentNumber, 'Got:', loan.document_number);
        throw new Error(`Document mismatch: Expected ${documentNumber}, got ${loan.document_number}`);
      }

      let frontIdImage = null;
      try {
        const kycResponse = await fetch(`/api/admin/kyc-documents?loan_id=${loan.id}`);
        if (kycResponse.ok) {
          const kycData = await kycResponse.json();
          const kycDoc = kycData.kyc_documents?.[0];
          frontIdImage = kycDoc?.front_id_image || loan.kyc_front_url || null;
        }
      } catch (error) {
        console.error('Error fetching KYC document:', error);
      }

      const loanAmount = Number(loan.loan_amount) || Number(loan.amount_requested) || 0;
      const loanPeriodMonths = Number(loan.loan_period_months) || Number(loan.loan_term_months) || 12;
      // Fixed 0.5% monthly interest rate for all loan terms
      const interestRate = 0.5;
      const monthlyInterest = loanAmount * (interestRate / 100);
      const monthlyPrincipal = loanAmount / loanPeriodMonths;
      const monthlyInstallment = monthlyPrincipal + monthlyInterest;
      const totalRepayment = loanAmount + (monthlyInterest * loanPeriodMonths);
      const applicationDate = loan.created_at ? formatDate(loan.created_at) : formatDate(new Date().toISOString());
      const nextInstallmentDate = calculateNextInstallmentDate(loan.created_at);

      setCurrentLoanData({
        documentNumber: loan.document_number || loan.order_number || documentNumber,
        borrowerName: loan.borrower_name || 'N/A',
        idCardNumber: loan.borrower_id_number || loan.id_number || 'N/A',
        borrowerPhone: loan.borrower_phone || 'N/A',
        applicationDate: applicationDate,
        loanApprovalCode: loan.document_number || loan.order_number || documentNumber,
        loanAmount: `₱${loanAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        interestRate: `${interestRate}%`,
        interestAmount: `₱${monthlyInterest.toFixed(2)} / Month`,
        loanTerm: `${loanPeriodMonths} months`,
        installmentDate: nextInstallmentDate,
        monthlyInstallment: `₱${monthlyInstallment.toFixed(2)}`,
        totalRepayment: `₱${totalRepayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        effectiveDate: formatDate(new Date().toISOString()),
        nextInstallmentDate: nextInstallmentDate,
        idCardImage: frontIdImage || undefined,
        signatureImage: undefined
      });

      setIdCardImage(frontIdImage);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[v0] Error fetching loan data:', errorMsg);
      setIsLoading(false);
      
      if (errorMsg.includes('Document mismatch')) {
        alert('⚠️ DATABASE INTEGRITY ERROR\n\n' +
          'The document number exists but database retrieval failed with a mismatch.\n\n' +
          'Details: ' + errorMsg + '\n\n' +
          'Action: Please contact support with this document number.');
      } else if (errorMsg.includes('not found')) {
        alert('Document Not Found\n\n' + errorMsg);
      } else {
        alert('Failed to load loan data.\n\nError: ' + errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setIdCardImage(base64);
      if (currentLoanData) {
        setCurrentLoanData({
          ...currentLoanData,
          idCardImage: base64
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const clearSearch = () => {
    console.log('[v0] Clearing search');
    setSearchQuery('');
    setCurrentLoanData(null);
    setIdCardImage(null);
    setSearchResult(null);
    setShowNotFound(false);
  };

  const handlePrint = () => {
    if (!currentLoanData) {
      alert('Please search and select a valid document number first');
      return;
    }

    const printContent = document.getElementById('loan-letter-export');
    if (!printContent) {
      alert('Preview element not found. Please make sure the preview is visible.');
      return;
    }

    const printElement = printContent.cloneNode(true) as HTMLElement;
    
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          const rules = styleSheet.cssRules || styleSheet.rules;
          if (!rules) return '';
          
          const cssRules = Array.from(rules)
            .map((rule) => rule.cssText)
            .join('');
          return `<style>${cssRules}</style>`;
        } catch (e) {
          return '';
        }
      })
      .join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the document');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Loan Approval Letter - ${currentLoanData.documentNumber}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${styles}
          <style>
            @page {
              size: A4;
              margin: 8mm;
            }
            @media print {
              html, body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
                background: white;
                font-family: Arial, sans-serif;
              }
              .container {
                width: 194mm;
                min-height: 281mm;
                margin: 0 auto;
                padding: 5mm;
                page-break-inside: avoid;
                break-inside: avoid;
              }
              img { max-width: 100%; height: auto; }
              .no-break { page-break-inside: avoid; }
              [data-id-card-container] {
                min-height: 260px;
                overflow: visible;
              }
              [data-id-card-container] img[alt="ID Card/Passport"] {
                object-fit: contain;
                max-height: 280px;
                width: auto;
                height: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${printElement.outerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const runDiagnostics = async () => {
    if (!searchQuery) {
      alert('Please enter a document number first');
      return;
    }

    try {
      const response = await fetch(`/api/admin/diagnostics/loan-search?document_number=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (!data.success) {
        alert('Diagnostic failed:\n\n' + data.error);
        return;
      }

      let message = 'DATABASE DIAGNOSTICS REPORT\n\n';
      message += `Document Number: ${data.document_number}\n\n`;
      
      message += `loan_applications table:\n`;
      message += `- Records found: ${data.loan_applications.count}\n`;
      if (data.loan_applications.count > 0) {
        data.loan_applications.records.forEach((r: any) => {
          message += `  • ID: ${r.id}, Borrower: ${r.users?.full_name || 'Unknown'}, Status: ${r.status}\n`;
        });
      }

      message += `\nloans table:\n`;
      message += `- Records found: ${data.loans_table.count}\n`;
      if (data.loans_table.count > 0) {
        data.loans_table.records.forEach((r: any) => {
          message += `  • ID: ${r.id}, Borrower: ${r.borrower_name || 'Unknown'}, Status: ${r.status}\n`;
        });
      }

      message += `\n\nDIAGNOSIS: ${data.diagnosis}`;

      alert(message);
      console.log('[v0] Full diagnostic data:', data);
    } catch (error) {
      alert('Diagnostic error:\n\n' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/documents" className="inline-flex items-center gap-2 text-[#0038A8] hover:text-[#CE1126] mb-4 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Documents
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">
                Loan Approval Letter
              </span>
            </h1>
            <p className="text-[#6C757D] mt-1">Generate professional loan approval letters with real-time borrower data and official stamps</p>
          </div>
          
          {/* Government Badge */}
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-red-50 px-3 py-1.5 rounded-full border border-[#0038A8]/20">
            <Shield className="w-4 h-4 text-[#0038A8]" />
            <span className="text-xs font-medium text-[#212529]">SEC • BSP • DMW</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 overflow-auto max-h-[800px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <Loader className="w-8 h-8 animate-spin text-[#0038A8] mb-4" />
                <p className="text-center font-medium">Loading loan data...</p>
              </div>
            ) : currentLoanData ? (
              <div id="loan-letter-export">
                <LoanApprovalLetterTemplate 
                  loanData={{
                    ...currentLoanData,
                    idCardImage: idCardImage || undefined
                  }} 
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <div className="w-20 h-20 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-center font-medium">Enter a document number to preview</p>
                <p className="text-sm text-gray-400 mt-2">Search for an exact document number to load loan details</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 h-fit sticky top-24">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#212529]">Generate Letter</h2>
          </div>

          {/* Document Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#212529] mb-3 flex items-center gap-1">
              <Search className="w-4 h-4 text-[#0038A8]" />
              Search Document Number
            </label>
            <div className="relative search-container">
              <div className="flex items-center gap-2 border-2 border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#0038A8] transition-shadow bg-white">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter exact document number..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 outline-none text-sm bg-transparent"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Not Found Message */}
              {showNotFound && searchQuery.length >= 3 && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-amber-700">
                        No loan found with document number "{searchQuery}"
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        Please verify the document number and try again.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message with Clear Button */}
              {currentLoanData && !showNotFound && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <CheckCircle className="w-4 h-4 text-[#00A86B] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-[#00A86B] font-medium">
                          ✓ Loaded: {currentLoanData.borrowerName}
                        </p>
                        <p className="text-xs text-[#00A86B] mt-1">
                          Document: {currentLoanData.documentNumber}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearSearch}
                      className="text-[#00A86B] hover:text-[#008f5a] text-xs font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ID Card Upload */}
          {currentLoanData && (
            <div className="mb-6 space-y-4 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-[#212529] flex items-center gap-1">
                <Shield className="w-4 h-4 text-[#0038A8]" />
                ID Card Verification
              </h3>

              {idCardImage && (
                <div className="mb-3">
                  <p className="text-xs text-[#6C757D] mb-2">ID Card Preview:</p>
                  <div className="relative w-full h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <img 
                      src={idCardImage} 
                      alt="ID Card Preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#6C757D] mb-2">
                  {idCardImage ? 'Replace ID Card Image' : 'Upload ID Card / Passport Image'}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="idCard-upload"
                  />
                  <label
                    htmlFor="idCard-upload"
                    className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#0038A8] transition-colors bg-white"
                  >
                    <Upload className="w-4 h-4 text-[#6C757D]" />
                    <span className="text-xs text-[#6C757D]">
                      {idCardImage ? 'Click to replace ID card' : 'Upload ID Card Image'}
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Max file size: 5MB. Accepted: JPG, PNG</p>
                </div>
              </div>
            </div>
          )}

          {/* Print Button */}
          <Button
            onClick={handlePrint}
            disabled={isLoading || !currentLoanData}
            className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                Print Document
              </>
            )}
          </Button>

          {/* Diagnostics Button */}
          {searchQuery && !currentLoanData && showNotFound && (
            <Button
              onClick={runDiagnostics}
              variant="outline"
              className="w-full mt-3 border-2 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Run Database Diagnostics
            </Button>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg border border-[#0038A8]/20">
            <h4 className="text-sm font-semibold text-[#212529] mb-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-[#00A86B]" />
              Document Information
            </h4>
            <ul className="text-xs text-[#6C757D] space-y-1.5">
              <li className="flex items-start">
                <span className="text-[#CE1126] mr-2">•</span>
                <span>Data is fetched in real-time from the database</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#CE1126] mr-2">•</span>
                <span>ID Card image is loaded from borrower's KYC documents</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#CE1126] mr-2">•</span>
                <span>Loan details are calculated based on actual loan terms</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#CE1126] mr-2">•</span>
                <span>Search returns ONLY exact document number matches</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Government Logos Strip */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-4 border border-[#0038A8]/20">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 relative">
              <Image src={GOVERNMENT_LOGOS.sec} alt="SEC" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-xs font-medium text-[#0038A8]">SEC Registered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 relative">
              <Image src={GOVERNMENT_LOGOS.bsp} alt="BSP" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-xs font-medium text-[#00A86B]">BSP Supervised</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 relative">
              <Image src={GOVERNMENT_LOGOS.dmw} alt="DMW" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-xs font-medium text-[#CE1126]">DMW Accredited</span>
          </div>
        </div>
      </div>
    </div>
  );
}
