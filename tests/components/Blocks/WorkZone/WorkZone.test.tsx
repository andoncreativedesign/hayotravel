import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { WorkZone } from '@/components/Blocks/WorkZone/WorkZone';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/components/Sidebar/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('WorkZone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render sidebar when not on checkout page', () => {
    mockUsePathname.mockReturnValue('/chat/123');

    render(
      <WorkZone>
        <div data-testid="content">Main content</div>
      </WorkZone>
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should hide sidebar when on checkout page', () => {
    mockUsePathname.mockReturnValue('/chat/123/checkout/456');

    render(
      <WorkZone>
        <div data-testid="content">Checkout content</div>
      </WorkZone>
    );

    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should hide sidebar for any path containing "checkout"', () => {
    mockUsePathname.mockReturnValue('/some/path/checkout/step1');

    render(
      <WorkZone>
        <div data-testid="content">Checkout step content</div>
      </WorkZone>
    );

    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should handle null pathname gracefully', () => {
    mockUsePathname.mockReturnValue(null);

    render(
      <WorkZone>
        <div data-testid="content">Content</div>
      </WorkZone>
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should show sidebar for paths similar to checkout but not checkout', () => {
    mockUsePathname.mockReturnValue('/chat/123/check-something');

    render(
      <WorkZone>
        <div data-testid="content">Similar path content</div>
      </WorkZone>
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});