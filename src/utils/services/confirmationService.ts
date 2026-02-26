import { ItineraryHotel } from '@/store/itinerary/itinerary.store';
import { TravelWalletTrip } from '@/utils/types/travel-wallet';
import { secureLog } from '@/utils/secure-logger';

export interface ConfirmationDownloadOptions {
  hotel: ItineraryHotel;
  trip: TravelWalletTrip;
  type: 'hotel';
}

export class ConfirmationService {
  /**
   * Downloads a PDF confirmation for hotel booking
   */
  static async downloadHotelConfirmation(options: ConfirmationDownloadOptions): Promise<void> {
    try {
      secureLog.log('Initiating hotel confirmation download', { 
        tripId: options.trip.id,
        hotelId: options.hotel.id 
      });

      const response = await fetch('/api/travel-wallet/confirmation-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotel: options.hotel,
          trip: options.trip,
          type: options.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate confirmation PDF');
      }

      // Get the PDF blob
      const pdfBlob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename based on booking status
      const hotelName = options.hotel.data.name.replace(/[^a-z0-9]/gi, '_');
      const tripDate = new Date(options.trip.startDate).toISOString().split('T')[0];
      const isConfirmed = options.trip.confirmation?.bookingConfirmed;
      const filePrefix = isConfirmed ? 'hotel-confirmation' : 'hotel-details';
      link.download = `${filePrefix}-${hotelName}-${tripDate}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      secureLog.log('Hotel confirmation downloaded successfully', {
        tripId: options.trip.id,
        hotelId: options.hotel.id,
        filename: link.download,
      });

    } catch (error) {
      secureLog.error('Failed to download hotel confirmation', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to download confirmation PDF'
      );
    }
  }

  /**
   * Validates if confirmation can be generated for the given data
   */
  static validateConfirmationData(options: ConfirmationDownloadOptions): boolean {
    // Check required hotel data
    if (!options.hotel?.data?.name || !options.hotel?.data?.location) {
      return false;
    }

    // Check required trip data
    if (!options.trip?.id || !options.trip?.startDate || !options.trip?.endDate) {
      return false;
    }

    return true;
  }

  /**
   * Gets confirmation availability status
   */
  static getConfirmationStatus(options: ConfirmationDownloadOptions): {
    available: boolean;
    reason?: string;
  } {
    if (!this.validateConfirmationData(options)) {
      return {
        available: false,
        reason: 'Missing required booking data',
      };
    }

    // Allow PDF generation regardless of confirmation status
    // This creates a booking summary/details PDF even for unconfirmed bookings
    return { available: true };
  }
}
