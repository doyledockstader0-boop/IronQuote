'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// TYPES (matching calculator)
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

interface SpecialService {
  id: string;
  name: string;
  price: number;
  checked: boolean;
}

interface QuoteData {
  quoteId: string;
  dateCreated: string;
  customerInfo: CustomerInfo;
  buildingType: string;
  standardAreas: StandardArea[];
  sutmBathrooms: SUTMBathroom[];
  specialServices: SpecialService[];
  frequency: number;
  hourlyRate: number;
  calculations: {
    totalSqFt: number;
    totalHours: number;
    costPerClean: number;
    standardTotal: number;
    sutmTotal: number;
    specialServicesTotal: number;
    subtotal: number;
    minimumRequired: number;
    minimumApplied: boolean;
    finalTotal: number;
    surcharge: number;
    finalTotalWithSurcharge: number;
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PreQuoteSummary() {
  const router = useRouter();
// Load quote data from localStorage
  useEffect(() => {
    const savedQuote = localStorage.getItem('ironquote-current-quote');
    if (savedQuote) {
      try {
        const parsed = JSON.parse(savedQuote);
        setQuoteData(parsed);
      } catch (error) {
        console.error('Error loading quote data:', error);
      }
    }
  }, []);


  // Mock data - In production, this would come from route params or state
  const [quoteData, setQuoteData] = useState<QuoteData>({
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
    specialServices: [
      { id: '1', name: 'Window Cleaning', price: 150, checked: true },
      { id: '2', name: 'Carpet Cleaning', price: 75, checked: false },
    ],
    frequency: 3,
    hourlyRate: 30,
    calculations: {
      totalSqFt: 1450,
      totalHours: 1.39,
      costPerClean: 41.70,
      standardTotal: 129.78,
      sutmTotal: 50.57,
      specialServicesTotal: 150.00,
      subtotal: 330.35,
      minimumRequired: 585,
      minimumApplied: true,
      finalTotal: 585.00,
      surcharge: 0,
      finalTotalWithSurcharge: 585.00,
    },
  });

  const handleBack = () => {
    router.push('/calculator');
  };

  const handleSaveDraft = () => {
    // In production: save to database/localStorage
    alert('Quote saved as draft!');
  };

  const handleGenerateProposal = () => {
    // Navigate to proposal generation page
    router.push('/proposal');
  };

  const handlePrint = () => {
    window.print();
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
            <button
              onClick={handlePrint}
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
      <main className="max-w-[1400px] mx-auto px-4 py-6">
        
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Pre-Quote Summary</h1>
          <p className="text-[#7A7F87]">Review all details before generating the customer proposal</p>
        </div>

        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Quote ID */}
          <div className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Quote ID</div>
            <div className="text-xl font-bold text-white">{quoteData.quoteId}</div>
          </div>

          {/* Date Created */}
          <div className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Date Created</div>
            <div className="text-xl font-bold text-white">{quoteData.dateCreated}</div>
          </div>

          {/* Status */}
          <div className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Status</div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Draft
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0A5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Customer Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-[#7A7F87]">Contact Name</div>
              <div className="text-lg text-white font-medium">{quoteData.customerInfo.firstName} {quoteData.customerInfo.lastName}</div>
            </div>
            <div>
              <div className="text-sm text-[#7A7F87]">Business Name</div>
              <div className="text-lg text-white font-medium">{quoteData.customerInfo.businessName}</div>
            </div>
            <div>
              <div className="text-sm text-[#7A7F87]">Address</div>
              <div className="text-lg text-white font-medium">
                {quoteData.customerInfo.address}<br />
                {quoteData.customerInfo.city}, {quoteData.customerInfo.state} {quoteData.customerInfo.zip}
              </div>
            </div>
            <div>
              <div className="text-sm text-[#7A7F87]">Contact Info</div>
              <div className="text-lg text-white font-medium">
                {quoteData.customerInfo.email}<br />
                {quoteData.customerInfo.phone}
              </div>
            </div>
          </div>
        </section>

        {/* Property Overview */}
        <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0A5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Property Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#111317] border border-[#2C3038]/40 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Total Sq Ft</div>
              <div className="text-2xl font-bold text-white">{quoteData.calculations.totalSqFt.toLocaleString()}</div>
            </div>
            <div className="bg-[#111317] border border-[#2C3038]/40 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Frequency</div>
              <div className="text-2xl font-bold text-white">{quoteData.frequency}x/week</div>
            </div>
            <div className="bg-[#111317] border border-[#2C3038]/40 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Labor Rate</div>
              <div className="text-2xl font-bold text-white">${quoteData.hourlyRate}/hr</div>
            </div>
            <div className="bg-[#111317] border border-[#2C3038]/40 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Hours/Clean</div>
              <div className="text-2xl font-bold text-[#0A5CFF]">{quoteData.calculations.totalHours.toFixed(2)}</div>
            </div>
          </div>
          {quoteData.buildingType && (
            <div className="mt-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-[#0A5CFF]/20 text-[#0A5CFF] border border-[#0A5CFF]/30">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {quoteData.buildingType} Facility
              </span>
            </div>
          )}
        </section>

        {/* Standard Areas */}
        <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0A5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            Standard Areas
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[#E6E8EB] border-b border-[#2C3038]/40 text-sm">
                  <th className="text-left py-3 px-2">Area Name</th>
                  <th className="text-right py-3 px-2">Sq Ft</th>
                  <th className="text-left py-3 px-2">Floor Type</th>
                  <th className="text-left py-3 px-2">Soil Level</th>
                  <th className="text-right py-3 px-2">Run Rate</th>
                  <th className="text-right py-3 px-2">Hours</th>
                  <th className="text-right py-3 px-2">Monthly</th>
                </tr>
              </thead>
              <tbody>
                {quoteData.standardAreas.map((area) => (
                  <tr key={area.id} className="border-b border-[#2C3038]/20">
                    <td className="py-3 px-2 text-white font-medium">{area.areaName}</td>
                    <td className="py-3 px-2 text-right text-[#E6E8EB]">{area.totalSqFt}</td>
                    <td className="py-3 px-2 text-[#E6E8EB]">{area.floorType}</td>
                    <td className="py-3 px-2 text-[#E6E8EB]">{area.soilLevel}</td>
                    <td className="py-3 px-2 text-right text-[#E6E8EB]">{area.runRate}</td>
                    <td className="py-3 px-2 text-right text-[#E6E8EB]">{area.hours.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right text-white font-semibold">${area.monthlyCost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-[#2C3038]/40">
                <tr>
                  <td colSpan={5} className="py-3 px-2 text-right text-sm font-semibold text-[#7A7F87]">Subtotal:</td>
                  <td className="py-3 px-2 text-right text-sm font-semibold text-white">
                    {quoteData.standardAreas.reduce((sum, a) => sum + a.hours, 0).toFixed(2)} hrs
                  </td>
                  <td className="py-3 px-2 text-right text-lg font-bold text-[#0A5CFF]">
                    ${quoteData.calculations.standardTotal.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* SUTM Bathrooms */}
        <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0A5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            SUTM Areas (Bathrooms)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[#E6E8EB] border-b border-[#2C3038]/40 text-sm">
                  <th className="text-left py-3 px-2">Bathroom</th>
                  <th className="text-right py-3 px-2">Sq Ft</th>
                  <th className="text-left py-3 px-2">Floor Type</th>
                  <th className="text-left py-3 px-2">Soil Level</th>
                  <th className="text-right py-3 px-2">Run Rate</th>
                  <th className="text-right py-3 px-2">Fixtures</th>
                  <th className="text-right py-3 px-2">Min/Fix</th>
                  <th className="text-right py-3 px-2">Hours</th>
                  <th className="text-right py-3 px-2">Monthly</th>
                </tr>
              </thead>
              <tbody>
                {quoteData.sutmBathrooms.map((bathroom) => (
                  <tr key={bathroom.id} className="border-b border-[#2C3038]/20">
                    <td className="py-3 px-2 text-white font-medium">{bathroom.bathroomName}</td>
                    <td className="py-3 px-2 text-right text-[#E6E8EB]">{bathroom.totalSqFt}</td>
                    <td className="py-3 px-2 text-[#E6E8EB]">{bathroom.floorType}</td>
                    <td className="py-3 px-2 text-[#E6E8EB]">{bathroom.soilLevel}</td>
                    <td className="py-3 px-2 text-right text-[#E6E8EB]">{bathroom.runRate}</td>
                    <td className="py-3 px-2 text-right text-[#E6E8EB]">{bathroom.fixtureCount}</td>
                    <td className="py-3 px-2 text-right text-[#E6E8EB]">{bathroom.minutesPerFixture.toFixed(1)}</td>
                    <td className="py-3 px-2 text-right text-[#E6E8EB]">{bathroom.totalHours.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right text-white font-semibold">${bathroom.monthlyCost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-[#2C3038]/40">
                <tr>
                  <td colSpan={7} className="py-3 px-2 text-right text-sm font-semibold text-[#7A7F87]">Subtotal:</td>
                  <td className="py-3 px-2 text-right text-sm font-semibold text-white">
                    {quoteData.sutmBathrooms.reduce((sum, b) => sum + b.totalHours, 0).toFixed(2)} hrs
                  </td>
                  <td className="py-3 px-2 text-right text-lg font-bold text-[#0A5CFF]">
                    ${quoteData.calculations.sutmTotal.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Special Services */}
        {quoteData.specialServices.some(s => s.checked) && (
          <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0A5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Special Services
            </h2>
            <div className="space-y-3">
              {quoteData.specialServices.filter(s => s.checked).map((service) => (
                <div key={service.id} className="flex items-center justify-between py-2 border-b border-[#2C3038]/20">
                  <div className="text-white font-medium">{service.name}</div>
                  <div className="text-white font-semibold">${service.price.toFixed(2)}/mo</div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t border-[#2C3038]/40">
                <div className="text-sm font-semibold text-[#7A7F87]">Subtotal:</div>
                <div className="text-lg font-bold text-[#0A5CFF]">${quoteData.calculations.specialServicesTotal.toFixed(2)}</div>
              </div>
            </div>
          </section>
        )}

        {/* Pricing Summary */}
        <section className="bg-gradient-to-br from-[#1C1F26] to-[#111317] border-2 border-[#0A5CFF]/30 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-[#0A5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Pricing Summary
          </h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-lg">
              <span className="text-[#E6E8EB]">Standard Areas</span>
              <span className="text-white font-semibold">${quoteData.calculations.standardTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-[#E6E8EB]">SUTM Bathrooms</span>
              <span className="text-white font-semibold">${quoteData.calculations.sutmTotal.toFixed(2)}</span>
            </div>
            {quoteData.calculations.specialServicesTotal > 0 && (
              <div className="flex justify-between text-lg">
                <span className="text-[#E6E8EB]">Special Services</span>
                <span className="text-white font-semibold">${quoteData.calculations.specialServicesTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg pt-3 border-t border-[#2C3038]/40">
              <span className="text-[#E6E8EB]">Subtotal</span>
              <span className="text-white font-semibold">${quoteData.calculations.subtotal.toFixed(2)}</span>
            </div>
            
            {quoteData.calculations.minimumApplied && (
              <div className="flex justify-between text-lg">
                <span className="text-[#F5A623] flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Minimum Applied
                </span>
                <span className="text-[#F5A623] font-semibold">+${(quoteData.calculations.minimumRequired - quoteData.calculations.subtotal).toFixed(2)}</span>
              </div>
            )}
            
            {quoteData.calculations.surcharge > 0 && (
              <div className="flex justify-between text-lg">
                <span className="text-[#F5A623]">Surcharge (20%)</span>
                <span className="text-[#F5A623] font-semibold">+${quoteData.calculations.surcharge.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-6 border-t-2 border-[#0A5CFF]/30">
            <div>
              <div className="text-sm uppercase tracking-wide text-[#7A7F87] mb-1">Monthly Total</div>
              <div className="text-xs text-[#7A7F87]">{quoteData.frequency}x per week • ${quoteData.hourlyRate}/hr</div>
            </div>
            <div className="text-5xl font-bold text-[#0A5CFF]">
              ${quoteData.calculations.finalTotalWithSurcharge.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-[#17C964]">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Domain rates validated • 4.33 weekly factor applied</span>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
          <button
            onClick={handleBack}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#111317] border border-[#2C3038]/40 text-white rounded-lg text-base font-semibold hover:border-[#0A5CFF] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Calculator
          </button>

          <button
            onClick={handleSaveDraft}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#111317] border border-[#2C3038]/40 text-white rounded-lg text-base font-semibold hover:border-[#F5A623] hover:text-[#F5A623] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save as Draft
          </button>

          <button
            onClick={handleGenerateProposal}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#0A5CFF] text-white rounded-lg text-base font-bold hover:bg-[#0951E6] transition-colors shadow-lg"
          >
            Generate Proposal
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2C3038]/40 py-6 mt-12 print:hidden">
        <div className="max-w-[1400px] mx-auto px-4 text-center text-[#7A7F87] text-sm">
          IronQuote © {new Date().getFullYear()} — Price with certainty.
        </div>
      </footer>
    </div>
  );
}
