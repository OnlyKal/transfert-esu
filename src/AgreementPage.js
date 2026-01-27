import React from 'react';
import './AgreementPage.css';

const AgreementPage = ({ onContinue, onQuit, user, onLogout }) => {
  return (
    <div className="agreement-page">
      <div className="agreement-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Demande de Transfert - Directives Importantes</h1>
          </div>
          {user && (
            <div className="user-info">
              <span>Connecté : {user.nom} {user.prenom}</span>
              <button onClick={onLogout} className="btn-logout">Déconnexion</button>
            </div>
          )}
        </div>
      </div>

      <div className="agreement-container">
        <div className="agreement-content">
          <h2>Lisez attentivement ce qui suit avant de remplir le formulaire de demande de transfert :</h2>
          
          <div className="directives-list">
            <div className="directive-item">
              <span className="directive-number">1)</span>
              <p>Si vous sollicitez un transfert d'office, au sens des textes légaux et réglementaires, ne remplissez pas ce formulaire ;</p>
            </div>

            <div className="directive-item">
              <span className="directive-number">2)</span>
              <p>Assurez-vous d'avoir, au format pdf, les copies certifiées conformes aux originaux des pièces requises, exceptée la preuve de paiement des frais administratifs dus au MINESURSI ;</p>
            </div>

            <div className="directive-item">
              <span className="directive-number">3)</span>
              <p>Tout dossier incomplet ou composé de pièces non certifiées conformes aux originales sera rejeté ;</p>
            </div>

            <div className="directive-item">
              <span className="directive-number">4)</span>
              <p>Les déclarations erronées, mensongères ou frauduleuses donneront lieu à des sanctions administratives et, le cas échéant, à des poursuites judiciaires ;</p>
            </div>

            <div className="directive-item">
              <span className="directive-number">5)</span>
              <p>Si après l'examen à première vue de votre dossier, celui-ci est déclaré recevable et susceptible d'obtenir une suite favorable, vous serez contacté en vue de présenter la version papier de votre dossier : les originaux de différentes lettres et attestations, ainsi que les copies certifiées conformes aux originaux des autres pièces du dossier.</p>
            </div>
          </div>

          <div className="agreement-declaration">
            <p className="declaration-text">
              <strong>Je reconnais avoir pris connaissance des directives ci-dessus et m'engage à les observer scrupuleusement.</strong>
            </p>
          </div>
        </div>

        <div className="agreement-actions">
          <button onClick={onContinue} className="btn-continue">
            Continuer
          </button>
          <button onClick={onQuit} className="btn-quit">
            Quitter
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgreementPage;
