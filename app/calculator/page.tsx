'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// ============================================================================
// TYPES & INTERFACES
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
  length: number;
  width: number;
  totalSqFt: number;
  manualEntry: boolean;
  floorType: string;
  soilLevel: 'Light' | 'Medium' | 'Heavy' | '';
  runRate: number;
}

interface SUTMBathroom {
  id: string;
  bathroomName: string;
  length: number;
  width: number;
  totalSqFt: number;
  manualEntry: boolean;
  floorType: string;
  soilLevel: 'Light' | 'Medium' | 'Heavy' | '';
  runRate: number;
  fixtureCount: number;
  minutesPerFixture: number;
}

interface FrequencyRate {
  frequency: number;
  hourlyRate: number;
}

interface SpecialService {
  id: string;
  name: string;
  price: number;
  checked: boolean;
}

// ============================================================================
// CONSTANTS - FROM MOCK FILE
// ============================================================================

const BUILDING_TYPES = [
  'Office',
  'Medical',
  'Retail',
  'Industrial',
  'School',
  'Church',
  'Restaurant',
  'Other'
];

const FLOOR_TYPES = [
  'Carpet',
  'Tile',
  'VCT',
  'Concrete',
  'Hardwood',
  'Laminate',
  'Other'
];

const SOIL_LEVELS = ['Light', 'Medium', 'Heavy'];

const RUN_RATE_PRESETS = [250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 4000, 5000, 6000];
const HOURLY_RATE_PRESETS = [20, 22, 25, 27, 30, 32, 35, 40, 45, 50];
const MINUTES_PER_FIXTURE_PRESETS = [2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

const MONTHLY_MINIMUMS: Record<number, number> = {
  1: 275,
  2: 390,
  3: 585,
  4: 780,
  5: 975,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CalculatorPage() {
  const router = useRouter();
  // Theme state - DARK MODE ONLY for now
  const [compactMode, setCompactMode] = useState(false);

  // Load preferences
  useEffect(() => {
    const savedCompact = localStorage.getItem('ironquote-compact-mode');
    if (savedCompact) setCompactMode(savedCompact === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('ironquote-compact-mode', compactMode.toString());
  }, [compactMode]);

  // Form state
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    businessName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    email: '',
    phone: '',
  });

  const [buildingType, setBuildingType] = useState('');
  const [standardAreas, setStandardAreas] = useState<StandardArea[]>([
    {
      id: '1',
      areaName: '',
      length: 0,
      width: 0,
      totalSqFt: 0,
      manualEntry: false,
      floorType: '',
      soilLevel: '',
      runRate: 1000,
    },
  ]);

  const [sutmBathrooms, setSutmBathrooms] = useState<SUTMBathroom[]>([
    {
      id: '1',
      bathroomName: '',
      length: 0,
      width: 0,
      totalSqFt: 0,
      manualEntry: false,
      floorType: '',
      soilLevel: '',
      runRate: 800,
      fixtureCount: 0,
      minutesPerFixture: 3.0,
    },
  ]);

  const [frequencyRate, setFrequencyRate] = useState<FrequencyRate>({
    frequency: 3,
    hourlyRate: 30,
  });

  const [specialServices, setSpecialServices] = useState<SpecialService[]>([
    { id: '1', name: 'Carpet Cleaning', price: 75, checked: false },
    { id: '2', name: 'Window Cleaning', price: 150, checked: false },
    { id: '3', name: 'Floor Stripping & Waxing', price: 200, checked: false },
  ]);

  // ============================================================================
  // LOAD SAVED QUOTE DATA ON MOUNT - THIS FIXES THE BACK BUTTON BUG
  // ============================================================================
  useEffect(() => {
    const savedQuote = localStorage.getItem('ironquote-current-quote');
    if (savedQuote) {
      try {
        const data = JSON.parse(savedQuote);
        
        // Restore all form data
        if (data.customerInfo) setCustomerInfo(data.customerInfo);
        if (data.buildingType) setBuildingType(data.buildingType);
        if (data.standardAreas) setStandardAreas(data.standardAreas);
        if (data.sutmBathrooms) setSutmBathrooms(data.sutmBathrooms);
        if (data.frequencyRate) setFrequencyRate(data.frequencyRate);
        if (data.specialServices) setSpecialServices(data.specialServices);
        
        console.log('✅ Loaded saved quote data from localStorage');
      } catch (error) {
        console.error('Failed to load saved quote:', error);
      }
    }
  }, []); // Empty dependency array = runs once on mount

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  const calculations = useMemo(() => {
    const { frequency, hourlyRate } = frequencyRate;

    // Standard Areas calculations
    const standardAreasCalc = standardAreas.map((area) => {
      const sqFt = area.totalSqFt;
      const hours = sqFt > 0 && area.runRate > 0 ? sqFt / area.runRate : 0;
      const monthlyCost = hours * frequency * 4.33 * hourlyRate;
      return {
        ...area,
        sqFt,
        hours,
        monthlyCost,
      };
    });

    const standardTotal = standardAreasCalc.reduce((sum, area) => sum + area.monthlyCost, 0);
    const standardHours = standardAreasCalc.reduce((sum, area) => sum + area.hours, 0);
    const standardSqFt = standardAreasCalc.reduce((sum, area) => sum + area.sqFt, 0);

    // SUTM Bathrooms calculations
    const sutmBathroomsCalc = sutmBathrooms.map((bathroom) => {
      const sqFt = bathroom.totalSqFt;
      const areaHours = sqFt > 0 && bathroom.runRate > 0 ? sqFt / bathroom.runRate : 0;
      const fixtureHours = bathroom.fixtureCount > 0 ? (bathroom.fixtureCount * bathroom.minutesPerFixture) / 60 : 0;
      const totalHours = areaHours + fixtureHours;
      const monthlyCost = totalHours * frequency * 4.33 * hourlyRate;
      return {
        ...bathroom,
        sqFt,
        areaHours,
        fixtureHours,
        totalHours,
        monthlyCost,
      };
    });

    const sutmTotal = sutmBathroomsCalc.reduce((sum, bathroom) => sum + bathroom.monthlyCost, 0);
    const sutmHours = sutmBathroomsCalc.reduce((sum, bathroom) => sum + bathroom.totalHours, 0);
    const sutmSqFt = sutmBathroomsCalc.reduce((sum, bathroom) => sum + bathroom.sqFt, 0);

    // Special services
    const specialServicesTotal = specialServices
      .filter((s) => s.checked)
      .reduce((sum, s) => sum + s.price, 0);

    // Subtotal
    const subtotal = standardTotal + sutmTotal + specialServicesTotal;

    // Apply minimum
    const minimumRequired = MONTHLY_MINIMUMS[frequency] || 0;
    const minimumApplied = subtotal < minimumRequired;
    const finalTotal = minimumApplied ? minimumRequired : subtotal;
    const minimumDifference = minimumApplied ? minimumRequired - subtotal : 0;

    // Apply 6x/7x surcharge
    let surcharge = 0;
    let finalTotalWithSurcharge = finalTotal;
    if (frequency === 6 || frequency === 7) {
      surcharge = finalTotal * 0.2;
      finalTotalWithSurcharge = finalTotal + surcharge;
    }

    // Total hours and cost per clean
    const totalHours = standardHours + sutmHours;
    const totalSqFt = standardSqFt + sutmSqFt;
    const costPerClean = totalHours * hourlyRate;

    return {
      standardAreasCalc,
      standardTotal,
      standardHours,
      standardSqFt,
      sutmBathroomsCalc,
      sutmTotal,
      sutmHours,
      sutmSqFt,
      specialServicesTotal,
      subtotal,
      minimumRequired,
      minimumApplied,
      minimumDifference,
      finalTotal,
      surcharge,
      finalTotalWithSurcharge,
      totalHours,
      totalSqFt,
      costPerClean,
    };
  }, [standardAreas, sutmBathrooms, frequencyRate, specialServices]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const updateCustomerInfo = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };

  const addStandardArea = () => {
    setStandardAreas((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        areaName: '',
        length: 0,
        width: 0,
        totalSqFt: 0,
        manualEntry: false,
        floorType: '',
        soilLevel: '',
        runRate: 1000,
      },
    ]);
  };

  const removeStandardArea = (id: string) => {
    if (standardAreas.length > 1) {
      setStandardAreas((prev) => prev.filter((area) => area.id !== id));
    }
  };

  const updateStandardArea = (id: string, field: keyof StandardArea, value: any) => {
    setStandardAreas((prev) =>
      prev.map((area) => {
        if (area.id !== id) return area;
        const updated = { ...area, [field]: value };
        if (field === 'totalSqFt' && value > 0 && !area.manualEntry) {
          updated.manualEntry = true;
        }
        if ((field === 'length' || field === 'width') && !updated.manualEntry) {
          updated.totalSqFt = updated.length * updated.width;
        }
        if (field === 'manualEntry' && !value) {
          updated.totalSqFt = updated.length * updated.width;
        }
        return updated;
      })
    );
  };

  const addSutmBathroom = () => {
    setSutmBathrooms((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        bathroomName: '',
        length: 0,
        width: 0,
        totalSqFt: 0,
        manualEntry: false,
        floorType: '',
        soilLevel: '',
        runRate: 800,
        fixtureCount: 0,
        minutesPerFixture: 3.0,
      },
    ]);
  };

  const removeSutmBathroom = (id: string) => {
    if (sutmBathrooms.length > 1) {
      setSutmBathrooms((prev) => prev.filter((bathroom) => bathroom.id !== id));
    }
  };

  const updateSutmBathroom = (id: string, field: keyof SUTMBathroom, value: any) => {
    setSutmBathrooms((prev) =>
      prev.map((bathroom) => {
        if (bathroom.id !== id) return bathroom;
        const updated = { ...bathroom, [field]: value };
        if (field === 'totalSqFt' && value > 0 && !bathroom.manualEntry) {
          updated.manualEntry = true;
        }
        if ((field === 'length' || field === 'width') && !updated.manualEntry) {
          updated.totalSqFt = updated.length * updated.width;
        }
        if (field === 'manualEntry' && !value) {
          updated.totalSqFt = updated.length * updated.width;
        }
        return updated;
      })
    );
  };

  const toggleSpecialService = (id: string) => {
    setSpecialServices((prev) =>
      prev.map((service) => (service.id === id ? { ...service, checked: !service.checked } : service))
    );
  };

  const updateSpecialServicePrice = (id: string, price: number) => {
    setSpecialServices((prev) =>
      prev.map((service) => (service.id === id ? { ...service, price } : service))
    );
  };

  // ============================================================================
  // STYLES - EXACT MOCK FILE COLORS
  // ============================================================================

  const compactClass = compactMode ? 'text-sm' : '';

  return (
    <div 
      className={`min-h-screen bg-[#000000] text-white transition-colors ${compactClass}`}
      style={{ 
        fontFamily: "'Work Sans', sans-serif",
      } as React.CSSProperties}
    >
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#1C1F26] border-b border-[#2C3038]/40 backdrop-blur-sm shadow-lg">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#0A5CFF] grid place-items-center font-black text-white text-sm shadow-md">
              IQ
            </div>
            <div className="text-white font-semibold text-lg">IronQuote</div>
          </div>

          {/* Right Actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* NEW QUOTE BUTTON */}
            <button
              onClick={() => {
                if (confirm('Start a new quote? This will clear all current data.')) {
                  // Clear localStorage
                  localStorage.removeItem('ironquote-current-quote');
                  // Reload page to reset form
                  window.location.reload();
                }
              }}
              className="flex items-center gap-2 px-3 py-2 bg-[#111317] border border-[#17C964]/40 rounded-md text-sm text-[#17C964] hover:bg-[#17C964]/10 transition-colors"
              title="Start a new quote"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Quote
            </button>

            <button
              onClick={() => setCompactMode(!compactMode)}
              className="flex items-center gap-2 px-3 py-2 bg-[#111317] border border-[#2C3038]/40 rounded-md text-sm text-[#E6E8EB] hover:border-[#0A5CFF] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {compactMode ? 'Normal' : 'Compact'}
            </button>

            {/* Light Mode Placeholder - Disabled */}
            <button
              disabled
              className="p-2 bg-[#111317] border border-[#2C3038]/40 rounded-md text-[#7A7F87] cursor-not-allowed opacity-50"
              title="Light mode coming soon"
            >
              ☀️
            </button>

            <button 
              onClick={() => {
                // Save all quote data to localStorage
                const quoteData = {
                  quoteId: 'IQ-' + Date.now().toString().slice(-8),
                  dateCreated: new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }), 
                  customerInfo,
                  buildingType,
                  standardAreas: calculations.standardAreasCalc,
                  sutmBathrooms: calculations.sutmBathroomsCalc,
                  frequencyRate,
                  specialServices,
                  calculations: {
                    totalSqFt: calculations.totalSqFt,
                    totalHours: calculations.totalHours,
                    costPerClean: calculations.costPerClean,
                    standardTotal: calculations.standardTotal,
                    sutmTotal: calculations.sutmTotal,
                    specialServicesTotal: calculations.specialServicesTotal,
                    subtotal: calculations.subtotal,
                    finalTotal: calculations.finalTotal,
                    finalTotalWithSurcharge: calculations.finalTotalWithSurcharge,
                    minimumApplied: calculations.minimumApplied,
                    minimumRequired: calculations.minimumRequired,
                  },
                  timestamp: new Date().toISOString(),
                };
                
                localStorage.setItem('ironquote-current-quote', JSON.stringify(quoteData));
                console.log('💾 Saved quote data to localStorage');
                router.push('/summary');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#0A5CFF] text-white rounded-md text-sm font-semibold hover:bg-[#0951E6] transition-colors shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Quote
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Property Overview Card */}
            <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-xl shadow-lg overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-[#0A5CFF] to-[#0847CC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h2 className="font-bold text-white">Property Overview</h2>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-[#17C964]/20 text-[#17C964] border border-[#17C964]/30">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Live
                </span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Total Square Feet</div>
                    <div className="text-2xl font-bold text-white">{calculations.totalSqFt.toLocaleString()}</div>
                    <div className="text-xs text-[#7A7F87]">Combined areas</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Frequency</div>
                    <div className="text-2xl font-bold text-white">{frequencyRate.frequency}x</div>
                    <div className="text-xs text-[#7A7F87]">per week</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Labor Rate</div>
                    <div className="text-2xl font-bold text-white">${frequencyRate.hourlyRate}</div>
                    <div className="text-xs text-[#7A7F87]">per hour</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Hours / Clean</div>
                    <div className="text-2xl font-bold text-[#0A5CFF]">{calculations.totalHours.toFixed(2)}</div>
                    <div className="text-xs text-[#7A7F87]">per visit</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Customer Information */}
            <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-xl p-5 shadow-lg">
              <h2 className="text-white font-semibold mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={customerInfo.firstName}
                    onChange={(e) => updateCustomerInfo('firstName', e.target.value)}
                    className="w-full bg-[#111317] text-white px-3 py-2 rounded-md border border-[#E6E8EB]/15 focus:border-[#0A5CFF] focus:ring-1 focus:ring-[#0A5CFF] outline-none transition-all placeholder-[#7A7F87]"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={customerInfo.lastName}
                    onChange={(e) => updateCustomerInfo('lastName', e.target.value)}
                    className="w-full bg-[#111317] text-white px-3 py-2 rounded-md border border-[#E6E8EB]/15 focus:border-[#0A5CFF] focus:ring-1 focus:ring-[#0A5CFF] outline-none transition-all placeholder-[#7A7F87]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Business Name"
                  value={customerInfo.businessName}
                  onChange={(e) => updateCustomerInfo('businessName', e.target.value)}
                  className="w-full bg-[#111317] text-white px-3 py-2 rounded-md border border-[#E6E8EB]/15 focus:border-[#0A5CFF] focus:ring-1 focus:ring-[#0A5CFF] outline-none transition-all placeholder-[#7A7F87]"
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  value={customerInfo.address}
                  onChange={(e) => updateCustomerInfo('address', e.target.value)}
                  className="w-full bg-[#111317] text-white px-3 py-2 rounded-md border border-[#E6E8EB]/15 focus:border-[#0A5CFF] focus:ring-1 focus:ring-[#0A5CFF] outline-none transition-all placeholder-[#7A7F87]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={customerInfo.city}
                    onChange={(e) => updateCustomerInfo('city', e.target.value)}
                    className="w-full bg-[#111317] text-white px-3 py-2 rounded-md border border-[#E6E8EB]/15 focus:border-[#0A5CFF] focus:ring-1 focus:ring-[#0A5CFF] outline-none transition-all placeholder-[#7A7F87]"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={customerInfo.state}
                    onChange={(e) => updateCustomerInfo('state', e.target.value)}
                    className="w-full bg-[#111317] text-white px-3 py-2 rounded-md border border-[#E6E8EB]/15 focus:border-[#0A5CFF] focus:ring-1 focus:ring-[#0A5CFF] outline-none transition-all placeholder-[#7A7F87]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Zip Code"
                    value={customerInfo.zip}
                    onChange={(e) => updateCustomerInfo('zip', e.target.value)}
                    className="w-full bg-[#111317] text-white px-3 py-2 rounded-md border border-[#E6E8EB]/15 focus:border-[#0A5CFF] focus:ring-1 focus:ring-[#0A5CFF] outline-none transition-all placeholder-[#7A7F87]"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={customerInfo.phone}
                    onChange={(e) => updateCustomerInfo('phone', e.target.value)}
                    className="w-full bg-[#111317] text-white px-3 py-2 rounded-md border border-[#E6E8EB]/15 focus:border-[#0A5CFF] focus:ring-1 focus:ring-[#0A5CFF] outline-none transition-all placeholder-[#7A7F87]"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={customerInfo.email}
                  onChange={(e) => updateCustomerInfo('email', e.target.value)}
                  className="w-full bg-[#111317] text-white px-3 py-2 rounded-md border border-[#E6E8EB]/15 focus:border-[#0A5CFF] focus:ring-1 focus:ring-[#0A5CFF] outline-none transition-all placeholder-[#7A7F87]"
                />
              </div>
            </section>

            {/* Standard Areas - NO EMPTY GRID! */}
            <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Standard Areas</h2>
              </div>

              <div className="flex gap-3 mb-4">
                <select
                  value={buildingType}
                  onChange={(e) => setBuildingType(e.target.value)}
                  className="flex-1 bg-[#111317] text-white px-3 py-2 rounded-md border border-[#E6E8EB]/15 focus:border-[#0A5CFF] focus:ring-1 focus:ring-[#0A5CFF] outline-none transition-all"
                >
                  <option value="">Building Type (Optional)</option>
                  {BUILDING_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <button
                  onClick={addStandardArea}
                  className="px-4 py-2 bg-[#0A5CFF] text-white rounded-md text-sm font-medium hover:bg-[#0951E6] transition-colors whitespace-nowrap shadow-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Area
                </button>
              </div>

              {/* Clean table - only filled rows */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#E6E8EB] border-b border-[#2C3038]/40">
                      <th className="px-2 py-2 text-left text-xs font-semibold">Area Name</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold">L</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold">W</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold">Sq Ft</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold">Floor</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold">Soil</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold">Run Rate</th>
                      <th className="px-2 py-2 text-right text-xs font-semibold">Monthly</th>
                      <th className="px-2 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {standardAreas.map((area, index) => {
                      const calc = calculations.standardAreasCalc[index];
                      return (
                        <tr key={area.id} className="border-b border-[#2C3038]/20">
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              placeholder="Room name"
                              value={area.areaName}
                              onChange={(e) => updateStandardArea(area.id, 'areaName', e.target.value)}
                              className="w-full bg-[#111317] text-white px-2 py-1.5 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm placeholder-[#7A7F87] min-w-[100px]"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={area.length || ''}
                              onChange={(e) => updateStandardArea(area.id, 'length', Number(e.target.value))}
                              disabled={area.manualEntry}
                              className="w-16 bg-[#111317] text-white px-2 py-1.5 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm disabled:opacity-50"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={area.width || ''}
                              onChange={(e) => updateStandardArea(area.id, 'width', Number(e.target.value))}
                              disabled={area.manualEntry}
                              className="w-16 bg-[#111317] text-white px-2 py-1.5 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm disabled:opacity-50"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={area.totalSqFt || ''}
                              onChange={(e) => updateStandardArea(area.id, 'totalSqFt', Number(e.target.value))}
                              className="w-20 bg-[#111317] text-white px-2 py-1.5 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <select
                              value={area.floorType}
                              onChange={(e) => updateStandardArea(area.id, 'floorType', e.target.value)}
                              className="w-24 bg-[#111317] text-white px-2 py-1.5 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm"
                            >
                              <option value="">-</option>
                              {FLOOR_TYPES.map((type) => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <select
                              value={area.soilLevel}
                              onChange={(e) => updateStandardArea(area.id, 'soilLevel', e.target.value)}
                              className="w-24 bg-[#111317] text-white px-2 py-1.5 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm"
                            >
                              <option value="">-</option>
                              {SOIL_LEVELS.map((level) => (
                                <option key={level} value={level}>{level}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              list={`runrate-${area.id}`}
                              value={area.runRate || ''}
                              onChange={(e) => updateStandardArea(area.id, 'runRate', Number(e.target.value))}
                              className="w-24 bg-[#111317] text-white px-2 py-1.5 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm"
                              min="100"
                              max="10000"
                              step="50"
                            />
                            <datalist id={`runrate-${area.id}`}>
                              {RUN_RATE_PRESETS.map((rate) => (
                                <option key={rate} value={rate} />
                              ))}
                            </datalist>
                          </td>
                          <td className="px-2 py-2 text-right font-medium text-white">
                            ${calc?.monthlyCost.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-2 py-2">
                            {standardAreas.length > 1 && (
                              <button
                                onClick={() => removeStandardArea(area.id)}
                                className="text-[#F31260] hover:text-[#F31260]/80 text-sm font-bold"
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t border-[#2C3038]/40 font-semibold text-white">
                    <tr>
                      <td colSpan={3} className="px-2 py-2 text-right text-xs">Total:</td>
                      <td className="px-2 py-2 text-xs">{calculations.standardSqFt.toFixed(0)} sf</td>
                      <td colSpan={2} className="px-2 py-2 text-right text-xs">{calculations.standardHours.toFixed(2)} hrs</td>
                      <td className="px-2 py-2"></td>
                      <td className="px-2 py-2 text-right text-[#0A5CFF]">${calculations.standardTotal.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {/* SUTM Bathrooms - NO EMPTY GRID! */}
            <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-white font-semibold">SUTM Areas</h2>
                  <p className="text-xs text-[#7A7F87] mt-0.5">Bathrooms with area + fixture cleaning</p>
                </div>
                <button
                  onClick={addSutmBathroom}
                  className="px-4 py-2 bg-[#0A5CFF] text-white rounded-md text-sm font-medium hover:bg-[#0951E6] transition-colors shadow-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Bathroom
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#E6E8EB] border-b border-[#2C3038]/40">
                      <th className="px-2 py-2 text-left text-xs font-semibold">Bathroom</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold">L</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold">W</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold">Sq Ft</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold">Floor</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold">Soil</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold">Run Rate</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold">Fixtures</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold">Min/Fix</th>
                      <th className="px-2 py-2 text-right text-xs font-semibold">Monthly</th>
                      <th className="px-2 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sutmBathrooms.map((bathroom, index) => {
                      const calc = calculations.sutmBathroomsCalc[index];
                      return (
                        <tr key={bathroom.id} className="border-b border-[#2C3038]/20">
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              placeholder="Bathroom name"
                              value={bathroom.bathroomName}
                              onChange={(e) => updateSutmBathroom(bathroom.id, 'bathroomName', e.target.value)}
                              className="w-full bg-[#111317] text-white px-2 py-1.5 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm placeholder-[#7A7F87] min-w-[100px]"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={bathroom.length || ''}
                              onChange={(e) => updateSutmBathroom(bathroom.id, 'length', Number(e.target.value))}
                              disabled={bathroom.manualEntry}
                              className="w-16 bg-[#111317] text-white px-2 py-1.5 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm disabled:opacity-50"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={bathroom.width || ''}
                              onChange={(e) => updateSutmBathroom(bathroom.id, 'width', Number(e.target.value))}
                              disabled={bathroom.manualEntry}
                              className="w-16 bg-[#111317] text-white px-2 py-1.5 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm disabled:opacity-50"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={bathroom.totalSqFt || ''}
                              onChange={(e) => updateSutmBathroom(bathroom.id, 'totalSqFt', Number(e.target.value))}
                              className="w-20 bg-[#111317] text-white px-2 py-1.5 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <select
                              value={bathroom.floorType}
                              onChange={(e) => updateSutmBathroom(bathroom.id, 'floorType', e.target.value)}
                              className="w-24 bg-[#111317] text-white px-2 py-1.5 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm"
                            >
                              <option value="">-</option>
                              {FLOOR_TYPES.map((type) => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <select
                              value={bathroom.soilLevel}
                              onChange={(e) => updateSutmBathroom(bathroom.id, 'soilLevel', e.target.value)}
                              className="w-24 bg-[#111317] text-white px-2 py-1.5 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm"
                            >
                              <option value="">-</option>
                              {SOIL_LEVELS.map((level) => (
                                <option key={level} value={level}>{level}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              list={`sutm-runrate-${bathroom.id}`}
                              value={bathroom.runRate || ''}
                              onChange={(e) => updateSutmBathroom(bathroom.id, 'runRate', Number(e.target.value))}
                              className="w-24 bg-[#111317] text-white px-2 py-1.5 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm"
                              min="100"
                              max="10000"
                              step="50"
                            />
                            <datalist id={`sutm-runrate-${bathroom.id}`}>
                              {RUN_RATE_PRESETS.map((rate) => (
                                <option key={rate} value={rate} />
                              ))}
                            </datalist>
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={bathroom.fixtureCount || ''}
                              onChange={(e) => updateSutmBathroom(bathroom.id, 'fixtureCount', Number(e.target.value))}
                              className="w-16 bg-[#111317] text-white px-2 py-1.5 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm"
                              min="0"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              list={`minutes-${bathroom.id}`}
                              value={bathroom.minutesPerFixture || ''}
                              onChange={(e) => updateSutmBathroom(bathroom.id, 'minutesPerFixture', Number(e.target.value))}
                              className="w-16 bg-[#111317] text-white px-2 py-1.5 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm"
                              min="1"
                              max="10"
                              step="0.25"
                            />
                            <datalist id={`minutes-${bathroom.id}`}>
                              {MINUTES_PER_FIXTURE_PRESETS.map((min) => (
                                <option key={min} value={min} />
                              ))}
                            </datalist>
                          </td>
                          <td className="px-2 py-2 text-right font-medium text-white">
                            ${calc?.monthlyCost.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-2 py-2">
                            {sutmBathrooms.length > 1 && (
                              <button
                                onClick={() => removeSutmBathroom(bathroom.id)}
                                className="text-[#F31260] hover:text-[#F31260]/80 text-sm font-bold"
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t border-[#2C3038]/40 font-semibold text-white">
                    <tr>
                      <td colSpan={3} className="px-2 py-2 text-right text-xs">Total:</td>
                      <td className="px-2 py-2 text-xs">{calculations.sutmSqFt.toFixed(0)} sf</td>
                      <td colSpan={4} className="px-2 py-2 text-right text-xs">{calculations.sutmHours.toFixed(2)} hrs</td>
                      <td className="px-2 py-2"></td>
                      <td className="px-2 py-2 text-right text-[#0A5CFF]">${calculations.sutmTotal.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {/* Frequency & Hourly Rate */}
            <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-xl p-5 shadow-lg">
              <h2 className="text-white font-semibold mb-4">Frequency & Hourly Rate</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] text-[#E6E8EB]/80 mb-1">Cleaning Frequency</label>
                  <select
                    value={frequencyRate.frequency}
                    onChange={(e) => setFrequencyRate({ ...frequencyRate, frequency: Number(e.target.value) })}
                    className="w-full bg-[#111317] text-white px-3 py-2 rounded-md border border-[#E6E8EB]/15 focus:border-[#0A5CFF] focus:ring-1 focus:ring-[#0A5CFF] outline-none transition-all"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((freq) => (
                      <option key={freq} value={freq}>{freq}x per week</option>
                    ))}
                  </select>
                  {MONTHLY_MINIMUMS[frequencyRate.frequency] && (
                    <p className="text-xs text-[#7A7F87] mt-1">
                      Minimum: ${MONTHLY_MINIMUMS[frequencyRate.frequency]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[13px] text-[#E6E8EB]/80 mb-1">Hourly Rate</label>
                  <input
                    type="number"
                    list="hourly-rates"
                    value={frequencyRate.hourlyRate || ''}
                    onChange={(e) => setFrequencyRate({ ...frequencyRate, hourlyRate: Number(e.target.value) })}
                    className="w-full bg-[#111317] text-white px-3 py-2 rounded-md border border-[#E6E8EB]/15 focus:border-[#0A5CFF] focus:ring-1 focus:ring-[#0A5CFF] outline-none transition-all"
                    min="15"
                    max="100"
                    step="0.5"
                  />
                  <datalist id="hourly-rates">
                    {HOURLY_RATE_PRESETS.map((rate) => (
                      <option key={rate} value={rate} />
                    ))}
                  </datalist>
                  <p className="text-xs text-[#7A7F87] mt-1">Recommended: $20-$50/hr</p>
                </div>
              </div>
            </section>

            {/* Special Services */}
            <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-xl p-5 shadow-lg">
              <h2 className="text-white font-semibold mb-4">Special Services</h2>
              <div className="space-y-3">
                {specialServices.map((service) => (
                  <div key={service.id} className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={service.checked}
                      onChange={() => toggleSpecialService(service.id)}
                      className="h-4 w-4 rounded border-[#2C3038] text-[#0A5CFF] focus:ring-[#0A5CFF] bg-[#111317]"
                    />
                    <span className="flex-1 text-white">{service.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#7A7F87]">$</span>
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => updateSpecialServicePrice(service.id, Number(e.target.value))}
                        className="w-24 bg-[#111317] text-white px-3 py-2 rounded border border-[#E6E8EB]/15 focus:border-[#0A5CFF] outline-none text-sm text-right"
                        min="0"
                        step="5"
                      />
                      <span className="text-[#7A7F87]">/mo</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar - Quote Summary (Sticky) */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-xl shadow-xl">
                <div className="px-5 py-4 border-b border-[#2C3038]/40 flex items-center justify-between">
                  <h2 className="font-semibold text-white">Quote Summary</h2>
                  <button className="text-xs text-[#E6E8EB]/80 hover:text-[#0A5CFF] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  {/* Customer Display */}
                  {(customerInfo.firstName || customerInfo.businessName) && (
                    <div className="pb-3 border-b border-[#2C3038]/40">
                      <p className="text-sm font-medium text-white">
                        {customerInfo.firstName} {customerInfo.lastName}
                      </p>
                      {customerInfo.businessName && (
                        <p className="text-xs text-[#7A7F87]">{customerInfo.businessName}</p>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Hours / Clean</div>
                      <div className="text-3xl font-bold text-white">{calculations.totalHours.toFixed(2)}</div>
                      <div className="text-xs text-[#7A7F87]">Computed from run rates</div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Cost / Clean</div>
                      <div className="text-3xl font-bold text-white">${calculations.costPerClean.toFixed(2)}</div>
                      <div className="text-xs text-[#7A7F87]">{frequencyRate.frequency}x / wk</div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Monthly Total</div>
                      <div className="text-4xl font-bold text-[#0A5CFF]">${calculations.finalTotalWithSurcharge.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                      <div className="text-xs text-[#7A7F87]">Includes 4.33 factor</div>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="pt-3 border-t border-[#2C3038]/40 space-y-2 text-sm">
                    <div className="flex justify-between text-white">
                      <span className="text-[#7A7F87]">Standard Areas</span>
                      <span className="font-medium">${calculations.standardTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white">
                      <span className="text-[#7A7F87]">SUTM Bathrooms</span>
                      <span className="font-medium">${calculations.sutmTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white">
                      <span className="text-[#7A7F87]">Special Services</span>
                      <span className="font-medium">${calculations.specialServicesTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Validation Badge */}
                  <div className="pt-3 border-t border-[#2C3038]/40">
                    <div className="flex items-center gap-2 text-xs text-[#17C964]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Domain rates in use</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="pt-3 border-t border-[#2C3038]/40 grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        alert('Quote saved as draft!');
                      }}
                      className="px-3 py-2 bg-[#111317] border border-[#2C3038]/40 text-white text-sm rounded-md hover:border-[#0A5CFF] transition-colors font-medium"
                    >
                      Save Draft
                    </button>
                    <button 
                      onClick={() => {
                        // Save all quote data to localStorage and navigate to Summary
                        const quoteData = {
                          quoteId: 'IQ-' + Date.now().toString().slice(-8),
                          dateCreated: new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }), 
                          customerInfo,
                          buildingType,
                          standardAreas: calculations.standardAreasCalc,
                          sutmBathrooms: calculations.sutmBathroomsCalc,
                          frequencyRate,
                          specialServices,
                          calculations: {
                            totalSqFt: calculations.totalSqFt,
                            totalHours: calculations.totalHours,
                            costPerClean: calculations.costPerClean,
                            standardTotal: calculations.standardTotal,
                            sutmTotal: calculations.sutmTotal,
                            specialServicesTotal: calculations.specialServicesTotal,
                            subtotal: calculations.subtotal,
                            finalTotal: calculations.finalTotal,
                            finalTotalWithSurcharge: calculations.finalTotalWithSurcharge,
                            minimumApplied: calculations.minimumApplied,
                            minimumRequired: calculations.minimumRequired,
                          },
                          timestamp: new Date().toISOString(),
                        };
                        
                        localStorage.setItem('ironquote-current-quote', JSON.stringify(quoteData));
                        router.push('/summary');
                      }}
                      className="px-3 py-2 bg-[#0A5CFF] text-white text-sm font-semibold rounded-md hover:bg-[#0951E6] transition-colors shadow-sm"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2C3038]/40 py-6 mt-12">
        <div className="max-w-[1600px] mx-auto px-4 text-center text-[#7A7F87] text-sm">
          IronQuote © {new Date().getFullYear()} — Price with certainty.
        </div>
      </footer>
    </div>
  );
}