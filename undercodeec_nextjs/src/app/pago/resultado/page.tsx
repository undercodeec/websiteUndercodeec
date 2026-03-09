'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'cancelled' | 'error'>('processing');
  const [message, setMessage] = useState('Verificando estado del pago...');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [isPopup, setIsPopup] = useState(false);

  // Debug logs state
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    const logEntry = `${time} - ${msg}`;
    console.log(logEntry);
    setDebugLogs(prev => [...prev, logEntry]);
  };

  // Backend URL configuration
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL
    || (process.env.NODE_ENV === 'production' ? 'https://api.undercodeec.com' : 'http://localhost:3001');

  useEffect(() => {
    // Check if this is running in a popup window
    const isInPopup = window.opener !== null;
    setIsPopup(isInPopup);
    addLog(`📍 Page loaded. Is popup: ${isInPopup}`);
    addLog(`📍 URL: ${window.location.href}`);

    const confirmPayment = async () => {
      // Get parameters from PayPhone redirect
      const id = searchParams.get('id') || searchParams.get('ID');
      const clientTransactionId = searchParams.get('clientTransactionId') || searchParams.get('clientTransactionID');

      addLog(`🔍 Params - id: ${id}, clientTxId: ${clientTransactionId}`);

      if (!id || !clientTransactionId) {
        addLog('❌ Missing payment parameters');
        setStatus('error');
        setMessage('No se recibieron los parámetros de pago. Por favor contacta a soporte.');
        return;
      }

      try {
        // Retrieve order details from localStorage
        const pendingOrderData = localStorage.getItem('pendingOrderData');
        let orderData = null;

        if (pendingOrderData) {
          try {
            orderData = JSON.parse(pendingOrderData);
            addLog(`✅ Pending order data found for: ${orderData.planName}`);
          } catch (e) {
            addLog('⚠️ Error parsing order data');
          }
        } else {
          addLog('⚠️ No pending order data found');
        }

        addLog(`🔄 Calling confirm-payment API at ${BACKEND_URL}...`);

        // Call backend to confirm payment and send emails
        const response = await fetch(`${BACKEND_URL}/api/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id,
            clientTransactionId,
            orderData // Send orderData to backend for email sending
          })
        });

        addLog(`📨 API Status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          addLog(`❌ API Error Body: ${errorText}`);
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        addLog(`📨 Backend response: ${JSON.stringify(data).substring(0, 100)}...`);

        if (data.success && data.transactionStatus === 3) {
          // Payment approved!
          addLog('✅ Payment approved!');
          setStatus('success');
          setMessage('¡Pago completado exitosamente! Procesando...');
          setTransactionDetails(data.details);

          // Save payment completion flag to localStorage
          localStorage.setItem('paymentCompleted', JSON.stringify({
            success: true,
            transactionId: data.details?.transactionId,
            amount: data.details?.amount,
            timestamp: Date.now()
          }));

          addLog('💾 Saved to localStorage: paymentCompleted');

          // Clear pending order data
          localStorage.removeItem('pendingOrderData');

          // Notify parent window if this is a popup
          if (window.opener && !window.opener.closed) {
            addLog('📤 Sending postMessage to parent');
            try {
              window.opener.postMessage({
                type: 'PAYMENT_COMPLETED',
                success: true,
                transactionId: data.details?.transactionId,
                amount: data.details?.amount
              }, '*');
              addLog('✅ Message sent');
            } catch (e) {
              addLog(`❌ postMessage error: ${e}`);
            }

            // Also trigger a storage event as backup
            localStorage.setItem('paymentNotification', JSON.stringify({
              type: 'PAYMENT_COMPLETED',
              success: true,
              transactionId: data.details?.transactionId,
              amount: data.details?.amount,
              timestamp: Date.now()
            }));
            addLog('💾 Triggered storage event: paymentNotification');
          } else {
            addLog('⚠️ No parent window found (not in popup mode)');
          }

          // If popup, close after 5 seconds (give time for message to be received)
          if (isInPopup) {
            addLog('⏳ Closing popup in 5s...');
            setTimeout(() => {
              addLog('🚪 Closing popup window');
              window.close();
            }, 5000);
          }

        } else if (data.transactionStatus === 2) {
          // Payment cancelled/rejected
          addLog('❌ Payment cancelled/rejected');
          setStatus('cancelled');
          setMessage('El pago fue cancelado o rechazado.');

          // Notify parent window
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
              type: 'PAYMENT_CANCELLED',
              success: false
            }, '*');
          }
        } else {
          addLog(`⚠️ Unknown status: ${data.transactionStatus}`);
          setStatus('error');
          setMessage(data.error || 'Hubo un problema verificando el pago.');

          // Notify parent window
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
              type: 'PAYMENT_ERROR',
              success: false,
              error: data.error
            }, '*');
          }
        }

      } catch (error: any) {
        addLog(`❌ Critical Error: ${error.message}`);
        console.error('Error confirming payment:', error);
        setStatus('error');
        setMessage('Error de conexión. Por favor contacta a soporte.');

        // Notify parent window of error
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'PAYMENT_ERROR',
            success: false,
            error: 'Connection error'
          }, '*');
        }
      }
    };

    confirmPayment();
  }, [searchParams]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        {status === 'processing' && (
          <>
            <h2 style={{ color: '#666' }}>Verificando pago...</h2>
            <div style={{ margin: '20px auto', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 2s linear infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 style={{ color: '#2ecc71' }}>¡Pago Exitoso!</h2>
            <p>{message}</p>
            {transactionDetails && (
              <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginTop: '15px', textAlign: 'left' }}>
                <p><strong>Transacción:</strong> {transactionDetails.transactionId}</p>
                <p><strong>Monto:</strong> ${(transactionDetails.amount / 100).toFixed(2)}</p>
                <p><strong>Autorización:</strong> {transactionDetails.authorizationCode}</p>
              </div>
            )}
            <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>Esta ventana se cerrará automáticamente...</p>
          </>
        )}

        {status === 'cancelled' && (
          <>
            <h2 style={{ color: '#e74c3c' }}>Pago Cancelado</h2>
            <p>{message}</p>
            <button onClick={() => window.close()} style={{ background: '#333', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginTop: '15px' }}>Cerrar Ventana</button>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 style={{ color: '#c0392b' }}>Error</h2>
            <p>{message}</p>
            <button onClick={() => window.close()} style={{ background: '#333', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginTop: '15px' }}>Cerrar Ventana</button>
          </>
        )}
      </div>

      {/* Debug Logs Section */}
      <div style={{ marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
        <h3 style={{ fontSize: '14px', color: '#888' }}>Debug Log (No cerrar si hay error):</h3>
        <div style={{ background: '#222', color: '#0f0', padding: '10px', borderRadius: '5px', fontSize: '12px', textAlign: 'left', height: '200px', overflowY: 'auto', fontFamily: 'monospace' }}>
          {debugLogs.length === 0 ? 'Esperando logs...' : debugLogs.map((log, i) => (
            <div key={i} style={{ marginBottom: '4px', borderBottom: '1px solid #333', paddingBottom: '2px' }}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div>Cargando página de resultados...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}
