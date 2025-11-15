'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

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
  billingType: 'monthly' | 'one-time';
}

interface FrequencyRate {
  frequency: number;
  hourlyRate: number;
}

interface Photo {
  id: string;
  data: string; // base64
  name: string;
  timestamp: number;
}

interface QuoteData {
  quoteId: string;
  dateCreated: string;
  customerInfo: CustomerInfo;
  buildingType: string;
  standardAreas: StandardArea[];
  sutmBathrooms: SUTMBathroom[];
  specialServices: SpecialService[];
  initialClean?: { checked: boolean; price: number };
  frequencyRate: FrequencyRate;  // FIXED: Now expects frequencyRate object
  preferredCleaningDays?: boolean[];
  preferredCleaningTime?: string;
  siteNotes?: string;
  sitePhotos?: Photo[];
  calculations: {
    totalSqFt: number;
    totalHours: number;
    costPerClean: number;
    standardTotal: number;
    sutmTotal: number;
    specialServicesMonthlyTotal?: number;
    initialCleanTotal?: number;
    specialServicesTotal?: number; // Legacy support
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
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
      { id: '1', name: 'Window Cleaning', price: 150, checked: true, billingType: 'monthly' as const },
      { id: '2', name: 'Carpet Cleaning', price: 75, checked: false, billingType: 'monthly' as const },
    ],
    frequencyRate: {  // FIXED: Now stores as object
      frequency: 3,
      hourlyRate: 30
    },
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

  // Load quote data from localStorage
  useEffect(() => {
    const savedQuote = localStorage.getItem('ironquote-current-quote');
    if (savedQuote) {
      try {
        const parsed = JSON.parse(savedQuote);
        setQuoteData(parsed);
        console.log('✅ Loaded quote data from localStorage:', parsed);
      } catch (error) {
        console.error('Error loading quote data:', error);
      }
    }
  }, []);

  // Helper function to calculate special services totals
  const getSpecialServicesTotal = () => {
    if (quoteData.calculations.specialServicesMonthlyTotal !== undefined) {
      return quoteData.calculations.specialServicesMonthlyTotal || 0;
    }
    // Legacy support
    if (quoteData.calculations.specialServicesTotal !== undefined) {
      return quoteData.calculations.specialServicesTotal || 0;
    }
    // Fallback: calculate from specialServices array
    if (quoteData.specialServices && Array.isArray(quoteData.specialServices)) {
      return quoteData.specialServices
        .filter(s => s.checked && s.billingType === 'monthly')
        .reduce((sum, s) => sum + (s.price || 0), 0);
    }
    return 0;
  };

  // Helper function to get initial clean total
  const getInitialCleanTotal = () => {
    if (quoteData.calculations.initialCleanTotal !== undefined) {
      return quoteData.calculations.initialCleanTotal || 0;
    }
    if (quoteData.initialClean && quoteData.initialClean.checked) {
      return quoteData.initialClean.price || 0;
    }
    return 0;
  };

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

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add a new page if needed
      const checkNewPage = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Helper function to add simple section header (clean, minimal)
      const addSectionHeader = (text: string) => {
        checkNewPage(20);
        yPosition += 10; // Spacing above section
        
        // Simple blue header text
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(10, 92, 255); // Blue
        pdf.text(text, margin, yPosition);
        
        // Simple divider line
        pdf.setDrawColor(220, 220, 220); // Light gray
        pdf.setLineWidth(0.3);
        pdf.line(margin, yPosition + 2, margin + contentWidth, yPosition + 2);
        
        yPosition += 8; // Spacing below header
        pdf.setTextColor(0, 0, 0); // Reset to black
      };

      // Header with IronQuote branding (keep blue header)
      pdf.setFillColor(10, 92, 255);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text('IronQuote', margin, 20);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text('Commercial Cleaning Quote Summary', margin + 50, 20);
      yPosition = 40;

      // Quote ID and Date
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Quote ID: ${quoteData.quoteId}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Date Created: ${quoteData.dateCreated}`, margin, yPosition);
      yPosition += 12;

      // Customer Information
      addSectionHeader('Customer Information');
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Contact: ${quoteData.customerInfo.firstName} ${quoteData.customerInfo.lastName}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Business: ${quoteData.customerInfo.businessName}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Address: ${quoteData.customerInfo.address}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`${quoteData.customerInfo.city}, ${quoteData.customerInfo.state} ${quoteData.customerInfo.zip}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Email: ${quoteData.customerInfo.email}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Phone: ${quoteData.customerInfo.phone}`, margin, yPosition);
      yPosition += 12;

      // Property Overview
      addSectionHeader('Property Overview');
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Total Sq Ft: ${quoteData.calculations.totalSqFt.toLocaleString()}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Frequency: ${quoteData.frequencyRate.frequency}x/week`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Labor Rate: $${quoteData.frequencyRate.hourlyRate}/hr`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Hours per Clean: ${quoteData.calculations.totalHours.toFixed(2)}`, margin, yPosition);
      yPosition += 6;
      if (quoteData.buildingType) {
        pdf.text(`Building Type: ${quoteData.buildingType}`, margin, yPosition);
        yPosition += 6;
      }
      yPosition += 12;

      // Schedule & Access
      if (quoteData.preferredCleaningDays || quoteData.preferredCleaningTime) {
        addSectionHeader('Schedule & Access');
        
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        if (quoteData.preferredCleaningDays && quoteData.preferredCleaningDays.length === 7) {
          const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const selectedDays = quoteData.preferredCleaningDays
            .map((selected, index) => selected ? dayNames[index] : null)
            .filter(day => day !== null);
          
          if (selectedDays.length > 0) {
            pdf.text(`Preferred Cleaning Days: ${selectedDays.join(', ')}`, margin, yPosition);
            yPosition += 6;
          }
        }
        
        if (quoteData.preferredCleaningTime) {
          pdf.text(`Preferred Cleaning Time: ${quoteData.preferredCleaningTime}`, margin, yPosition);
          yPosition += 6;
        }
        
        yPosition += 12;
      }

      // Standard Areas Table - Clean minimal styling
      if (quoteData.standardAreas.length > 0) {
        addSectionHeader('Standard Areas');

        // Wider, more balanced column widths (scaled to fit 180mm content width)
        const colWidths = [34, 22, 22, 22, 24, 22, 30];
        const headers = ['Area', 'Sq Ft', 'Floor', 'Soil', 'Run Rate', 'Hours', 'Monthly'];
        const rowHeight = 8; // Increased from 7mm for better readability
        const cellPadding = 8; // Increased from 5mm for better spacing

        // Table header - minimal styling
        checkNewPage(rowHeight + 5);
        const headerY = yPosition;
        pdf.setFillColor(245, 245, 245); // Light gray background for headers
        pdf.rect(margin, headerY, contentWidth, rowHeight, 'F');
        pdf.setDrawColor(220, 220, 220); // Light gray border
        pdf.setLineWidth(0.3);
        pdf.rect(margin, headerY, contentWidth, rowHeight, 'S');
        
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(0, 0, 0);
        
        let xPos = margin + cellPadding;
        headers.forEach((header, i) => {
          // Center-align headers
          const textX = xPos + colWidths[i] / 2;
          pdf.text(header, textX, headerY + 5, { align: 'center' });
          xPos += colWidths[i];
        });
        yPosition += rowHeight + 3; // More spacing after header

        // Table rows - clean with subtle alternating backgrounds
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(9);
        quoteData.standardAreas.forEach((area, idx) => {
          checkNewPage(rowHeight + 3);
          
          const rowY = yPosition;
          
          // Subtle alternating row background
          if (idx % 2 === 0) {
            pdf.setFillColor(250, 250, 250);
          } else {
            pdf.setFillColor(255, 255, 255);
          }
          pdf.rect(margin, rowY, contentWidth, rowHeight, 'F');
          
          // Simple border
          pdf.setDrawColor(220, 220, 220);
          pdf.setLineWidth(0.3);
          pdf.rect(margin, rowY, contentWidth, rowHeight, 'S');
          
          // Vertical lines between columns
          xPos = margin;
          for (let i = 0; i < colWidths.length; i++) {
            xPos += colWidths[i];
            if (i < colWidths.length - 1) {
              pdf.setDrawColor(220, 220, 220);
              pdf.line(xPos, rowY, xPos, rowY + rowHeight);
            }
          }
          
          pdf.setTextColor(0, 0, 0);
          xPos = margin + cellPadding;
          
          // Area name - left aligned
          pdf.text(area.areaName.substring(0, 25), xPos, rowY + 5);
          xPos += colWidths[0];
          // Sq Ft - right aligned
          pdf.text(area.totalSqFt.toString(), xPos + colWidths[1] - cellPadding, rowY + 5, { align: 'right' });
          xPos += colWidths[1];
          // Floor type - left aligned
          pdf.text(area.floorType.substring(0, 10), xPos, rowY + 5);
          xPos += colWidths[2];
          // Soil level - left aligned
          pdf.text(area.soilLevel.substring(0, 10), xPos, rowY + 5);
          xPos += colWidths[3];
          // Run Rate - right aligned
          pdf.text(area.runRate.toString(), xPos + colWidths[4] - cellPadding, rowY + 5, { align: 'right' });
          xPos += colWidths[4];
          // Hours - right aligned
          pdf.text(area.hours.toFixed(2), xPos + colWidths[5] - cellPadding, rowY + 5, { align: 'right' });
          xPos += colWidths[5];
          // Monthly - right aligned
          pdf.text(`$${area.monthlyCost.toFixed(2)}`, xPos + colWidths[6] - cellPadding, rowY + 5, { align: 'right' });
          
          yPosition += rowHeight + 1; // Add spacing between rows
        });

        // Subtotal row - with spacing above
        yPosition += 3; // Add gap above subtotal row
        checkNewPage(rowHeight + 5);
        const subtotalY = yPosition;
        pdf.setFont(undefined, 'bold');
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.3);
        pdf.rect(margin, subtotalY, contentWidth, rowHeight, 'S');
        pdf.setTextColor(0, 0, 0);
        pdf.text('Subtotal:', margin + cellPadding, subtotalY + 5);
        pdf.text(`$${quoteData.calculations.standardTotal.toFixed(2)}`, margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6] - cellPadding, subtotalY + 5, { align: 'right' });
        yPosition += rowHeight + 5;
      }

      // SUTM Bathrooms Table - Clean minimal styling
      if (quoteData.sutmBathrooms.length > 0) {
        addSectionHeader('SUTM Areas (Bathrooms)');

        // Wider, more balanced column widths (scaled to fit 180mm content width)
        const colWidths = [30, 20, 20, 20, 22, 20, 20, 26];
        const headers = ['Bathroom', 'Sq Ft', 'Floor', 'Soil', 'Run Rate', 'Fixtures', 'Hours', 'Monthly'];
        const rowHeight = 8; // Increased from 7mm for better readability
        const cellPadding = 8; // Increased from 5mm for better spacing

        // Table header
        checkNewPage(rowHeight + 5);
        const headerY = yPosition;
        pdf.setFillColor(245, 245, 245); // Light gray background for headers
        pdf.rect(margin, headerY, contentWidth, rowHeight, 'F');
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.3);
        pdf.rect(margin, headerY, contentWidth, rowHeight, 'S');
        
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(0, 0, 0);
        
        let xPos = margin + cellPadding;
        headers.forEach((header, i) => {
          // Center-align headers
          const textX = xPos + colWidths[i] / 2;
          pdf.text(header, textX, headerY + 5, { align: 'center' });
          xPos += colWidths[i];
        });
        yPosition += rowHeight + 3; // More spacing after header

        // Table rows
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(9);
        quoteData.sutmBathrooms.forEach((bathroom, idx) => {
          checkNewPage(rowHeight + 3);
          
          const rowY = yPosition;
          
          if (idx % 2 === 0) {
            pdf.setFillColor(250, 250, 250);
          } else {
            pdf.setFillColor(255, 255, 255);
          }
          pdf.rect(margin, rowY, contentWidth, rowHeight, 'F');
          
          pdf.setDrawColor(220, 220, 220);
          pdf.setLineWidth(0.3);
          pdf.rect(margin, rowY, contentWidth, rowHeight, 'S');
          
          // Vertical lines
          xPos = margin;
          for (let i = 0; i < colWidths.length; i++) {
            xPos += colWidths[i];
            if (i < colWidths.length - 1) {
              pdf.setDrawColor(220, 220, 220);
              pdf.line(xPos, rowY, xPos, rowY + rowHeight);
            }
          }
          
          pdf.setTextColor(0, 0, 0);
          xPos = margin + cellPadding;
          
          // Bathroom name - left aligned
          pdf.text(bathroom.bathroomName.substring(0, 20), xPos, rowY + 5);
          xPos += colWidths[0];
          // Sq Ft - right aligned
          pdf.text(bathroom.totalSqFt.toString(), xPos + colWidths[1] - cellPadding, rowY + 5, { align: 'right' });
          xPos += colWidths[1];
          // Floor type - left aligned
          pdf.text(bathroom.floorType.substring(0, 8), xPos, rowY + 5);
          xPos += colWidths[2];
          // Soil level - left aligned
          pdf.text(bathroom.soilLevel.substring(0, 8), xPos, rowY + 5);
          xPos += colWidths[3];
          // Run Rate - right aligned
          pdf.text(bathroom.runRate.toString(), xPos + colWidths[4] - cellPadding, rowY + 5, { align: 'right' });
          xPos += colWidths[4];
          // Fixtures - right aligned
          pdf.text(bathroom.fixtureCount.toString(), xPos + colWidths[5] - cellPadding, rowY + 5, { align: 'right' });
          xPos += colWidths[5];
          // Hours - right aligned
          pdf.text(bathroom.totalHours.toFixed(2), xPos + colWidths[6] - cellPadding, rowY + 5, { align: 'right' });
          xPos += colWidths[6];
          // Monthly - right aligned
          pdf.text(`$${bathroom.monthlyCost.toFixed(2)}`, xPos + colWidths[7] - cellPadding, rowY + 5, { align: 'right' });
          
          yPosition += rowHeight + 1; // Add spacing between rows
        });

        // Subtotal row - with spacing above
        yPosition += 3; // Add gap above subtotal row
        checkNewPage(rowHeight + 5);
        const subtotalY = yPosition;
        pdf.setFont(undefined, 'bold');
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.3);
        pdf.rect(margin, subtotalY, contentWidth, rowHeight, 'S');
        pdf.setTextColor(0, 0, 0);
        pdf.text('Subtotal:', margin + cellPadding, subtotalY + 5);
        pdf.text(`$${quoteData.calculations.sutmTotal.toFixed(2)}`, margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6] + colWidths[7] - cellPadding, subtotalY + 5, { align: 'right' });
        yPosition += rowHeight + 5;
      }

      // Special Services - Simple list
      const activeServices = (quoteData.specialServices || []).filter(s => s && s.checked);
      const specialServicesMonthlyTotalCalc = getSpecialServicesTotal();
      const initialCleanTotalCalc = getInitialCleanTotal();
      
      if (activeServices.length > 0 || initialCleanTotalCalc > 0) {
        addSectionHeader('Special Services');

        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        // Initial Clean (one-time)
        if (initialCleanTotalCalc > 0) {
          checkNewPage(7);
          pdf.text(`Initial Clean: $${initialCleanTotalCalc.toFixed(2)} (one-time)`, margin, yPosition);
          yPosition += 6;
        }
        
        // Monthly services
        activeServices.forEach((service) => {
          if (service.billingType === 'monthly') {
            checkNewPage(7);
            pdf.text(`${service.name}: $${(service.price || 0).toFixed(2)}/mo`, margin, yPosition);
            yPosition += 6;
          } else if (service.billingType === 'one-time') {
            checkNewPage(7);
            pdf.text(`${service.name}: $${(service.price || 0).toFixed(2)} (one-time)`, margin, yPosition);
            yPosition += 6;
          }
        });

        if (specialServicesMonthlyTotalCalc > 0) {
          checkNewPage(7);
          pdf.setFont(undefined, 'bold');
          pdf.text('Monthly Services Subtotal:', margin, yPosition);
          pdf.text(`$${specialServicesMonthlyTotalCalc.toFixed(2)}`, margin + contentWidth - 5, yPosition, { align: 'right' });
          yPosition += 8;
        }
      }

      // Site Documentation
      if (quoteData.siteNotes || (quoteData.sitePhotos && quoteData.sitePhotos.length > 0)) {
        addSectionHeader('Site Documentation');

        // Site Notes
        if (quoteData.siteNotes) {
          pdf.setFontSize(10);
          pdf.setFont(undefined, 'normal');
          pdf.setTextColor(0, 0, 0);
          pdf.text('Site Notes:', margin, yPosition);
          yPosition += 6;
          
          pdf.setFontSize(9);
          const notesLines = pdf.splitTextToSize(quoteData.siteNotes, contentWidth);
          notesLines.forEach((line: string) => {
            checkNewPage(5);
            pdf.text(line, margin, yPosition);
            yPosition += 5;
          });
          yPosition += 8;
        }

        // Site Photos in 2-column grid
        if (quoteData.sitePhotos && quoteData.sitePhotos.length > 0) {
          pdf.setFontSize(10);
          pdf.setFont(undefined, 'normal');
          pdf.setTextColor(0, 0, 0);
          pdf.text(`Photos:`, margin, yPosition);
          yPosition += 8;

          const photoWidth = (contentWidth - 5) / 2;
          const photoHeight = 50;
          let currentCol = 0;
          let photoStartY = yPosition;

          for (let i = 0; i < quoteData.sitePhotos.length; i++) {
            const photo = quoteData.sitePhotos[i];
            
            if (currentCol === 0) {
              checkNewPage(photoHeight + 20);
              photoStartY = yPosition;
            }

            const photoX = currentCol === 0 ? margin : margin + photoWidth + 5;
            
            try {
              const img = new Image();
              img.src = photo.data;
              
              await new Promise((resolve) => {
                img.onload = () => {
                  const imgWidth = img.width;
                  const imgHeight = img.height;
                  let width = photoWidth;
                  let height = (imgHeight * photoWidth) / imgWidth;
                  
                  if (height > photoHeight) {
                    width = (imgWidth * photoHeight) / imgHeight;
                    height = photoHeight;
                  }

                  const xOffset = (photoWidth - width) / 2;
                  const yOffset = (photoHeight - height) / 2;

                  // Simple border
                  pdf.setDrawColor(220, 220, 220);
                  pdf.setLineWidth(0.3);
                  pdf.rect(photoX, photoStartY, photoWidth, photoHeight, 'S');
                  
                  pdf.addImage(photo.data, 'JPEG', photoX + xOffset, photoStartY + yOffset, width, height);
                  
                  // Caption
                  pdf.setFontSize(7);
                  pdf.setTextColor(100, 100, 100);
                  const captionY = photoStartY + photoHeight + 4;
                  const captionText = photo.name.length > 40 ? photo.name.substring(0, 37) + '...' : photo.name;
                  pdf.text(captionText, photoX + photoWidth / 2, captionY, { align: 'center' });
                  
                  resolve(null);
                };
                img.onerror = () => {
                  pdf.setFontSize(8);
                  pdf.setTextColor(100, 100, 100);
                  pdf.text(`Photo: ${photo.name} (unable to load)`, photoX, photoStartY);
                  resolve(null);
                };
              });
            } catch (error) {
              pdf.setFontSize(8);
              pdf.setTextColor(100, 100, 100);
              pdf.text(`Photo: ${photo.name} (error loading)`, photoX, photoStartY);
            }

            currentCol++;
            if (currentCol >= 2) {
              currentCol = 0;
              yPosition = photoStartY + photoHeight + 12;
            }
          }

          if (currentCol > 0) {
            yPosition = photoStartY + photoHeight + 12;
          }
          yPosition += 8;
        }
      }

      // Pricing Summary - Clean simple format
      addSectionHeader('Pricing Summary');
      yPosition += 5;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(0, 0, 0);

      // Simple pricing rows
      checkNewPage(8);
      pdf.text('Standard Areas', margin, yPosition);
      pdf.text(`$${quoteData.calculations.standardTotal.toFixed(2)}`, margin + contentWidth - 5, yPosition, { align: 'right' });
      yPosition += 7;

      checkNewPage(8);
      pdf.text('SUTM Bathrooms', margin, yPosition);
      pdf.text(`$${quoteData.calculations.sutmTotal.toFixed(2)}`, margin + contentWidth - 5, yPosition, { align: 'right' });
      yPosition += 7;

      const specialServicesMonthlyTotalPdf = getSpecialServicesTotal();
      const initialCleanTotalPdf = getInitialCleanTotal();
      
      if (specialServicesMonthlyTotalPdf > 0) {
        checkNewPage(8);
        pdf.text('Special Services (Monthly)', margin, yPosition);
        pdf.text(`$${specialServicesMonthlyTotalPdf.toFixed(2)}`, margin + contentWidth - 5, yPosition, { align: 'right' });
        yPosition += 7;
      }
      
      if (initialCleanTotalPdf > 0) {
        checkNewPage(8);
        pdf.text('Initial Clean (One-Time)', margin, yPosition);
        pdf.text(`$${initialCleanTotalPdf.toFixed(2)}`, margin + contentWidth - 5, yPosition, { align: 'right' });
        yPosition += 7;
      }

      // Divider line
      checkNewPage(10);
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, margin + contentWidth, yPosition);
      yPosition += 5;

      // Subtotal
      pdf.setFont(undefined, 'bold');
      pdf.text('Subtotal', margin, yPosition);
      pdf.text(`$${quoteData.calculations.subtotal.toFixed(2)}`, margin + contentWidth - 5, yPosition, { align: 'right' });
      yPosition += 7;

      // Minimum Applied (if applicable)
      if (quoteData.calculations.minimumApplied) {
        checkNewPage(8);
        pdf.setFont(undefined, 'normal');
        pdf.text('Minimum Applied', margin, yPosition);
        pdf.text(`+$${(quoteData.calculations.minimumRequired - quoteData.calculations.subtotal).toFixed(2)}`, margin + contentWidth - 5, yPosition, { align: 'right' });
        yPosition += 7;
      }

      // Surcharge (if applicable)
      if (quoteData.calculations.surcharge > 0) {
        checkNewPage(8);
        pdf.setFont(undefined, 'normal');
        pdf.text('Surcharge (20%)', margin, yPosition);
        pdf.text(`+$${quoteData.calculations.surcharge.toFixed(2)}`, margin + contentWidth - 5, yPosition, { align: 'right' });
        yPosition += 7;
      }

      // Monthly Total - Simple bold display
      checkNewPage(12);
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, margin + contentWidth, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Monthly Total', margin, yPosition);
      pdf.setFontSize(14);
      pdf.text(`$${quoteData.calculations.finalTotalWithSurcharge.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, margin + contentWidth - 5, yPosition, { align: 'right' });
      yPosition += 5;

      // Generate filename
      const customerName = quoteData.customerInfo.businessName || `${quoteData.customerInfo.firstName}_${quoteData.customerInfo.lastName}`;
      const sanitizedName = customerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `IronQuote-${sanitizedName}-${dateStr}.pdf`;

      // Save PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleEmailSummary = () => {
    const customerName = quoteData.customerInfo.businessName || `${quoteData.customerInfo.firstName} ${quoteData.customerInfo.lastName}`;
    const subject = encodeURIComponent(`IronQuote - ${customerName} - Operations Summary`);
    
    const bodyLines = [
      `IronQuote Operations Summary`,
      ``,
      `Quote ID: ${quoteData.quoteId}`,
      `Date Created: ${quoteData.dateCreated}`,
      ``,
      `CUSTOMER INFORMATION:`,
      `Contact: ${quoteData.customerInfo.firstName} ${quoteData.customerInfo.lastName}`,
      `Business: ${quoteData.customerInfo.businessName}`,
      `Address: ${quoteData.customerInfo.address}`,
      `${quoteData.customerInfo.city}, ${quoteData.customerInfo.state} ${quoteData.customerInfo.zip}`,
      `Email: ${quoteData.customerInfo.email}`,
      `Phone: ${quoteData.customerInfo.phone}`,
      ``,
      `PROPERTY OVERVIEW:`,
      `Total Sq Ft: ${quoteData.calculations.totalSqFt.toLocaleString()}`,
      `Frequency: ${quoteData.frequencyRate.frequency}x/week`,
      `Labor Rate: $${quoteData.frequencyRate.hourlyRate}/hr`,
      `Hours per Clean: ${quoteData.calculations.totalHours.toFixed(2)}`,
      quoteData.buildingType ? `Building Type: ${quoteData.buildingType}` : '',
      ``,
      `PRICING SUMMARY:`,
      `Standard Areas: $${quoteData.calculations.standardTotal.toFixed(2)}`,
      `SUTM Bathrooms: $${quoteData.calculations.sutmTotal.toFixed(2)}`,
      getSpecialServicesTotal() > 0 ? `Special Services (Monthly): $${getSpecialServicesTotal().toFixed(2)}` : '',
      getInitialCleanTotal() > 0 ? `Initial Clean (One-Time): $${getInitialCleanTotal().toFixed(2)}` : '',
      `Subtotal: $${quoteData.calculations.subtotal.toFixed(2)}`,
      quoteData.calculations.minimumApplied ? `Minimum Applied: +$${(quoteData.calculations.minimumRequired - quoteData.calculations.subtotal).toFixed(2)}` : '',
      quoteData.calculations.surcharge > 0 ? `Surcharge (20%): +$${quoteData.calculations.surcharge.toFixed(2)}` : '',
      ``,
      `MONTHLY TOTAL: $${quoteData.calculations.finalTotalWithSurcharge.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      ``,
      `Please see attached PDF for complete details including room-by-room breakdown and site documentation.`
    ].filter(line => line !== '');

    const body = encodeURIComponent(bodyLines.join('\n'));
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    
    window.location.href = mailtoLink;
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
              <div className="text-2xl font-bold text-white">{quoteData.frequencyRate.frequency}x/week</div>
            </div>
            <div className="bg-[#111317] border border-[#2C3038]/40 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wide text-[#7A7F87] mb-1">Labor Rate</div>
              <div className="text-2xl font-bold text-white">${quoteData.frequencyRate.hourlyRate}/hr</div>
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
        {((quoteData.specialServices && quoteData.specialServices.some(s => s && s.checked)) || getInitialCleanTotal() > 0) && (
          <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0A5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Special Services
            </h2>
            <div className="space-y-3">
              {/* Initial Clean */}
              {getInitialCleanTotal() > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-[#2C3038]/20">
                  <div className="text-white font-medium">Initial Clean (Recommended)</div>
                  <div className="text-white font-semibold">${getInitialCleanTotal().toFixed(2)} (one-time)</div>
                </div>
              )}
              {/* Custom Services */}
              {(quoteData.specialServices || []).filter(s => s && s.checked).map((service) => (
                <div key={service.id} className="flex items-center justify-between py-2 border-b border-[#2C3038]/20">
                  <div className="text-white font-medium">{service.name}</div>
                  <div className="text-white font-semibold">
                    ${(service.price || 0).toFixed(2)}/{service.billingType === 'one-time' ? 'one-time' : 'mo'}
                  </div>
                </div>
              ))}
              {getSpecialServicesTotal() > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-[#2C3038]/40">
                  <div className="text-sm font-semibold text-[#7A7F87]">Monthly Services Subtotal:</div>
                  <div className="text-lg font-bold text-[#0A5CFF]">${getSpecialServicesTotal().toFixed(2)}</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Site Documentation */}
        {(quoteData.siteNotes || (quoteData.sitePhotos && quoteData.sitePhotos.length > 0)) && (
          <section className="bg-[#1C1F26] border border-[#2C3038]/40 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0A5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Site Documentation
            </h2>
            <div className="space-y-6">
              {/* Site Notes */}
              {quoteData.siteNotes && (
                <div>
                  <h3 className="text-sm font-semibold text-[#E6E8EB]/80 mb-2">Site-Specific Notes</h3>
                  <div className="bg-[#111317] border border-[#2C3038]/40 rounded-md p-4 text-white whitespace-pre-wrap">
                    {quoteData.siteNotes}
                  </div>
                </div>
              )}

              {/* Site Photos */}
              {quoteData.sitePhotos && quoteData.sitePhotos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#E6E8EB]/80 mb-3">
                    Site Photos ({quoteData.sitePhotos.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quoteData.sitePhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative group cursor-pointer bg-[#111317] border border-[#2C3038]/40 rounded-lg overflow-hidden hover:border-[#0A5CFF] transition-colors"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <img
                          src={photo.data}
                          alt={photo.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-3">
                          <p className="text-sm text-white font-medium truncate">{photo.name}</p>
                          <p className="text-xs text-[#7A7F87] mt-1">
                            {new Date(photo.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            {getSpecialServicesTotal() > 0 && (
              <div className="flex justify-between text-lg">
                <span className="text-[#E6E8EB]">Special Services (Monthly)</span>
                <span className="text-white font-semibold">${getSpecialServicesTotal().toFixed(2)}</span>
              </div>
            )}
            {getInitialCleanTotal() > 0 && (
              <div className="flex justify-between text-lg">
                <span className="text-[#E6E8EB]">Initial Clean (One-Time)</span>
                <span className="text-white font-semibold">${getInitialCleanTotal().toFixed(2)}</span>
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
              <div className="text-xs text-[#7A7F87]">{quoteData.frequencyRate.frequency}x per week • ${quoteData.frequencyRate.hourlyRate}/hr</div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden mb-4">
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

        {/* PDF Export and Email Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#111317] border border-[#2C3038]/40 text-white rounded-lg text-base font-semibold hover:border-[#0A5CFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPDF ? (
              <>
                <svg className="animate-spin h-5 w-5 text-[#0A5CFF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating PDF...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>

          <button
            onClick={handleEmailSummary}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#111317] border border-[#2C3038]/40 text-white rounded-lg text-base font-semibold hover:border-[#0A5CFF] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Summary
          </button>
        </div>
      </main>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 bg-[#1C1F26] border border-[#2C3038]/40 rounded-md text-white hover:bg-[#2C3038] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="max-w-5xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto.data}
              alt={selectedPhoto.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-center">
              <p className="text-white font-medium">{selectedPhoto.name}</p>
              <p className="text-sm text-[#7A7F87] mt-1">
                {new Date(selectedPhoto.timestamp).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#2C3038]/40 py-6 mt-12 print:hidden">
        <div className="max-w-[1400px] mx-auto px-4 text-center text-[#7A7F87] text-sm">
          IronQuote © {new Date().getFullYear()} — Price with certainty.
        </div>
      </footer>
    </div>
  );
}