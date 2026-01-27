import React, { useState, useEffect, useCallback } from 'react';
import { FiFileText, FiDownload } from 'react-icons/fi';
import './TransfertList.css';
import { extractOwnerId } from './utils/auth';

const TransfertList = ({ user, token, onLogout, onCreateNew, onEditTransfert, onShowGuide }) => {
  const [transferts, setTransferts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchTransferts = useCallback(async () => {
    const ownerId = extractOwnerId(user);

    if (!ownerId) {
      setLoading(false);
      setMessage({
        type: 'error',
        text: 'Identifiant utilisateur introuvable.',
      });
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    try {
      setLoading(true);
      const response = await fetch(`https://admin.cgiibnn-esursi.cd/api/candidat/transfert/owner/${ownerId}/`, {
        method: 'GET',
        headers,
      });
       console.log('Fetch Transferts Response:', response.ok, response.status, response);
      if (response.ok) {
        const result = await response.json();
        // L'API retourne probablement un objet paginé
        const data = result.results || result.data || (Array.isArray(result) ? result : []);
        setTransferts(Array.isArray(data) ? data : [])
        setMessage({ type: '', text: '' });
      } else {
          let errorInfo = 'Impossible de charger les transferts';
        try {
          const error = await response.json();
          errorInfo = error.message || error.detail || errorInfo;
        } catch (err) {
          // Ignorer si le body n'est pas JSON
        }

        setMessage({
          type: 'error',
            text: response.status === 401
              ? "Accès refusé (401) : reconnectez-vous pour continuer."
              : `Erreur serveur (${response.status}) : ${errorInfo}`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Erreur réseau : ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Récupérer la liste des transferts
  useEffect(() => {
    fetchTransferts();
  }, [fetchTransferts]);

  const getMissingFiles = (transfert) => {
    const requiredFiles = [
      'piece_identite',
      'carte_service',
      'lettre_transfert',
      'formulaire_transfert_signe',
      'pv_origine',
      'pv_accueil',
      'cadre_organique_accueil',
      'attestation_effectifs_enseignants',
      'attestation_effectifs_chercheurs',
      'preuve_paiement',
      'preuve_charge_horaire',
      'pv_attribution_charge',
    ];

    return requiredFiles.filter(file => !transfert[file]);
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'draft': { label: 'Brouillon', color: '#95a5a6' },
      'pending': { label: 'En attente', color: '#f39c12' },
      'approved': { label: 'Approuvé', color: '#27ae60' },
      'rejected': { label: 'Rejeté', color: '#e74c3c' },
      'submitted': { label: 'Soumis', color: '#3498db' },
    };
    return statusMap[status] || { label: status || 'Inconnu', color: '#95a5a6' };
  };

  const fileLabels = {
    'piece_identite': "Pièce d'identité",
    'carte_service': 'Carte de service',
    'lettre_transfert': 'Lettre de transfert',
    'formulaire_transfert_signe': 'Formulaire Adhoc signé',
    'pv_origine': 'PV origine',
    'pv_accueil': 'PV accueil',
    'cadre_organique_accueil': 'Cadre organique',
    'attestation_effectifs_enseignants': 'Attestation enseignants',
    'attestation_effectifs_chercheurs': 'Attestation chercheurs',
    'preuve_paiement': 'Preuve de paiement Bancaire',
    'preuve_charge_horaire': 'Charge Horaire',
    'pv_attribution_charge': 'PV attribution',
  };

  // Descriptions de 58 à 60 caractères pour chaque document
  const fileDescriptions = {
    piece_identite: "Pièce d’identité valide (carte d’électeur, passeport, permis de conduire biométrique de la RDC) du requérant",
    carte_service: "Carte professionnelle valide délivrée par l'établissement d'origine.",
    lettre_transfert: "Lettre manuscrite motivant la demande de transfert d'établissement.",
    formulaire_transfert_signe: "Un formulaire ad hoc dûment rempli et signé par le requérant et les établissement/services spécialisés/centre ou institut de recherche scientifique de provenance et d’accueil, par lequel ces derniers marquent leur accord au transfert",
    pv_origine: "Procès-verbal de la réunion au cours de laquelle l’assentiment au transfert a été marqué par l’établissement/service spécialisé/centre ou institut de recherche scientifique d’origine",
    pv_accueil: "Procès-verbal de la réunion au cours de laquelle l’assentiment au transfert a été marqué par l’établissement/service spécialisé/centre ou institut de recherche scientifique d’accueil",
    cadre_organique_accueil: "Copie du cadre organique de l’établissement/service spécialisé/centre ou institut de recherche scientifique d’accueil, en cas d’existence d’un tel cadre.",
    attestation_effectifs_enseignants: "Attestation, par laquelle l’établissement/service spécialisé/centre ou institut de recherche scientifique d’accueil indique l’effectif total de son PATO et du PATO du service où il entend affecter le requérant.",
    attestation_effectifs_chercheurs: "Attestation officielle des effectifs chercheurs de l'établissement.",
    preuve_paiement: "La preuve du versement par le requérant de la somme équivalente à 50 USD (cinquante dollars américains), dans l’un des comptes bancaires du Ministère de l’Enseignement Supérieur, Universitaire, Recherche Scientifique et Innovations repris ci-dessous. La preuve de paiement doit impérativement porter le libellé « Paiement frais administratifs de transfert ».",
    preuve_charge_horaire: "Document prouvant la charge horaire de l'étudiant dans l'établissement.",
    pv_attribution_charge: "Procès-verbal d'attribution de charge d'enseignement ou de recherche.",
  };

  const getUploadedFiles = (transfert) => {
    return Object.entries(fileLabels).filter(([key]) => transfert[key]).map(([key, label]) => ({
      key,
      label,
      url: transfert[key],
      description: fileDescriptions[key]
    }));
  };

  const getProvinceDetails = (transfert) => {
    const provinceDetails = [];

    if (transfert.province_origine) {
      provinceDetails.push({
        key: 'origine',
        label: "Province d'origine",
        value: transfert.province_origine,
        description: "Nom de la province de l’établissement/service spécialisé/centre ou institut de recherche scientifique de provenance",
      });
    }

    if (transfert.province_accueil) {
      provinceDetails.push({
        key: 'accueil',
        label: "Province d'accueil",
        value: transfert.province_accueil,
        description: "Nom de la province de l’établissement/service spécialisé/centre ou institut de recherche scientifique d’accueil",
      });
    }

    return provinceDetails;
  };

  const handleDownloadFile = (fileUrl, fileName) => {
    if (!fileUrl) return;
    
    // Si c'est une URL complète, l'ouvrir directement
    if (fileUrl.startsWith('http')) {
      window.open(fileUrl, '_blank');
    } else {
      // Sinon, l'ouvrir comme un blob
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="transfert-list-container">
        <div className="loading">Chargement des transferts...</div>
      </div>
    );
  }

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
            <h1>Mes Demandes de Transfert</h1>
            <p className="subtitle">Consultez et gérez vos demandes de transfert</p>
          </div>

          <div className="header-right">
            <span className="user-info">{user?.nom} {user?.prenom}</span>
            <button className="guide-btn" onClick={onShowGuide}>
              Guide
            </button>
            <button className="logout-btn" onClick={onLogout}>
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="transfert-list-container">
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {transferts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FiFileText size={48} color="#007BFF" />
            </div>
            <h2>Aucune demande de transfert</h2>
            <p>Vous n'avez pas encore créé de demande de transfert.</p>
            <button className="primary-btn" onClick={onCreateNew}>
              Créer une demande de transfert
            </button>
          </div>
        ) : (
          <>
            <div className="transferts-header">
              <h2>Mes transferts ({transferts.length})</h2>
              <button className="primary-btn" onClick={onCreateNew}>
                + Nouvelle demande
              </button>
            </div>

            <div className="transferts-grid">
              {transferts.map((transfert, idx) => {
                const missingFiles = getMissingFiles(transfert);
                const statusInfo = getStatusLabel(transfert.status);
                const isIncomplete = missingFiles.length > 0;
                const uploadedFiles = getUploadedFiles(transfert);
                const provinceDetails = getProvinceDetails(transfert);
                const hasProvinceInfo = provinceDetails.length > 0;
                const transferNumber = String(idx + 1).padStart(2, '0');
                const emailValue = transfert.email || user?.email || '—';
                const phoneValue = transfert.telephone || user?.telephone || '—';
                const provinceSection = hasProvinceInfo ? (
                  <div className="card-section province-section">
                    <div className="section-title">
                      <span>Provinces concernées</span>
                      <span className="section-count">{provinceDetails.length}</span>
                    </div>
                    <div className="files-list province-list">
                      {provinceDetails.map((province) => (
                        <div key={province.key} className="file-item tooltip-container province-item">
                          <span className="file-label">{province.label}</span>
                          <span className="file-value">{province.value}</span>
                          <span className="tooltip-text">{province.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;

                return (
                  <div key={transfert.id} className="transfert-card">
                    <div className="card-header">
                      <div className="card-title">
                        <h3>
                          <span className="transfert-number">N° {transferNumber}</span> {transfert.nom} {transfert.prenom} {transfert.postnom}
                        </h3>
                        <span className="status-badge" style={{ backgroundColor: statusInfo.color }}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="card-section contact-section">
                        <div className="section-title">
                          <span>Coordonnées</span>
                        </div>
                        <div className="info-grid">
                          <div className="info-cell">
                            <span className="info-label">Email</span>
                            <span className="info-value">{emailValue}</span>
                          </div>
                          <div className="info-cell">
                            <span className="info-label">Téléphone</span>
                            <span className="info-value">{phoneValue}</span>
                          </div>
                        </div>
                      </div>

                      {isIncomplete && (
                        <div className="card-section alert-section">
                          <div className="warning-icon">⚠️</div>
                          <div>
                            <p className="missing-label">Documents manquants:</p>
                            <ul className="missing-list">
                              {missingFiles.slice(0, 3).map((file) => (
                                <li key={file}>{file.replace(/_/g, ' ')}</li>
                              ))}
                              {missingFiles.length > 3 && (
                                <li>...et {missingFiles.length - 3} autres</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      )}

                      {uploadedFiles.length > 0 && (
                        <>
                          <div className="card-section uploaded-files-section">
                            <div className="section-title">
                              <span>Fichiers uploadés</span>
                              <span className="section-count">{uploadedFiles.length}</span>
                            </div>
                            <div className="files-list">
                              {uploadedFiles.map((file) => (
                                <div key={file.key} className="file-item tooltip-container">
                                  <button
                                    className="download-btn"
                                    onClick={() => handleDownloadFile(file.url, file.label)}
                                    title="Télécharger ou ouvrir le fichier"
                                  >
                                    <FiDownload size={16} />
                                  </button>
                                  <span className="file-label">{file.label}</span>
                                  <span className="tooltip-text">{file.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          {provinceSection}
                        </>
                      )}

                      {!uploadedFiles.length && provinceSection}
                    </div>

                    <div className="card-actions">
                      {isIncomplete ? (
                        <button
                          className="secondary-btn"
                          onClick={() => onEditTransfert(transfert.id, transfert)}
                        >
                          Compléter le dossier
                        </button>
                      ) : (
                        <button
                          className="secondary-btn"
                          onClick={() => onEditTransfert(transfert.id, transfert)}
                        >
                          Voir les détails
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default TransfertList;
