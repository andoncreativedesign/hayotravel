/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { Button, Card, Space, Typography, Collapse, Switch, InputNumber } from 'antd';
import { BugOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import styles from './CheckoutDevTool.module.scss';

const { Text } = Typography;

interface CheckoutDevToolProps {
  onFillForm: (data: any) => void;
  onClearForm: () => void;
  totalPassengers?: number;
}

// Passenger data templates
const passengerTemplates = {
  john: {
    passengerInfo: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      title: 'mr'
    },
    document: {
      passportNumber: 'A12345678',
      countryOfIssue: 'US',
      expiryDate: '2030-01-01',
      nationality: 'US'
    },
    contact: {
      email: 'john.doe@example.com',
      phone: '1234567890',
      countryCode: '+1'
    }
  },
  jane: {
    passengerInfo: {
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1985-12-20',
      gender: 'female',
      title: 'ms'
    },
    document: {
      passportNumber: 'B98765432',
      countryOfIssue: 'CA',
      expiryDate: '2029-06-15',
      nationality: 'CA'
    },
    contact: {
      email: 'jane.smith@example.com',
      phone: '9876543210',
      countryCode: '+1'
    }
  },
  carlos: {
    passengerInfo: {
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      dateOfBirth: '1988-03-10',
      gender: 'male',
      title: 'mr'
    },
    document: {
      passportNumber: 'C11111111',
      countryOfIssue: 'ES',
      expiryDate: '2031-01-01',
      nationality: 'ES'
    },
    contact: {
      email: 'carlos.rodriguez@example.com',
      phone: '555123456',
      countryCode: '+34'
    }
  },
  invalid: {
    passengerInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      title: ''
    },
    document: {
      passportNumber: '123', // Too short
      countryOfIssue: '',
      expiryDate: '2020-01-01', // Expired
      nationality: ''
    },
    contact: {
      email: 'not-an-email',
      phone: '',
      countryCode: ''
    }
  }
};

const testScenarios = {
  validComplete: {
    name: '✅ Valid Complete Data',
    data: (count: number) => ({
      passengers: Array(count).fill(null).map(() => ({ ...passengerTemplates.john }))
    })
  },
  allPassengersValid: {
    name: '👥 All Passengers Valid',
    data: (count: number) => ({
      passengers: Array(count).fill(null).map((_, index) => {
        const templates = [passengerTemplates.john, passengerTemplates.jane, passengerTemplates.carlos];
        const template = templates[index % templates.length];
        return {
          ...template,
          passengerInfo: {
            ...template.passengerInfo,
            firstName: `${template.passengerInfo.firstName}${index > 0 ? ` ${index + 1}` : ''}`,
          },
          contact: {
            ...template.contact,
            email: template.contact.email.replace('@', `${index > 0 ? index + 1 : ''}@`),
          }
        };
      })
    })
  },
  firstPassengerOnly: {
    name: '👤 First Passenger Only',
    data: (count: number) => ({
      passengers: Array(count).fill(null).map((_, index) => {
        if (index === 0) {
          return passengerTemplates.john;
        }
        return {
          passengerInfo: { firstName: '', lastName: '', dateOfBirth: '', gender: '', title: '' },
          document: { passportNumber: '', countryOfIssue: '', expiryDate: '', nationality: '' },
          contact: { email: '', phone: '', countryCode: '' }
        };
      })
    })
  },
  mixedValidInvalid: {
    name: '⚡ Mixed Valid/Invalid',
    data: (count: number) => ({
      passengers: Array(count).fill(null).map((_, index) => {
        if (index % 2 === 0) {
          const templates = [passengerTemplates.john, passengerTemplates.jane];
          return templates[index / 2 % templates.length];
        } else {
          return passengerTemplates.invalid;
        }
      })
    })
  },
  profileToggleTest: {
    name: '🔥 Profile + Additional',
    data: (count: number) => ({
      passengers: Array(count).fill(null).map((_, index) => {
        if (index === 0) {
          return {
            ...passengerTemplates.john,
            useProfileInfo: true
          };
        }
        const templates = [passengerTemplates.jane, passengerTemplates.carlos];
        return templates[(index - 1) % templates.length];
      })
    })
  },
  invalidEmail: {
    name: '❌ Invalid Email',
    data: (count: number) => ({
      passengers: Array(count).fill(null).map(() => ({
        passengerInfo: {
          firstName: 'Invalid',
          lastName: 'Email',
          dateOfBirth: '1992-03-10',
          gender: 'male',
          title: 'mr'
        },
        document: {
          passportNumber: 'C11111111',
          countryOfIssue: 'UK',
          expiryDate: '2031-01-01',
          nationality: 'UK'
        },
        contact: {
          email: 'not-an-email', // Invalid email format
          phone: '12345678',
          countryCode: '+44'
        }
      }))
    })
  },
  expiredPassport: {
    name: '❌ Expired Passport',
    data: (count: number) => ({
      passengers: Array(count).fill(null).map(() => ({
        passengerInfo: {
          firstName: 'Expired',
          lastName: 'Passport',
          dateOfBirth: '1988-07-25',
          gender: 'female',
          title: 'ms'
        },
        document: {
          passportNumber: 'D22222222',
          countryOfIssue: 'FR',
          expiryDate: '2020-01-01', // Expired
          nationality: 'FR'
        },
        contact: {
          email: 'expired@example.com',
          phone: '123456789',
          countryCode: '+33'
        }
      }))
    })
  },
  futureBirthDate: {
    name: '❌ Future Birth Date',
    data: (count: number) => ({
      passengers: Array(count).fill(null).map(() => ({
        passengerInfo: {
          firstName: 'Future',
          lastName: 'Born',
          dateOfBirth: '2030-01-01', // Future date
          gender: 'male',
          title: 'mr'
        },
        document: {
          passportNumber: 'E33333333',
          countryOfIssue: 'DE',
          expiryDate: '2032-01-01',
          nationality: 'DE'
        },
        contact: {
          email: 'future@example.com',
          phone: '12345678',
          countryCode: '+49'
        }
      }))
    })
  },
  longNames: {
    name: '🔤 Very Long Names',
    data: (count: number) => ({
      passengers: Array(count).fill(null).map(() => ({
        passengerInfo: {
          firstName: 'Supercalifragilisticexpialidocious',
          lastName: 'Antidisestablishmentarianism',
          dateOfBirth: '1990-01-01',
          gender: 'female',
          title: 'dr'
        },
        document: {
          passportNumber: 'F44444444',
          countryOfIssue: 'AU',
          expiryDate: '2030-01-01',
          nationality: 'AU'
        },
        contact: {
          email: 'verylongname@superlongdomainname.com',
          phone: '123456789',
          countryCode: '+61'
        }
      }))
    })
  },
  specialCharacters: {
    name: '🔣 Special Characters',
    data: (count: number) => ({
      passengers: Array(count).fill(null).map(() => ({
        passengerInfo: {
          firstName: 'José-María',
          lastName: "O'Connor-Smith",
          dateOfBirth: '1987-09-15',
          gender: 'male',
          title: 'mr'
        },
        document: {
          passportNumber: 'G55555555',
          countryOfIssue: 'ES',
          expiryDate: '2029-01-01',
          nationality: 'ES'
        },
        contact: {
          email: 'josé.maría@example.com',
          phone: '123456789',
          countryCode: '+34'
        }
      }))
    })
  },
  missingRequired: {
    name: '❌ Missing Required Fields',
    data: (count: number) => ({
      passengers: Array(count).fill(null).map(() => ({
        passengerInfo: {
          firstName: '', // Missing
          lastName: 'Missing',
          dateOfBirth: '', // Missing
          gender: '' // Missing
        },
        document: {
          passportNumber: '', // Missing
          countryOfIssue: '', // Missing
          expiryDate: '', // Missing
          nationality: '' // Missing
        },
        contact: {
          email: '', // Missing
          phone: '',
          countryCode: ''
        }
      }))
    })
  },
  invalidPassportFormat: {
    name: '❌ Invalid Passport Format',
    data: (count: number) => ({
      passengers: Array(count).fill(null).map(() => ({
        passengerInfo: {
          firstName: 'Invalid',
          lastName: 'Passport',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          title: 'mr'
        },
        document: {
          passportNumber: '123', // Too short
          countryOfIssue: 'JP',
          expiryDate: '2030-01-01',
          nationality: 'JP'
        },
        contact: {
          email: 'invalid.passport@example.com',
          phone: '123456789',
          countryCode: '+81'
        }
      }))
    })
  },
  boundaryDates: {
    name: '📅 Boundary Dates',
    data: (count: number) => ({
      passengers: Array(count).fill(null).map(() => ({
        passengerInfo: {
          firstName: 'Boundary',
          lastName: 'Test',
          dateOfBirth: '1900-01-01', // Very old
          gender: 'female',
          title: 'mrs'
        },
        document: {
          passportNumber: 'H66666666',
          countryOfIssue: 'IN',
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          nationality: 'IN'
        },
        contact: {
          email: 'boundary@example.com',
          phone: '123456789',
          countryCode: '+91'
        }
      }))
    })
  }
};

const CheckoutDevTool: React.FC<CheckoutDevToolProps> = ({ onFillForm, onClearForm, totalPassengers = 1 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [passengerCount, setPassengerCount] = useState(totalPassengers);
  const [useSameDataForAll, setUseSameDataForAll] = useState(true);

  const handleScenarioSelect = (scenarioKey: string) => {
    const scenario = testScenarios[scenarioKey as keyof typeof testScenarios];
    if (scenario && typeof scenario.data === 'function') {
      let data = scenario.data(totalPassengers);
      
      if (useSameDataForAll && totalPassengers > 1 && data.passengers && data.passengers.length > 0) {
        const firstPassengerData = { ...data.passengers[0] };
        data = {
          passengers: Array(totalPassengers).fill(null).map((_, index) => {
            if (index === 0) {
              return firstPassengerData;
            }
            const passengerData = { ...firstPassengerData };
            if ('useProfileInfo' in passengerData) {
              delete (passengerData as any).useProfileInfo;
            }
            return passengerData;
          })
        };
      }
      
      console.log('Filling form with data:', data);
      onFillForm(data);
      
      if (autoSubmit) {
        setTimeout(() => {
          const submitButton = document.querySelector('[data-testid="continue-button"]') as HTMLButtonElement;
          if (submitButton && !submitButton.disabled) {
            submitButton.click();
          }
        }, 500);
      }
    }
  };

  const handleRandomData = () => {
    const scenarios = Object.keys(testScenarios);
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    console.log('Selected random scenario:', randomScenario);
    handleScenarioSelect(randomScenario);
  };

  const handleFillSinglePassenger = (passengerIndex: number, templateKey: keyof typeof passengerTemplates) => {
    const template = passengerTemplates[templateKey];
    const data = {
      passengers: Array(totalPassengers).fill(null).map((_, index) => {
        if (useSameDataForAll) {
          const passengerData = { ...template };
          if (index > 0 && 'useProfileInfo' in passengerData) {
            delete (passengerData as any).useProfileInfo;
          }
          return passengerData;
        } else {
          if (index === passengerIndex) {
            return template;
          }
          return {
            passengerInfo: { firstName: '', lastName: '', dateOfBirth: '', gender: '', title: '' },
            document: { passportNumber: '', countryOfIssue: '', expiryDate: '', nationality: '' },
            contact: { email: '', phone: '', countryCode: '' }
          };
        }
      })
    };
    onFillForm(data);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={styles.devTool}>
      {!isOpen ? (
        <Button
          type="primary"
          icon={<BugOutlined />}
          onClick={() => setIsOpen(true)}
          className={styles.toggleButton}
          title="Open Checkout Dev Tool"
        >
          Dev Tool
        </Button>
      ) : (
        <Card
          title={
            <div className={styles.header}>
              <BugOutlined /> Checkout Dev Tool
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setIsOpen(false)}
                size="small"
              />
            </div>
          }
          className={styles.panel}
          size="small"
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div className={styles.controls}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <UserOutlined />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Passengers: {totalPassengers}
                </Text>
                {totalPassengers > 1 && (
                  <>
                    <InputNumber
                      min={1}
                      max={totalPassengers}
                      value={passengerCount}
                      onChange={(value) => setPassengerCount(value || 1)}
                      size="small"
                      style={{ width: 60 }}
                    />
                    <Text type="secondary" style={{ fontSize: '10px' }}>
                      Fill count
                    </Text>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Switch
                  checked={autoSubmit}
                  onChange={setAutoSubmit}
                  size="small"
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Auto-submit after fill
                </Text>
              </div>
              {totalPassengers > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Switch
                    checked={useSameDataForAll}
                    onChange={setUseSameDataForAll}
                    size="small"
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Use same data for all passengers
                  </Text>
                </div>
              )}
            </div>

            <Button
              type="primary"
              onClick={handleRandomData}
              size="small"
              block
            >
              🎲 Random Scenario
            </Button>

            <Button
              onClick={onClearForm}
              size="small"
              block
            >
              🗑️ Clear Form
            </Button>

            <Collapse 
              size="small" 
              ghost
              items={[
                {
                  key: 'scenarios',
                  label: `Test Scenarios (${totalPassengers} passenger${totalPassengers > 1 ? 's' : ''})`,
                  children: (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {Object.entries(testScenarios).map(([key, scenario]) => (
                        <Button
                          key={key}
                          onClick={() => handleScenarioSelect(key)}
                          size="small"
                          block
                          type="text"
                          className={styles.scenarioButton}
                        >
                          {scenario.name}
                        </Button>
                      ))}
                    </Space>
                  )
                },
                ...(totalPassengers > 1 ? [{
                  key: 'individual',
                  label: useSameDataForAll ? 'Fill All Passengers (Same Data)' : 'Fill Individual Passengers',
                  children: (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {Array(totalPassengers).fill(null).map((_, index) => (
                        <div key={index} style={{ marginBottom: '8px' }}>
                          <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                            {useSameDataForAll ? 
                              (index === 0 ? 'Select template (applies to all)' : `Passenger ${index + 1} (same as above)`) :
                              (index === 0 ? 'Primary Traveler' : `Traveler ${index + 1}`)
                            }:
                          </Text>
                          <Space size="small" style={{ width: '100%' }}>
                            {Object.entries(passengerTemplates)
                              .filter(([key]) => key !== 'invalid')
                              .map(([templateKey, template]) => (
                                <Button
                                  key={`${index}-${templateKey}`}
                                  onClick={() => handleFillSinglePassenger(index, templateKey as keyof typeof passengerTemplates)}
                                  size="small"
                                  type="text"
                                  disabled={useSameDataForAll && index > 0}
                                  style={{ 
                                    fontSize: '10px', 
                                    padding: '2px 6px', 
                                    height: 'auto',
                                    opacity: (useSameDataForAll && index > 0) ? 0.5 : 1
                                  }}
                                >
                                  {template.passengerInfo.firstName}
                                </Button>
                              ))}
                          </Space>
                        </div>
                      ))}
                    </Space>
                  )
                }] : [])
              ]}
            />
          </Space>
        </Card>
      )}
    </div>
  );
};

export default CheckoutDevTool;