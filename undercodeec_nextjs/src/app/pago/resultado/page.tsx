'use client';

import React from 'react';
import MainLayout from "@/layouts/Main";

export default function PaymentResultPage() {
  return (
    <MainLayout>
      <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container text-center">
          <h1 className="mb-30">Resultado del Pago</h1>
          <p className="text-muted">Procesando tu transacción. Por favor espera un momento.</p>
        </div>
      </main>
    </MainLayout>
  );
}
