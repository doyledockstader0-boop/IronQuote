'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// TYPES (matching summary/calculator)
// ============================================================================

interface CustomerInfo {
  firstName: string;
  lastName: string;
  businessName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
}

interface StandardArea {
  id: string;
  areaName: string;
  totalSqFt: number;
  floorType: string;
  soilLevel: string;
  runRate: number;
  hours: number;
  monthlyCost: number;
}

interface SUTMBathroom {
  id: string;
  bathroomName: string;
  totalSqFt: number;
  floorType: string;
  soilLevel: string;
  runRate: number;
  fixtureCount: number;
  minutesPerFixture: number;
  totalHours: number;
  monthlyCost: number;
}

interface QuoteData {
  quoteId: string;
  dateCreated: string;
  customerInfo: CustomerInfo;
  buildingType: string;
  standardAreas: StandardArea[];
  sutmBathrooms: SUTMBathroom[];
  frequency: number;
  hourlyRate: number;
  calculations: {
    totalSqFt: number;
    totalHours: number;
    finalTotalWithSurcharge: number;
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProposalPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiContent, setAiContent] = useState({
    introduction: '',
    serviceDescription: '',
    valueProposition: '',
  });

  // Mock data - In production, this would come from route params or state
  const quoteData: QuoteData = {
    quoteId: 'IQ-' + Date.now().toString().slice(-8),
    dateCreated: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    customerInfo: {
      firstName: 'John',
      lastName: 'Smith',
      businessName: 'Smith Medical Center',
      address: '123 Main Street',
      city: 'Salt Lake City',
      state: 'UT',
      zip: '84101',
      email: 'john@smithmedical.com',
      phone: '(801) 555-0123',
    },
    buildingType: 'Medical',
    standardAreas: [
      {
        id: '1',
        areaName: 'Lobby',
        totalSqFt: 500,
        floorType: 'Tile',
        soilLevel: 'Medium',
        runRate: 1500,
        hours: 0.33,
        monthlyCost: 42.87,
      },
      {
        id: '2',
        areaName: 'Hallways',
        totalSqFt: 800,
        floorType: 'VCT',
        soilLevel: 'Heavy',
        runRate: 1200,
        hours: 0.67,
        monthlyCost: 86.91,
      },
    ],
    sutmBathrooms: [
      {
        id: '1',
        bathroomName: 'Main Restroom',
        totalSqFt: 150,
        floorType: 'Tile',
        soilLevel: 'Heavy',
        runRate: 800,
        fixtureCount: 4,
        minutesPerFixture: 3.0,
        totalHours: 0.39,
        monthlyCost: 50.57,
      },
    ],
    frequency: 3,
    hourlyRate: 30,
    calculations: {
      totalSqFt: 1450,
      totalHours: 1.39,
      finalTotalWithSurcharge: 585.00,
    },
  };

  // Generate AI content using Claude
  const generateAIContent = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerInfo: quoteData.customerInfo,
          buildingType: quoteData.buildingType,
          totalSqFt: quoteData.calculations.totalSqFt,
          frequency: quoteData.frequency,
          monthlyTotal: quoteData.calculations.finalTotalWithSurcharge,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAiContent({
          introduction: data.content.introduction,
          serviceDescription: data.content.serviceDescription,
          valueProposition: data.content.valueProposition,
        });
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      // Use fallback content if API fails
      setAiContent({
        introduction: `Dear ${quoteData.customerInfo.firstName} ${quoteData.customerInfo.lastName},\n\nThank you for considering JanPro for your commercial cleaning needs at ${quoteData.customerInfo.businessName}. We are pleased to present this comprehensive proposal for professional cleaning services.`,
        serviceDescription: `Our team will provide thorough cleaning services ${quoteData.frequency} times per week, covering ${quoteData.calculations.totalSqFt} square feet of your ${quoteData.buildingType.toLowerCase()} facility. We use industry-leading techniques and eco-friendly products to ensure a pristine environment.`,
        valueProposition: 'With MedMetrix certification and years of experience in medical facility cleaning, we maintain the highest standards of cleanliness and safety. Our trained professionals follow strict protocols to create a healthy environment for your staff and patients.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    // PDF generation would go here
    alert('PDF download feature coming soon!');
  };

  const handleEmailProposal = () => {
    // Email functionality would go here
    alert(`Email would be sent to: ${quoteData.customerInfo.email}`);
  };

  return (
    <div 
      className="min-h-screen bg-[#000000] text-white"
      style={{ fontFamily: "'Work Sans', sans-serif" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1C1F26] border-b border-[#2C3038]/40 backdrop-blur-sm shadow-lg print:hidden">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#0A5CFF] grid place-items-center font-black text-white text-sm shadow-md">
              IQ
            </div>
            <div className="text-white font-semibold text-lg">IronQuote</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {!aiContent.introduction && (
              <button
                onClick={generateAIContent}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-[#0A5CFF] text-white rounded-md text-sm font-semibold hover:bg-[#0951E6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate AI Content
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2 bg-[#111317] border border-[#2C3038]/40 rounded-md text-sm text-[#E6E8EB] hover:border-[#0A5CFF] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1000px] mx-auto px-4 py-8">
        
        {/* Proposal Header */}
        <div className="bg-gradient-to-br from-[#1C1F26] to-[#111317] border border-[#0A5CFF]/30 rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Proposal</div>
              <div className="text-3xl font-bold text-white">{quoteData.quoteId}</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Date</div>
              <div className="text-lg font-semibold text-white">{quoteData.dateCreated}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[#2C3038]/40">
            <div>
              <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-2">Prepared For</div>
              <div className="text-lg font-semibold text-white mb-1">{quoteData.customerInfo.businessName}</div>
              <div className="text-sm text-[#E6E8EB]">
                {quoteData.customerInfo.firstName} {quoteData.customerInfo.lastName}<br />
                {quoteData.customerInfo.address}<br />
                {quoteData.customerInfo.city}, {quoteData.customerInfo.state} {quoteData.customerInfo.zip}<br />
                {quoteData.customerInfo.email}<br />
                {quoteData.customerInfo.phone}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-2">Prepared By</div>
              <div className="text-lg font-semibold text-white mb-1">JanPro Salt Lake City</div>
              <div className="text-sm text-[#E6E8EB]">
                Commercial Cleaning Services<br />
                MedMetrix Certified<br />
                contact@janproslc.com<br />
                (801) 555-CLEAN
              </div>
            </div>
          </div>
        </div>

        {/* AI-Generated Introduction */}
        {aiContent.introduction && (
          <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Introduction</h2>
            <p className="text-[#E6E8EB] whitespace-pre-line leading-relaxed">
              {aiContent.introduction}
            </p>
          </section>
        )}

        {/* Service Overview */}
        <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0A5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Service Overview
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#111317] border border-[#2C3038]/40 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Total Area</div>
              <div className="text-2xl font-bold text-white">{quoteData.calculations.totalSqFt.toLocaleString()}</div>
              <div className="text-xs text-[#7A7F87]">square feet</div>
            </div>
            <div className="bg-[#111317] border border-[#2C3038]/40 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Frequency</div>
              <div className="text-2xl font-bold text-white">{quoteData.frequency}x</div>
              <div className="text-xs text-[#7A7F87]">per week</div>
            </div>
            <div className="bg-[#111317] border border-[#2C3038]/40 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Facility Type</div>
              <div className="text-2xl font-bold text-white">{quoteData.buildingType}</div>
              <div className="text-xs text-[#7A7F87]">certified</div>
            </div>
            <div className="bg-[#111317] border border-[#2C3038]/40 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Hours/Week</div>
              <div className="text-2xl font-bold text-[#0A5CFF]">{(quoteData.calculations.totalHours * quoteData.frequency).toFixed(1)}</div>
              <div className="text-xs text-[#7A7F87]">hours</div>
            </div>
          </div>

          {aiContent.serviceDescription && (
            <p className="text-[#E6E8EB] leading-relaxed">
              {aiContent.serviceDescription}
            </p>
          )}
        </section>

        {/* Areas Included */}
        <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Areas Included</h2>
          
          <div className="space-y-3">
            {quoteData.standardAreas.map((area) => (
              <div key={area.id} className="flex items-center justify-between py-3 border-b border-[#2C3038]/20 last:border-0">
                <div>
                  <div className="text-white font-medium">{area.areaName}</div>
                  <div className="text-sm text-[#7A7F87]">{area.totalSqFt} sq ft • {area.floorType} • {area.soilLevel} soil</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">${area.monthlyCost.toFixed(2)}</div>
                  <div className="text-xs text-[#7A7F87]">/month</div>
                </div>
              </div>
            ))}
            
            {quoteData.sutmBathrooms.map((bathroom) => (
              <div key={bathroom.id} className="flex items-center justify-between py-3 border-b border-[#2C3038]/20 last:border-0">
                <div>
                  <div className="text-white font-medium">{bathroom.bathroomName}</div>
                  <div className="text-sm text-[#7A7F87]">{bathroom.totalSqFt} sq ft • {bathroom.fixtureCount} fixtures • {bathroom.soilLevel} soil</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">${bathroom.monthlyCost.toFixed(2)}</div>
                  <div className="text-xs text-[#7A7F87]">/month</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Value Proposition */}
        {aiContent.valueProposition && (
          <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Why Choose Us</h2>
            <p className="text-[#E6E8EB] leading-relaxed">
              {aiContent.valueProposition}
            </p>
          </section>
        )}

        {/* Investment Summary */}
        <section className="bg-gradient-to-br from-[#0A5CFF]/10 to-[#0951E6]/5 border-2 border-[#0A5CFF]/30 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Investment Summary</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-wide text-[#7A7F87] mb-2">Monthly Investment</div>
              <div className="text-xs text-[#7A7F87]">
                {quoteData.frequency}x per week • Professional service • MedMetrix certified
              </div>
            </div>
            <div className="text-6xl font-bold text-[#0A5CFF]">
              ${quoteData.calculations.finalTotalWithSurcharge.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#0A5CFF]/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-[#7A7F87] mb-1">Per Cleaning</div>
                <div className="text-xl font-semibold text-white">
                  ${(quoteData.calculations.finalTotalWithSurcharge / (quoteData.frequency * 4.33)).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#7A7F87] mb-1">Per Week</div>
                <div className="text-xl font-semibold text-white">
                  ${(quoteData.calculations.finalTotalWithSurcharge / 4.33).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#7A7F87] mb-1">Annual</div>
                <div className="text-xl font-semibold text-white">
                  ${(quoteData.calculations.finalTotalWithSurcharge * 12).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Terms & Conditions */}
        <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Terms & Conditions</h2>
          <ul className="space-y-2 text-sm text-[#E6E8EB]">
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-[#17C964] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>30-day notice required for service changes or cancellation</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-[#17C964] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>All cleaning supplies and equipment provided</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-[#17C964] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Fully insured and bonded service</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-[#17C964] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100% satisfaction guarantee</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-[#17C964] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Proposal valid for 30 days from date of issue</span>
            </li>
          </ul>
        </section>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
          <button
            onClick={() => router.push('/summary')}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#111317] border border-[#2C3038]/40 text-white rounded-lg text-base font-semibold hover:border-[#0A5CFF] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Summary
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#111317] border border-[#2C3038]/40 text-white rounded-lg text-base font-semibold hover:border-[#17C964] hover:text-[#17C964] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>

          <button
            onClick={handleEmailProposal}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#0A5CFF] text-white rounded-lg text-base font-bold hover:bg-[#0951E6] transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Proposal
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2C3038]/40 py-6 mt-12 print:hidden">
        <div className="max-w-[1000px] mx-auto px-4 text-center text-[#7A7F87] text-sm">
          IronQuote © {new Date().getFullYear()} — Professional proposals, powered by AI
        </div>
      </footer>
    </div>
  );
}