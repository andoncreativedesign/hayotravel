/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useChatStore, currentChatSelector } from '@/store/chat/chats.store';
import { useItineraryStore } from '@/store/itinerary/itinerary.store';
import { useCheckoutStore } from '@/store/checkout/checkout.store';
import { updateItinerary, getItineraryByClientId } from '@/utils/api/itinerary';
import styles from './ItineraryDebugPanel.module.scss';

export const ItineraryDebugPanel: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 20 }); // Will be set in useEffect
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isMarkingUnpaid, setIsMarkingUnpaid] = useState(false);
  const [apiItineraryData, setApiItineraryData] = useState<{id: number} | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const params = useParams<{ id: string; itineraryId?: string }>();
  const chatId = params.id;
  const urlItineraryId = params.itineraryId; // From checkout URL
  const { chatList } = useChatStore((state) => state);
  const currentChat = currentChatSelector(chatList, chatId);
  
  // Fetch itinerary data from API using external chat ID
  useEffect(() => {
    if (!chatId) return;
    
    const fetchItineraryData = async () => {
      try {
        const response = await getItineraryByClientId(chatId);
        setApiItineraryData(response);
      } catch (error) {
        console.error('Failed to fetch itinerary data:', error);
        setApiItineraryData(null);
      }
    };

    fetchItineraryData();
  }, [chatId]);
  
  const { 
    itinerary, 
    currentChatId, 
    choosedFlight, 
    choosedHotel,
    passengerCount,
    markItineraryAsPaid,
    markItineraryAsPaidAndPersist,
    isItineraryPaid
  } = useItineraryStore();

  // Get checkout store data (will be undefined if not on checkout page)
  const checkoutStore = useCheckoutStore();
  const checkoutItineraryId = checkoutStore?.itineraryId;
  const checkoutFormData = checkoutStore?.formData;

  const debugInfo = {
    chatId,
    currentChatId,
    // Multiple sources of itinerary ID
    chatItineraryId: currentChat?.itinerary_id,
    urlItineraryId,
    checkoutItineraryId,
    // Chat data
    chatTitleFromStore: currentChat?.title,
    chatTravelersCount: currentChat?.travelers_count,
    // Local state
    localItineraryLength: itinerary.length,
    localPassengerCount: passengerCount,
    choosedFlight,
    choosedHotel,
    itineraryIds: itinerary.map(item => ({ type: item.type, id: item.id })),
    // Meta info
    hasCurrentChat: !!currentChat,
    chatCreatedAt: currentChat?.created_at,
    lastUpdatedAt: currentChat?.updated_at,
    chatListLength: chatList?.length || 0,
    isCurrentPage: window.location.pathname,
    isCheckoutPage: !!urlItineraryId,
    // Passenger form data
    checkoutPassengerCount: checkoutFormData?.passengers?.length || 0,
    hasCheckoutFormData: !!checkoutFormData,
    // Payment status
    isItineraryPaid: isItineraryPaid(),
    paymentStatuses: itinerary.map(item => ({
      id: item.id,
      type: item.type,
      paymentStatus: item.data.payment_status || 'PENDING',
      paymentIntentId: item.data.payment_intent_id || null,
      paidAt: item.data.paid_at || null
    })),
    // API-fetched itinerary data
    apiItineraryId: apiItineraryData?.id || null,
    hasApiItineraryData: !!apiItineraryData,
  };

  const getDecisionLogic = () => {
    // Check all possible sources of itinerary ID in priority order
    const chatItineraryId = currentChat?.itinerary_id;
    const urlItineraryId = params.itineraryId;
    const checkoutItineraryId = checkoutStore?.itineraryId;
    const apiItineraryId = apiItineraryData?.id;
    
    let finalItineraryId = null;
    let source = '';
    let reason = '';
    
    if (urlItineraryId) {
      // On checkout page, URL itinerary ID is the source of truth
      finalItineraryId = urlItineraryId;
      source = 'URL parameter';
      reason = `Using itinerary ID from checkout URL: ${urlItineraryId}`;
    } else if (chatItineraryId) {
      // On chat page, chat entity itinerary ID is the source
      finalItineraryId = chatItineraryId;
      source = 'Chat entity';
      reason = `Using itinerary ID from chat record: ${chatItineraryId}`;
    } else if (apiItineraryId) {
      // Use API-fetched itinerary ID
      finalItineraryId = apiItineraryId;
      source = 'API call';
      reason = `Using itinerary ID from API: ${apiItineraryId}`;
    } else if (checkoutItineraryId) {
      // Fallback to checkout store
      finalItineraryId = checkoutItineraryId;
      source = 'Checkout store';
      reason = `Using itinerary ID from checkout store: ${checkoutItineraryId}`;
    } else if (!currentChat && !apiItineraryData) {
      reason = 'Chat and API data not loaded yet';
    } else {
      reason = 'No itinerary ID found in any source';
    }
    
    return {
      decision: finalItineraryId ? 'UPDATE_EXISTING' : 'CREATE_NEW',
      itineraryId: finalItineraryId || 'null/undefined',
      source,
      reason,
      // Debug info for all sources
      allSources: {
        chatItineraryId: chatItineraryId || null,
        urlItineraryId: urlItineraryId || null,
        apiItineraryId: apiItineraryId || null,
        checkoutItineraryId: checkoutItineraryId || null,
      }
    };
  };

  const decision = getDecisionLogic();

  // Check localStorage for debug info
  const localStorageKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('hayo-itinerary') || key.startsWith('hayo-passenger-count')
  );

  // Payment debugging handlers
  const handleMarkAsPaid = async () => {
    setIsMarkingPaid(true);
    const debugPaymentIntentId = `debug_payment_${Date.now()}`;
    const itineraryId = decision.itineraryId;
    
    console.log(`🐛 DEBUG: Attempting to mark itinerary as paid...`);
    console.log(`🐛 DEBUG: Payment Intent ID: ${debugPaymentIntentId}`);
    console.log(`🐛 DEBUG: Itinerary ID: ${itineraryId}`);
    
    try {
      if (itineraryId && itineraryId !== 'null/undefined') {
        // Use persistent method to update both store and database
        const numericItineraryId = parseInt(String(itineraryId));
        if (isNaN(numericItineraryId)) {
          throw new Error(`Invalid itinerary ID: ${itineraryId}`);
        }
        await markItineraryAsPaidAndPersist(debugPaymentIntentId, numericItineraryId);
        console.log('Successfully marked itinerary as paid and persisted to database');
      } else {
        // Fallback to local-only update if no itinerary ID
        markItineraryAsPaid(debugPaymentIntentId);
        console.log('No itinerary ID available - marked as paid locally only');
        console.log('To persist to DB, ensure you\'re on a chat with an existing itinerary');
      }
    } catch (error) {
      console.error('Failed to mark itinerary as paid:', error);
      // Fallback to local update if DB persistence fails
      markItineraryAsPaid(debugPaymentIntentId);
      console.log('DB persistence failed - applied locally only');
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const handleMarkAsUnpaid = async () => {
    setIsMarkingUnpaid(true);
    const itineraryId = decision.itineraryId;
    
    console.log(`🐛 DEBUG: Attempting to mark itinerary as unpaid...`);
    console.log(`🐛 DEBUG: Itinerary ID: ${itineraryId}`);
    
    try {
      // Update local state first
      const { setItinerary } = useItineraryStore.getState();
      const updatedItinerary = itinerary.map(item => {
        const { payment_status, payment_intent_id, paid_at, ...cleanData } = item.data as any;
        return {
          ...item,
          data: cleanData,
        };
      });
      setItinerary(updatedItinerary as any);
      console.log('🐛 DEBUG: Local state updated to unpaid');
      
      // Persist to database if we have an itinerary ID
      if (itineraryId && itineraryId !== 'null/undefined') {
        const state = useItineraryStore.getState();
        const updatedItineraryData = {
          itinerary_data: {
            itinerary: state.itinerary,
            travelers_count: state.passengerCount,
          }
        };
        
        console.log('💾 DEBUG: Persisting unpaid status to database:', {
          itineraryId,
          itineraryData: updatedItineraryData
        });
        
        const numericItineraryId = parseInt(String(itineraryId));
        if (isNaN(numericItineraryId)) {
          throw new Error(`Invalid itinerary ID: ${itineraryId}`);
        }
        
        await updateItinerary({
          itinerary: updatedItineraryData,
          itinerary_id: numericItineraryId,
        });
        
        // Also clear the top-level itinerary payment status
        await updateItinerary({
          itinerary: {
            payment_status: null,
            payment_intent_id: null,
            paid_at: null,
          } as any, // Cast to any since payment fields aren't in the interface but are accepted by the API
          itinerary_id: numericItineraryId,
        });
        
        console.log('Successfully marked as unpaid and persisted to database');
      } else {
        console.log('No itinerary ID available - marked as unpaid locally only');
        console.log('To persist to DB, ensure you\'re on a chat with an existing itinerary');
      }
    } catch (error) {
      console.error('Failed to mark itinerary as unpaid:', error);
    } finally {
      setIsMarkingUnpaid(false);
    }
  };

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Don't start drag if clicking on buttons or interactive elements
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    
    if (e.target === e.currentTarget || target.classList.contains(styles.dragHandle) || target.classList.contains(styles.dragIndicator)) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      e.preventDefault(); // Prevent text selection
    }
  };

  // Set initial position after component mounts
  useEffect(() => {
    if (position.x === 0 && typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - 420, // 20px from right edge (400px width + 20px margin)
        y: 20 // 20px from top
      });
    }
  }, [position.x]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Keep panel within viewport bounds
      const maxX = window.innerWidth - (panelRef.current?.offsetWidth || 400);
      const maxY = window.innerHeight - (panelRef.current?.offsetHeight || 300);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div 
      ref={panelRef}
      className={`${styles.debugPanel} ${isCollapsed ? styles.collapsed : ''} ${isDragging ? styles.dragging : ''}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        right: 'auto',
        bottom: 'auto'
      }}
    >
      <div 
        className={`${styles.header} ${styles.dragHandle}`}
        onMouseDown={handleMouseDown}
      >
        <div className={styles.headerLeft}>
          <div className={styles.dragIndicator}>⋮⋮</div>
          <h3>🐛 Itinerary Debug Panel</h3>
        </div>
        <div className={styles.headerControls}>
          <div className={`${styles.decision} ${styles[decision.decision.toLowerCase()]}`}>
            Next Action: <strong>{decision.decision}</strong>
            {decision.source && <div style={{ fontSize: '8px', opacity: 0.8 }}>via {decision.source}</div>}
          </div>
          <button 
            className={styles.toggleButton}
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand debug panel' : 'Collapse debug panel'}
          >
            {isCollapsed ? '▲' : '▼'}
          </button>
        </div>
      </div>
      
      {isCollapsed ? (
        <div className={styles.collapsedContent}>
          <div className={styles.quickInfo}>
            <span>ID: <code>{decision.itineraryId}</code></span>
            <span>Source: <code>{decision.source || 'None'}</code></span>
            <span>Items: <code>{debugInfo.localItineraryLength}</code></span>
            <span>Passengers: <code>{debugInfo.checkoutPassengerCount || debugInfo.localPassengerCount}</code></span>
            <span>Type: <code>{debugInfo.isCheckoutPage ? 'Checkout' : 'Chat'}</code></span>
            <span>Payment: <code className={debugInfo.isItineraryPaid ? styles.paid : styles.unpaid}>
              {debugInfo.isItineraryPaid ? '✅ PAID' : '❌ UNPAID'}
            </code></span>
            {debugInfo.hasCheckoutFormData && checkoutFormData?.passengers && checkoutFormData.passengers[0]?.contact?.phone && (
              <span>Phone: <code style={{ 
                backgroundColor: (() => {
                  const phone = checkoutFormData.passengers[0].contact.phone;
                  const phoneRegex = /^\+[1-9]\d{1,14}$/;
                  const isValidPhone = phoneRegex.test(phone);
                  const hasPlus = phone.includes('+');
                  return isValidPhone ? '#dcfce7' : hasPlus ? '#fef3c7' : '#fecaca';
                })(),
                padding: '1px 3px',
                borderRadius: '2px'
              }}>
                {checkoutFormData.passengers[0].contact.phone}
              </code>
              <span style={{ marginLeft: '2px', fontSize: '10px' }}>
                {(() => {
                  const phone = checkoutFormData.passengers[0].contact.phone;
                  const phoneRegex = /^\+[1-9]\d{1,14}$/;
                  const isValidPhone = phoneRegex.test(phone);
                  const hasPlus = phone.includes('+');
                  return isValidPhone ? '✅' : hasPlus ? '⚠️' : '❌';
                })()}
              </span></span>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className={styles.section}>
            <h4>Decision Logic</h4>
            <div className={styles.decisionInfo}>
              <div>Decision: <code>{decision.decision}</code></div>
              <div>Itinerary ID: <code>{decision.itineraryId}</code></div>
              <div>Source: <code>{decision.source || 'None'}</code></div>
              <div>Reason: <em>{decision.reason}</em></div>
            </div>
          </div>

          <div className={styles.section}>
            <h4>Itinerary ID Sources</h4>
            <div className={styles.debugInfo}>
              <div>URL Parameter: <code>{decision.allSources.urlItineraryId || 'null'}</code></div>
              <div>Chat Entity: <code>{decision.allSources.chatItineraryId || 'null'}</code></div>
              <div>Checkout Store: <code>{decision.allSources.checkoutItineraryId || 'null'}</code></div>
              <div>Page Type: <code>{debugInfo.isCheckoutPage ? 'Checkout' : 'Chat'}</code></div>
            </div>
          </div>

          <div className={styles.section}>
            <h4>Passenger Data</h4>
            <div className={styles.debugInfo}>
              <div>Local Count: <code>{debugInfo.localPassengerCount}</code></div>
              <div>Checkout Count: <code>{debugInfo.checkoutPassengerCount}</code></div>
              <div>Form Data Available: <code>{debugInfo.hasCheckoutFormData ? 'Yes' : 'No'}</code></div>
              {debugInfo.hasCheckoutFormData && checkoutFormData?.passengers && (
                <div style={{ fontSize: '10px', opacity: 0.8 }}>
                  Names: {checkoutFormData.passengers.map(p => 
                    `${p.passengerInfo?.firstName || 'Unknown'} ${p.passengerInfo?.lastName || ''}`
                  ).join(', ')}
                </div>
              )}
              {debugInfo.hasCheckoutFormData && checkoutFormData?.passengers && (
                <div style={{ fontSize: '10px', marginTop: '8px' }}>
                  <strong>Phone Numbers:</strong>
                  {checkoutFormData.passengers.map((p, index) => {
                    const phone = p.contact?.phone || '';
                    const phoneRegex = /^\+[1-9]\d{1,14}$/;
                    const isValidPhone = phoneRegex.test(phone);
                    const hasPlus = phone.includes('+');
                    
                    return (
                      <div key={index} style={{ marginLeft: '10px', fontFamily: 'monospace' }}>
                        {p.passengerInfo?.firstName || `Passenger ${index + 1}`}: 
                        <code style={{ 
                          backgroundColor: isValidPhone ? '#dcfce7' : hasPlus ? '#fef3c7' : '#fecaca',
                          padding: '2px 4px',
                          borderRadius: '2px',
                          marginLeft: '4px'
                        }}>
                          {phone || 'No phone'}
                        </code>
                        <span style={{ marginLeft: '4px', fontSize: '9px' }}>
                          {isValidPhone ? '✅' : hasPlus ? '⚠️' : '❌'}
                        </span>
                        {p.contact?.countryCode && (
                          <span style={{ opacity: 0.6, fontSize: '9px' }}>
                            {' '}(CC: {p.contact.countryCode})
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <div style={{ marginTop: '4px', fontSize: '9px', opacity: 0.7 }}>
                    ✅ Valid • ⚠️ Has + but invalid format • ❌ Missing + or invalid
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h4>Payment Status (Debug Controls)</h4>
            <div className={styles.debugInfo}>
              <div>Overall Status: <code className={debugInfo.isItineraryPaid ? styles.paid : styles.unpaid}>
                {debugInfo.isItineraryPaid ? '✅ PAID' : '❌ UNPAID'}
              </code></div>
              
              {debugInfo.paymentStatuses.length > 0 && (
                <div style={{ marginTop: '8px', fontSize: '10px' }}>
                  <strong>Individual Items:</strong>
                  {debugInfo.paymentStatuses.map((item, index) => (
                    <div key={index} style={{ marginLeft: '10px' }}>
                      {item.type}: <code>{item.paymentStatus || 'PENDING'}</code>
                      {item.paymentIntentId && (
                        <span style={{ opacity: 0.7 }}> (ID: {item.paymentIntentId.slice(-8)})</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className={styles.buttonGroup} style={{ marginTop: '12px' }}>
                <button 
                  onClick={handleMarkAsPaid}
                  className={`${styles.debugButton} ${styles.success}`}
                  disabled={debugInfo.isItineraryPaid || itinerary.length === 0 || isMarkingPaid || isMarkingUnpaid}
                >
                  {isMarkingPaid ? '⏳ Marking...' : '💳 Mark as Paid'}
                  {decision.itineraryId !== 'null/undefined' && !isMarkingPaid && (
                    <span style={{ fontSize: '8px', opacity: 0.8 }}> (+DB)</span>
                  )}
                </button>
                <button 
                  onClick={handleMarkAsUnpaid}
                  className={`${styles.debugButton} ${styles.warning}`}
                  disabled={!debugInfo.isItineraryPaid || itinerary.length === 0 || isMarkingPaid || isMarkingUnpaid}
                >
                  {isMarkingUnpaid ? '⏳ Unmarking...' : '🔄 Mark as Unpaid'}
                  {decision.itineraryId !== 'null/undefined' && !isMarkingUnpaid && (
                    <span style={{ fontSize: '8px', opacity: 0.8 }}> (+DB)</span>
                  )}
                </button>
              </div>
              
              {itinerary.length === 0 && (
                <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
                  No itinerary items to modify payment status
                </div>
              )}
              
              {itinerary.length > 0 && (
                <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
                  {decision.itineraryId !== 'null/undefined' ? (
                    <span style={{ color: '#22c55e' }}>
                      ✅ Changes will persist to database (ID: {decision.itineraryId})
                    </span>
                  ) : (
                    <span style={{ color: '#ef4444' }}>
                      ⚠️ Local changes only - no itinerary ID for DB persistence
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

      <div className={styles.grid}>
        <div className={styles.section}>
          <h4>Chat State</h4>
          <div className={styles.debugInfo}>
            <div>URL Chat ID: <code>{debugInfo.chatId}</code></div>
            <div>Current Chat ID: <code>{debugInfo.currentChatId}</code></div>
            <div>Chat Itinerary ID: <code>{debugInfo.chatItineraryId || 'null'}</code></div>
            <div>API Itinerary ID: <code>{debugInfo.apiItineraryId || 'null'}</code></div>
            <div><strong>Effective Itinerary ID: <code>{decision.itineraryId}</code> (from {decision.source})</strong></div>
            <div>Has Current Chat: <code>{debugInfo.hasCurrentChat ? 'true' : 'false'}</code></div>
            <div>Chat Title: <code>{debugInfo.chatTitleFromStore || 'null'}</code></div>
            <div>Chat Travelers: <code>{debugInfo.chatTravelersCount || 'null'}</code></div>
            <div>Chat List Length: <code>{debugInfo.chatListLength}</code></div>
            <div>Current Page: <code>{debugInfo.isCurrentPage}</code></div>
            <div>Created At: <code>{debugInfo.chatCreatedAt || 'null'}</code></div>
          </div>
        </div>

        <div className={styles.section}>
          <h4>Local Itinerary State</h4>
          <div className={styles.debugInfo}>
            <div>Itinerary Length: <code>{debugInfo.localItineraryLength}</code></div>
            <div>Passenger Count: <code>{debugInfo.localPassengerCount}</code></div>
            <div>Chosen Flight: <code>{debugInfo.choosedFlight || 'null'}</code></div>
            <div>Chosen Hotel: <code>{debugInfo.choosedHotel || 'null'}</code></div>
          </div>
        </div>

        <div className={styles.section}>
          <h4>Itinerary Items</h4>
          <div className={styles.debugInfo}>
            {debugInfo.itineraryIds.length > 0 ? (
              debugInfo.itineraryIds.map((item, index) => (
                <div key={index}>
                  {item.type}: <code>{item.id}</code>
                </div>
              ))
            ) : (
              <div>No itinerary items</div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h4>Local Storage</h4>
          <div className={styles.debugInfo}>
            {localStorageKeys.length > 0 ? (
              localStorageKeys.map((key) => {
                try {
                  const value = localStorage.getItem(key);
                  return (
                    <div key={key} className={styles.storageItem}>
                      <div className={styles.storageKey}>{key}:</div>
                      <div className={styles.storageValue}>
                        <code>{value ? (key.includes('passenger-count') ? value : `${value.length} chars`) : 'null'}</code>
                      </div>
                    </div>
                  );
                } catch {
                  return (
                    <div key={key}>
                      {key}: <code>Error reading</code>
                    </div>
                  );
                }
              })
            ) : (
              <div>No itinerary data in localStorage</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>Full State JSON</h4>
        <details className={styles.details}>
          <summary>Click to expand raw state</summary>
          <pre className={styles.jsonOutput}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      </div>
        </>
      )}
    </div>
  );
};
