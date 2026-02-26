import Header from "@/components/Blocks/Checkout/components/Header/Header";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn()
}));

// Mock the icons
jest.mock("@/components/icons", () => ({
  ArrowLeftIcon: () => <div data-testid="arrow-icon" />,
  LogoIcon: () => <div data-testid="logo-icon" />
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn()
};

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("should render with default title when no title provided", () => {
    render(<Header chatId="test-chat-id" />);

    expect(screen.getByText("Checkout")).toBeTruthy();
  });

  it("should render with custom title when title is provided", () => {
    const customTitle = "Business Trip to London Checkout";
    
    render(<Header chatId="test-chat-id" title={customTitle} />);

    expect(screen.getByText(customTitle)).toBeTruthy();
  });

  it("should render default title when empty string is provided", () => {
    render(<Header chatId="test-chat-id" title="" />);

    expect(screen.getByText("Checkout")).toBeTruthy();
  });

  it("should render back to basket button", () => {
    render(<Header chatId="test-chat-id" />);

    expect(screen.getByText("Back to My Basket")).toBeTruthy();
  });

  it("should render logo icon", () => {
    render(<Header chatId="test-chat-id" />);

    expect(screen.getByTestId("logo-icon")).toBeTruthy();
  });

  it("should navigate to chat page when back button is clicked", () => {
    const chatId = "test-chat-123";
    
    render(<Header chatId={chatId} />);

    const backButton = screen.getByText("Back to My Basket");
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith(`/chat/${chatId}`);
  });

  it("should render title as h2 heading", () => {
    render(<Header chatId="test-chat-id" />);

    const titleElement = screen.getByRole("heading", { level: 4 });
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toBe("Checkout");
  });

  it("should handle long chat IDs", () => {
    const longChatId = "very-long-chat-id-with-many-characters-12345678901234567890";
    
    render(<Header chatId={longChatId} />);

    const backButton = screen.getByText("Back to My Basket");
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith(`/chat/${longChatId}`);
  });

  it("should handle empty chat ID", () => {
    render(<Header chatId="" />);

    const backButton = screen.getByText("Back to My Basket");
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith("/chat/");
  });

  it("should handle special characters in chat ID", () => {
    const specialChatId = "chat-id_with@special#characters";
    
    render(<Header chatId={specialChatId} />);

    const backButton = screen.getByText("Back to My Basket");
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith(`/chat/${specialChatId}`);
  });

  it("should have proper heading hierarchy", () => {
    render(<Header chatId="test-chat-id" />);

    const heading = screen.getByRole("heading", { level: 4 });
    expect(heading).toBeTruthy();
    expect(heading.tagName).toBe("H4");
  });

  it("should handle click events properly", () => {
    const chatId = "click-test-id";
    
    render(<Header chatId={chatId} />);

    const backButton = screen.getByText("Back to My Basket");
    
    // Multiple clicks should work
    fireEvent.click(backButton);
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledTimes(2);
    expect(mockPush).toHaveBeenCalledWith(`/chat/${chatId}`);
  });

  it("should render with consistent layout", () => {
    const { container } = render(<Header chatId="test-chat-id" />);

    const headerContent = container.querySelector(".headerContent");
    expect(headerContent).toBeTruthy();
    
    // Should contain logo, title, and button
    expect(headerContent?.children.length).toBe(3);
  });

  it("should have proper text content", () => {
    render(<Header chatId="test-chat-id" />);

    // Check exact text content
    expect(screen.getByText("Back to My Basket")).toBeTruthy();
    expect(screen.queryByText("Back to Basket")).toBeFalsy(); // Should be exact match
  });
});