import jsPDF from 'jspdf';
import { ItineraryHotel } from '@/store/itinerary/itinerary.store';
import { TravelWalletTrip } from '@/utils/types/travel-wallet';
import { secureLog } from '@/utils/secure-logger';

export interface HotelConfirmationPDFData {
  hotel: ItineraryHotel;
  trip: TravelWalletTrip;
}

export class PDFGenerationService {
  private static readonly COLORS = {
    primary: '#111820',
    secondary: '#485a6e',
    accent: '#FFD233',
    background: '#ffffff',
    border: '#e5e7eb',
  };

  private static readonly FONTS = {
    regular: 'helvetica',
    bold: 'helvetica',
  };

  static async generateHotelConfirmationPDF(data: HotelConfirmationPDFData): Promise<Blob> {
    try {
      secureLog.log('Generating hotel confirmation PDF', { hotelId: data.hotel.id });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set up document
      pdf.setFontSize(12);
      pdf.setFont(this.FONTS.regular);

      let yPosition = 20;

      // Header
      yPosition = this.addHeader(pdf, data.trip, yPosition);
      
      // Hotel information
      yPosition = this.addHotelInfo(pdf, data.hotel, yPosition);
      
      // Booking details
      yPosition = this.addBookingDetails(pdf, data.hotel, data.trip, yPosition);
      
      // Contact information
      this.addContactInfo(pdf, data.hotel, yPosition);
      
      // Footer
      this.addFooter(pdf);

      return pdf.output('blob');
    } catch (error) {
      secureLog.error('Failed to generate hotel confirmation PDF', error);
      throw new Error('Failed to generate PDF confirmation');
    }
  }

  private static addHeader(pdf: jsPDF, trip: TravelWalletTrip, yPosition: number): number {
    // Logo/Title - Dynamic based on confirmation status
    const isConfirmed = trip.confirmation?.bookingConfirmed;
    const title = isConfirmed ? 'Hotel Booking Confirmation' : 'Hotel Booking Details';
    
    pdf.setFontSize(20);
    pdf.setFont(this.FONTS.bold, 'bold');
    pdf.setTextColor(this.COLORS.primary);
    pdf.text(title, 20, yPosition);
    yPosition += 15;

    // Trip title and dates
    pdf.setFontSize(14);
    pdf.setFont(this.FONTS.regular, 'normal');
    pdf.text(trip.title, 20, yPosition);
    yPosition += 8;

    pdf.setFontSize(12);
    pdf.setTextColor(this.COLORS.secondary);
    const dateRange = this.formatDateRange(trip.startDate, trip.endDate);
    pdf.text(dateRange, 20, yPosition);
    yPosition += 8;

    // Add booking status indicator
    pdf.setFontSize(10);
    if (isConfirmed) {
      pdf.setTextColor('#10b981'); // Green color for confirmed
      pdf.text('✓ Booking Confirmed', 20, yPosition);
    } else {
      pdf.setTextColor('#f59e0b'); // Amber color for pending
      pdf.text('⚠ Booking Pending Confirmation', 20, yPosition);
    }
    yPosition += 10;

    // Divider
    pdf.setDrawColor(this.COLORS.border);
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 10;

    return yPosition;
  }

  private static addHotelInfo(pdf: jsPDF, hotel: ItineraryHotel, yPosition: number): number {

    const bookingReference = hotel.booking_data?.data?.reference;
    // Hotel name and rating
    pdf.setFontSize(16);
    pdf.setFont(this.FONTS.bold, 'bold');
    pdf.setTextColor(this.COLORS.primary);
    pdf.text(hotel.data.name, 20, yPosition);
    yPosition += 8;

    // Hotel rating (text only, no stars)
    pdf.setFontSize(12);
    pdf.setTextColor(this.COLORS.secondary);
    pdf.text(`${hotel.data.rating} star hotel`, 20, yPosition);
    yPosition += 10;

    // Address
    const address = `${hotel.data.location.city}, ${hotel.data.location.address}`;
    pdf.text(address, 20, yPosition);
    yPosition += 15;

    // Accommodation reference
    pdf.setFont(this.FONTS.bold, 'bold');
    pdf.text('Accommodation Reference:', 20, yPosition);
    pdf.setFont(this.FONTS.regular, 'normal');
    pdf.text(bookingReference || hotel.duffel_quote_id || 'N/A', 80, yPosition);
    yPosition += 15;

    return yPosition;
  }

  private static addBookingDetails(pdf: jsPDF, hotel: ItineraryHotel, trip: TravelWalletTrip, yPosition: number): number {
    // Section title
    pdf.setFontSize(14);
    pdf.setFont(this.FONTS.bold, 'bold');
    pdf.setTextColor(this.COLORS.primary);
    pdf.text('Booking Details', 20, yPosition);
    yPosition += 10;

    // Check-in / Check-out
    pdf.setFontSize(12);
    pdf.setFont(this.FONTS.bold, 'bold');
    pdf.text('Check-in:', 20, yPosition);
    pdf.setFont(this.FONTS.regular, 'normal');
    const checkInDate = this.formatDate(hotel.data.checkIn);
    const checkInTime = this.formatTime(hotel.data.checkIn, '3:00 PM');
    pdf.text(`${checkInDate} ${checkInTime}`, 50, yPosition);
    yPosition += 8;

    pdf.setFont(this.FONTS.bold, 'bold');
    pdf.text('Check-out:', 20, yPosition);
    pdf.setFont(this.FONTS.regular, 'normal');
    const checkOutDate = this.formatDate(hotel.data.checkOut);
    const checkOutTime = this.formatTime(hotel.data.checkOut, '11:00 AM');
    pdf.text(`${checkOutDate} ${checkOutTime}`, 50, yPosition);
    yPosition += 10;

    // Room information
    pdf.setFont(this.FONTS.bold, 'bold');
    pdf.text('Room:', 20, yPosition);
    pdf.setFont(this.FONTS.regular, 'normal');
    pdf.text(hotel.data.room.name, 50, yPosition);
    yPosition += 8;

    pdf.setFont(this.FONTS.bold, 'bold');
    pdf.text('Bed:', 20, yPosition);
    pdf.setFont(this.FONTS.regular, 'normal');
    pdf.text(hotel.data.room.bedInfo, 50, yPosition);
    yPosition += 10;

    // Booking info
    const nights = hotel.data.nights;
    pdf.setFont(this.FONTS.bold, 'bold');
    pdf.text('Booking:', 20, yPosition);
    pdf.setFont(this.FONTS.regular, 'normal');
    pdf.text(`1 room · ${nights} night${nights !== 1 ? 's' : ''}`, 50, yPosition);
    yPosition += 8;

    // Issuing date
    if (hotel.data.paid_at) {
      pdf.setFont(this.FONTS.bold, 'bold');
      pdf.text('Issuing date:', 20, yPosition);
      pdf.setFont(this.FONTS.regular, 'normal');
      pdf.text(this.formatIssuingDate(hotel.data.paid_at), 50, yPosition);
      yPosition += 8;
    }

    // Guest information
    const guestInfo = this.getGuestInfo(trip);
    if (guestInfo.names.length > 0) {
      pdf.setFont(this.FONTS.bold, 'bold');
      pdf.text('Guests:', 20, yPosition);
      yPosition += 8;

      guestInfo.names.forEach((name) => {
        pdf.setFont(this.FONTS.regular, 'normal');
        pdf.text(`• ${name}`, 25, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }

    // Contact information
    const contact = this.getPrimaryContact(trip);
    if (contact.email !== 'N/A') {
      pdf.setFont(this.FONTS.bold, 'bold');
      pdf.text('Email:', 20, yPosition);
      pdf.setFont(this.FONTS.regular, 'normal');
      pdf.text(contact.email, 50, yPosition);
      yPosition += 8;
    }

    if (contact.phone !== 'N/A') {
      pdf.setFont(this.FONTS.bold, 'bold');
      pdf.text('Phone:', 20, yPosition);
      pdf.setFont(this.FONTS.regular, 'normal');
      pdf.text(contact.phone, 50, yPosition);
      yPosition += 8;
    }

    yPosition += 10;
    return yPosition;
  }

  private static addContactInfo(pdf: jsPDF, hotel: ItineraryHotel, yPosition: number): number {
    // Section title
    pdf.setFontSize(14);
    pdf.setFont(this.FONTS.bold, 'bold');
    pdf.setTextColor(this.COLORS.primary);
    pdf.text('Hotel Contacts', 20, yPosition);
    yPosition += 10;

    // Address
    pdf.setFontSize(12);
    pdf.setFont(this.FONTS.regular, 'normal');
    pdf.setTextColor(this.COLORS.secondary);
    const address = `${hotel.data.location.city}, ${hotel.data.location.address}`;
    pdf.text(address, 20, yPosition);
    yPosition += 15;

    return yPosition;
  }


  private static addFooter(pdf: jsPDF): void {
    const pageHeight = pdf.internal.pageSize.height;
    const footerY = pageHeight - 20;

    pdf.setFontSize(10);
    pdf.setFont(this.FONTS.regular, 'normal');
    pdf.setTextColor(this.COLORS.secondary);
    
    const footerText = 'Generated by Hayo Travel Assistant';
    const textWidth = pdf.getTextWidth(footerText);
    const pageWidth = pdf.internal.pageSize.width;
    const centerX = (pageWidth - textWidth) / 2;
    
    pdf.text(footerText, centerX, footerY);
    
    // Add generation date
    const generationDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const dateText = `Generated on ${generationDate}`;
    const dateWidth = pdf.getTextWidth(dateText);
    const dateCenterX = (pageWidth - dateWidth) / 2;
    
    pdf.text(dateText, dateCenterX, footerY + 5);
  }

  private static formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    };
    return date.toLocaleDateString('en-US', options);
  }

  private static formatTime(dateString: string, fallbackTime: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return fallbackTime;
      }

      const hasTimeInfo = dateString.includes('T') || 
                         dateString.includes(' ') || 
                         dateString.match(/\d{2}:\d{2}/);

      if (!hasTimeInfo) {
        return fallbackTime;
      }

      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return fallbackTime;
    }
  }

  private static formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.getDate()} ${start.toLocaleDateString('en-US', {
      month: 'short',
    })} - ${end.getDate()} ${end.toLocaleDateString('en-US', {
      month: 'short',
    })}, ${end.getFullYear()}`;
  }

  private static formatIssuingDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

  private static getPrimaryContact(trip: TravelWalletTrip) {
    const primaryPassenger = trip.passengerDetails?.[0];
    return {
      email: primaryPassenger?.contact?.email || 'N/A',
      phone: primaryPassenger?.contact?.countryCode && primaryPassenger?.contact?.phone
        ? `${primaryPassenger.contact.countryCode}${primaryPassenger.contact.phone}`
        : 'N/A',
    };
  }

  private static getGuestInfo(trip: TravelWalletTrip) {
    if (!trip.passengerDetails) return { summary: 'N/A', names: [] };

    const passengers = trip.passengerDetails;
    const names = passengers.map((p) => {
      const first = p.passengerInfo?.firstName || '';
      const last = p.passengerInfo?.lastName || '';
      return `${first} ${last}`.trim() || 'N/A';
    });

    return { names };
  }
}
