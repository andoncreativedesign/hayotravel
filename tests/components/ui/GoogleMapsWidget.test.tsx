import { render, screen, fireEvent } from '@testing-library/react';
import GoogleMapsWidget from '@/components/ui/GoogleMapsWidget/GoogleMapsWidget';
import { LocationData } from '@/utils/helpers/googleMapsHelper';

const mockLocation: LocationData = {
  name: 'Test Hotel',
  address: '123 Test Street',
  city: 'Test City',
  country: 'Test Country',
};

describe('GoogleMapsWidget', () => {
  it('should render when visible is true', () => {
    render(
      <GoogleMapsWidget 
        location={mockLocation} 
        isVisible={true} 
      />
    );

    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByTitle('Map showing Test Hotel')).toBeInTheDocument();
  });

  it('should not render when visible is false', () => {
    render(
      <GoogleMapsWidget 
        location={mockLocation} 
        isVisible={false} 
      />
    );

    expect(screen.queryByText('Location')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    
    render(
      <GoogleMapsWidget 
        location={mockLocation} 
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: 'Close map' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show back button when showBackButton is true', () => {
    const mockOnBack = jest.fn();
    
    render(
      <GoogleMapsWidget 
        location={mockLocation} 
        isVisible={true}
        showBackButton={true}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByRole('button', { name: 'Back to hotel details' });
    expect(backButton).toBeInTheDocument();
    
    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should not show back button when showBackButton is false', () => {
    render(
      <GoogleMapsWidget 
        location={mockLocation} 
        isVisible={true}
        showBackButton={false}
      />
    );

    const backButton = screen.queryByRole('button', { name: 'Back to hotel details' });
    expect(backButton).not.toBeInTheDocument();
  });

  it('should generate correct iframe src for address-based location', () => {
    render(
      <GoogleMapsWidget 
        location={mockLocation} 
        isVisible={true} 
      />
    );

    const iframe = screen.getByTitle('Map showing Test Hotel') as HTMLIFrameElement;
    expect(iframe.src).toContain('google.com/maps');
    expect(iframe.src).toContain('Test%20Hotel');
  });

  it('should generate correct iframe src for coordinate-based location', () => {
    const locationWithCoords: LocationData = {
      name: 'Test Hotel',
      coordinates: {
        latitude: 40.7589,
        longitude: -73.9851,
      },
    };

    render(
      <GoogleMapsWidget 
        location={locationWithCoords} 
        isVisible={true} 
      />
    );

    const iframe = screen.getByTitle('Map showing Test Hotel') as HTMLIFrameElement;
    expect(iframe.src).toContain('40.7589%2C-73.9851');
  });

  it('should apply fullScreen styles when fullScreen prop is true', () => {
    render(
      <GoogleMapsWidget 
        location={mockLocation} 
        isVisible={true}
        fullScreen={true}
      />
    );

    const container = screen.getByTitle('Map showing Test Hotel').closest('[class*="mapContainer"]');
    expect(container).toHaveClass('fullScreen');
  });

  it('should not apply fullScreen styles when fullScreen prop is false', () => {
    render(
      <GoogleMapsWidget 
        location={mockLocation} 
        isVisible={true}
        fullScreen={false}
      />
    );

    const container = screen.getByTitle('Map showing Test Hotel').closest('[class*="mapContainer"]');
    expect(container).not.toHaveClass('fullScreen');
  });
});
