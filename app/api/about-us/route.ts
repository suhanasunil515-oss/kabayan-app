import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // In production, fetch this from admin-configured database
    const aboutData = {
      company: 'Finance Company Inc.',
      intro:
        'We are a leading financial institution dedicated to providing accessible and transparent lending solutions to individuals and businesses.',
      mission:
        'Our mission is to empower people with financial opportunities through innovative, secure, and customer-centric loan services.',
      yearsActive: 10,
      security:
        'We employ industry-standard encryption, secure data storage, and multi-layer authentication to protect your information.',
      compliance:
        'Our platform complies with all local and international financial regulations, including data protection and lending standards.',
      email: 'support@financecompany.com',
      phone: '+1 (555) 123-4567',
      website: 'www.financecompany.com',
      faqItems: [
        {
          question: 'How long does loan approval take?',
          answer: 'Most loans are approved within 24-48 hours after all documents are verified.',
        },
        {
          question: 'Can I prepay my loan?',
          answer: 'Yes, you can prepay your loan anytime without any penalty charges.',
        },
        {
          question: 'What happens if I miss a payment?',
          answer: 'A late fee of 2% will be charged on the outstanding amount after 7 days of the due date.',
        },
        {
          question: 'Is my data secure?',
          answer: 'Yes, we use AES-256 encryption and comply with international security standards.',
        },
      ],
      policies: [
        { name: 'Privacy Policy', url: '/policies/privacy' },
        { name: 'Terms of Service', url: '/policies/terms' },
        { name: 'Data Protection', url: '/policies/data-protection' },
      ],
    };

    return NextResponse.json(aboutData);
  } catch (error) {
    console.error('About error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
