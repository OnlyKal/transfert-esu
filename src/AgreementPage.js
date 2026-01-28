import React from 'react';
import './AgreementPage.css';

const paymentAccounts = [
  {
    bank: 'RAWBANK',
    accounts: [
      { currency: 'USD', number: '05100 05101 01001374002 82' },
      { currency: 'CDF', number: '05100 05101 01001374001 85' },
    ],
  },
  {
    bank: 'FIRST BANK',
    accounts: [
      { currency: 'USD', number: '00014-11011-20420969394-40' },
      { currency: 'CDF', number: '00014-11011-20420969395-37' },
    ],
  },
  {
    bank: 'AFRILAND FIRSTBANK',
    accounts: [
      { currency: 'USD', number: '00019 00001 02200640601-87' },
      { currency: 'CDF', number: '00019 00001 02200640601-92' },
    ],
  },
  {
    bank: 'TMB',
    accounts: [
      { currency: 'USD', number: '00017-27000-73035820201-11' },
      { currency: 'CDF', number: '00017-27000-73035820300-05' },
    ],
  },
];

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

          <div className="payment-accounts-section">
            <h2>Comptes de Paiement</h2>
            <p className="section-description">
              Effectuez votre paiement sur l'un des comptes bancaires suivants, puis joignez la preuve de paiement à votre dossier.
            </p>
            <div className="payment-accounts-grid">
              {paymentAccounts.map((bank) => (
                <div key={bank.bank} className="payment-bank-card">
                  <h3 className="bank-name">{bank.bank}</h3>
                  <div className="bank-accounts">
                    {bank.accounts.map((account) => (
                      <div key={account.currency} className="account-row">
                        <span className="currency-badge">{account.currency}</span>
                        <span className="account-number">{account.number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
