import React from 'react';

const MaintenanceOverlay = () => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 9999999999, // Very high z-index
        background: 'linear-gradient(to right, #600b56 0%, #150E23 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        textAlign: 'center',
        padding: '20px'
      }}
    >
      <h2 style={{ color: '#fff', marginBottom: '15px', fontSize: '2rem', fontWeight: 700 }}>
        Próximamente estará disponible
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem' }}>
        Se encuentra en mantenimiento
      </p>
    </div>
  );
};

export default MaintenanceOverlay;
