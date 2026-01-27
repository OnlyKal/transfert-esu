import React from 'react';
import './GuidePage.css';

const processSections = [
  {
    title: '1. Préparer ses accès',
    description: 'Créez votre compte ou connectez-vous avec vos identifiants existants avant toute demande.',
    steps: [
      'Rassembler les informations personnelles (nom, postnom, email, téléphone).',
      "Vérifier la validité de l'adresse email et du numéro de téléphone.",
      'Choisir un mot de passe robuste (12 caractères, lettres, chiffres, symboles).',
    ],
  },
  {
    title: '2. Compléter le formulaire',
    description: 'Saisissez les informations du transfert dans le formulaire dédié.',
    steps: [
      'Cliquer sur « + Nouvelle demande » pour démarrer un dossier.',
      'Renseigner les champs personnels et académiques obligatoires.',
      'Sauvegarder régulièrement pour éviter toute perte involontaire.',
    ],
  },
  {
    title: '3. Téléverser les documents',
    description: 'Ajoutez chaque pièce justificative avec le libellé correspondant.',
    steps: [
      "Utiliser le bouton d'upload prévu pour chaque document obligatoire.",
      'Vérifier le format (PDF ou image lisible) et la clarté du scan.',
      'Consulter le tooltip pour comprendre le contenu attendu.',
    ],
  },
  {
    title: '4. Vérifier et soumettre',
    description: 'Assurez-vous que tous les voyants sont au vert avant envoi.',
    steps: [
      'Contrôler la section « Documents manquants » dans Mes transferts.',
      'Mettre à jour les informations provinciales si nécessaire.',
      'Soumettre en cliquant sur « Compléter le dossier » quand tout est prêt.',
    ],
  },
];

const timelineSteps = [
  {
    label: 'Étape 1',
    title: 'Création du compte',
    details: 'Inscription ou connexion sécurisée via votre email et votre mot de passe.',
  },
  {
    label: 'Étape 2',
    title: 'Remplissage du dossier',
    details: 'Formulaire dynamique avec assistance par tooltip pour chaque champ sensible.',
  },
  {
    label: 'Étape 3',
    title: 'Upload des pièces',
    details: 'Ajout des documents exigés, suivi du statut et téléchargement possible.',
  },
  {
    label: 'Étape 4',
    title: 'Suivi et mises à jour',
    details: 'Consultez l’onglet « Mes transferts », mettez à jour les pièces manquantes et suivez les statuts.',
  },
];

const quickTips = [
  'Les champs critiques affichent un indicateur en cas de données manquantes.',
  'Les provinces sont regroupées avec leur description pour éviter les inversions.',
  'Chaque fichier peut être rouvert via l’icône de téléchargement pour vérification.',
  'Pensez à vider le cache du navigateur si une pièce refuse de se téléverser.',
];
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
      { currency: 'USD', number: '00014-11011-20420969394 40' },
      { currency: 'CDF', number: '00014-11011-20420969395 37' },
    ],
  },
  {
    bank: 'AFRILAND FIRSTBANK',
    accounts: [
      { currency: 'USD', number: '00019 00001 02200640601 87' },
      { currency: 'CDF', number: '00019 00001 02200640601 92' },
    ],
  },
  {
    bank: 'TMB',
    accounts: [
      { currency: 'USD', number: '00017-27000-73035820201 11' },
      { currency: 'CDF', number: '00017-27000-73035820300 05' },
    ],
  },
];
const GuidePage = ({ user, onBack, onContinue, onLogout, fromAgreement }) => {
  return (
    <>
      <div className="form-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-logo">
              <img src="/app-logo.png" alt="Logo" className="logo" />
            </div>
          </div>

          <div className="header-center">
            <h1>Guide Complet</h1>
            <p className="subtitle">Toutes les étapes de la demande de transfert, de A à Z</p>
          </div>

          <div className="header-right">
            <span className="user-info">{user?.nom} {user?.prenom}</span>
            {fromAgreement && onContinue ? (
              <button className="guide-back-btn" onClick={onContinue}>
                Commencer ma demande →
              </button>
            ) : (
              <button className="guide-back-btn" onClick={onBack}>
                ← Retour
              </button>
            )}
            <button className="logout-btn" onClick={onLogout}>
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="guide-page">
        <section className="guide-intro">
          <h2>Par où commencer ?</h2>
          <p>
            Ce guide vous accompagne pas à pas pour préparer, compléter et suivre votre demande de transfert.
            Chaque section détaille les actions à mener et les points de contrôle essentiels avant la soumission.
          </p>
          <div className="guide-intro-actions">
            {fromAgreement && onContinue ? (
              <>
                <button className="primary-btn" onClick={onContinue}>
                  Commencer ma demande
                </button>
                <button className="outline-btn" onClick={onBack}>
                  Retour à la liste
                </button>
              </>
            ) : (
              <>
                <button className="primary-btn" onClick={onBack}>
                  Revenir à mes transferts
                </button>
                <button className="outline-btn" onClick={() => window.open('mailto:support@transfert.cd')}>
                  Contacter le support
                </button>
              </>
            )}
          </div>
        </section>

        <div className="guide-grid">
          {processSections.map((section) => (
            <article key={section.title} className="guide-card">
              <div className="card-heading">
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
              <ul>
                {section.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <section className="guide-timeline">
          <h2>Parcours utilisateur</h2>
          <div className="timeline-track">
            {timelineSteps.map((step) => (
              <div key={step.label} className="timeline-card">
                <span className="timeline-label">{step.label}</span>
                <h3>{step.title}</h3>
                <p>{step.details}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="guide-tips">
          <h2>Conseils rapides</h2>
          <div className="tips-grid">
            {quickTips.map((tip) => (
              <div key={tip} className="tip-card">
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="payment-accounts-section">
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
        </section>
      </div>
    </>
  );
};

export default GuidePage;
