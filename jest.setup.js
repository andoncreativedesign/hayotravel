require('@testing-library/jest-dom')

// Set up environment variables for tests
process.env.NEXT_PUBLIC_API_URL = 'https://test-api.example.com/'

// Supabase configuration for tests
// These are test values - replace with your actual Supabase credentials in .env.local
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test-project.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key-for-testing'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Zustand stores
jest.mock('@/store/chat/chats.store', () => ({
  useChatStore: jest.fn(() => ({
    chatList: [],
  })),
  currentChatSelector: jest.fn(() => ({
    travelers_count: 1,
  })),
}))

jest.mock('@/store/itinerary/itinerary.store', () => ({
  useItineraryStore: jest.fn(() => ({
    itinerary: [],
  })),
  ItineraryType: {
    Flight: 'flight',
    Hotel: 'hotel',
  },
}))

// Mock dayjs
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs')
  const mockDayjs = (date) => {
    if (date) {
      return originalDayjs(date)
    }
    return originalDayjs('2024-01-01') // Fixed date for testing
  }
  
  // Add all dayjs static methods including isDayjs
  mockDayjs.isDayjs = originalDayjs.isDayjs
  mockDayjs.unix = originalDayjs.unix
  mockDayjs.locale = originalDayjs.locale
  mockDayjs.extend = originalDayjs.extend
  
  return mockDayjs
})

// SCSS modules are handled by Jest config moduleNameMapper

// Mock Ant Design components completely to avoid dayjs issues
jest.mock('antd', () => {
  const React = require('react')
  
  return {
    Form: Object.assign(
      ({ children, className, layout, ...props }) => React.createElement('form', { 
        className: `ant-form ${layout ? `ant-form-${layout}` : ''} ${className || ''}`.trim(),
        ...props 
      }, children),
      {
        Item: ({ children, className, label, name, ...props }) => {
          const itemElement = React.createElement('div', { 
            className: `ant-form-item ${className || ''}`,
            ...props 
          }, 
            label && React.createElement('label', {}, label),
            children
          )
          return itemElement
        },
        useForm: () => [{ 
          getFieldValue: jest.fn(),
          setFieldsValue: jest.fn(),
          validateFields: jest.fn(),
          resetFields: jest.fn(),
        }],
      }
    ),
    Input: (props) => React.createElement('input', { 
      ...props, 
      className: `ant-input ${props.className || ''}` 
    }),
    Select: Object.assign(
      ({ children, className, ...props }) => React.createElement('select', { 
        ...props, 
        className: `ant-select ${className || ''}`,
        role: 'combobox'
      }, children),
      {
        Option: ({ children, ...props }) => React.createElement('option', props, children)
      }
    ),
    DatePicker: (props) => React.createElement('input', { 
      ...props, 
      type: 'date',
      className: `ant-picker ${props.className || ''}`,
      role: 'textbox'
    }),
    Button: ({ children, ...props }) => React.createElement('button', { 
      ...props,
      className: `ant-btn ${props.className || ''}`
    }, children),
    Typography: {
      Text: ({ children, className, ...props }) => React.createElement('span', { 
        className: className,
        ...props 
      }, children),
      Title: ({ children, level = 1, className, ...props }) => {
        const tagName = `h${level}`
        return React.createElement(tagName, { 
          className: className,
          role: 'heading',
          'aria-level': level,
          ...props 
        }, children)
      },
    },
    Card: ({ children, title, className, styles, ...props }) => React.createElement('div', { 
      className: `ant-card ${className || ''}`,
      ...props
    }, 
      title && React.createElement('div', { className: 'ant-card-head' }, 
        React.createElement('div', { className: 'ant-card-head-title' }, title)
      ),
      React.createElement('div', { 
        className: 'ant-card-body',
        style: styles?.body
      }, children)
    ),
    Steps: ({ items, className, ...props }) => React.createElement('div', { 
      className: `ant-steps ${className || ''}`,
      ...props
    }, items && items.map ? items.map((item, index) => React.createElement('div', { 
      key: item.title || index,
      className: 'ant-steps-item'
    }, 
      React.createElement('div', { className: 'ant-steps-item-title' }, item.title),
      item.description && React.createElement('div', { className: 'ant-steps-item-description' }, item.description)
    )) : null),
    Progress: (props) => React.createElement('div', { 
      ...props,
      className: `ant-progress ${props.className || ''}`
    }),
    Divider: (props) => React.createElement('hr', { 
      ...props,
      className: `ant-divider ${props.className || ''}`
    }),
    Row: ({ children, className, ...props }) => React.createElement('div', { 
      className: `ant-row ${className || ''}`,
      ...props
    }, children),
    Col: ({ children, className, ...props }) => React.createElement('div', { 
      className: `ant-col ${className || ''}`,
      ...props
    }, children),
    Flex: ({ children, className, ...props }) => React.createElement('div', { 
      className: `ant-flex ${className || ''}`,
      ...props
    }, children),
  }
})

// Global test setup
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})