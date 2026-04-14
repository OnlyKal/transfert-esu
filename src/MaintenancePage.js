import React from 'react';
import './MaintenancePage.css';

function MaintenancePage() {
  return (
    <div className="maintenance-container">
      <div className="maintenance-card">
        <div className="maintenance-icon-wrapper">
          <i className="bi bi-gear-wide-connected maintenance-icon"></i>
        </div>
        <h1 className="maintenance-title">Maintenance en cours</h1>
        <p className="maintenance-message">
          Notre plateforme est actuellement en cours de maintenance .
        </p>
        <div className="maintenance-info">
          <div className="maintenance-info-item">
            <i className="bi bi-shield-lock"></i>
            <span>Vos données sont en sécurité</span>
          </div>
          <div className="maintenance-info-item">
            <i className="bi bi-clock-history"></i>
            <span>Retour en ligne dans les plus brefs délais</span>
          </div>
          <div className="maintenance-info-item">
            <i className="bi bi-check-circle"></i>
            <span>Aucune action de votre part n'est requise</span>
          </div>
        </div>
        <div className="maintenance-footer">
          <p><i className="bi bi-heart"></i> Merci pour votre patience et votre compréhension.</p>
        </div>
      </div>
    </div>
  );
}

export default MaintenancePage;
