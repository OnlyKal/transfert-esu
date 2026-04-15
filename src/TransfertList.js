import React, { useState, useEffect, useCallback } from 'react';
import { FiFileText, FiDownload, FiMail, FiPhone, FiAlertTriangle, FiPaperclip, FiMap, FiPlus, FiX, FiClipboard } from 'react-icons/fi';
import './TransfertList.css';
import { extractOwnerId } from './utils/auth';

const TransfertList = ({ user, token, onLogout, onCreateNew, onEditTransfert, onShowGuide }) => {
  const [transferts, setTransferts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedTransfert, setSelectedTransfert] = useState(null);
  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [officeNumero, setOfficeNumero] = useState('');
  const [loadingOffice, setLoadingOffice] = useState(false);
  const [officeData, setOfficeData] = useState(null);

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
    let requiredFiles = [
      'piece_identite',
      'carte_service',
      'lettre_transfert',
      'formulaire_transfert_signe',
      'pv_origine',
      'pv_accueil',
      'cadre_organique_accueil',
      'attestation_effectifs_enseignants',
      // 'preuve_paiement',
      'preuve_charge_horaire',
      'pv_attribution_charge',
      'acte_nomination',
      'acte_affectation',
    ];

    // Exclure les fichiers non nécessaires selon le type
    if (transfert.form_type === 'enseignants') {
      requiredFiles = requiredFiles.filter(file => file !== 'attestation_effectifs_chercheurs');
    }

    if (transfert.form_type === 'chercheurs') {
      requiredFiles = requiredFiles.filter(file => file !== 'attestation_effectifs_chercheurs');
    }

    if (transfert.form_type === 'pato') {
      requiredFiles = requiredFiles.filter(file => file !== 'attestation_effectifs_chercheurs' && file !== 'preuve_charge_horaire' && file !== 'pv_attribution_charge');
    }

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
    'formulaire_transfert_signe': 'Formulaire Ad-Hoc signé',
    'pv_origine': 'PV de provenance',
    'pv_accueil': 'PV accueil',
    'cadre_organique_accueil': 'Cadre organique',
    'attestation_effectifs_enseignants': 'Attestation enseignants',
    // 'preuve_paiement': 'Preuve de paiement Bancaire',
    'preuve_charge_horaire': 'Charge Horaire',
    'pv_attribution_charge': 'PV attribution',
    'acte_nomination': 'Acte de nomination',
    'acte_affectation': "Acte d'affectation",
    'attestation_pato': 'Attestation PATO',
  };

  // Descriptions de 58 à 60 caractères pour chaque document
  const fileDescriptions = {
    piece_identite: "Pièce d’identité valide (carte d’électeur, passeport, permis de conduire biométrique de la RDC) du requérant",
    carte_service: "Carte professionnelle valide délivrée par l'établissement de provenance.",
    lettre_transfert: "Lettre manuscrite motivant la demande de transfert d'établissement.",
    formulaire_transfert_signe: "Un formulaire Ad-Hoc dûment rempli et signé par le requérant et les établissement/services spécialisés/centre ou institut de recherche scientifique de provenance et d’accueil, par lequel ces derniers marquent leur accord au transfert",
    pv_origine: "Procès-verbal de la réunion au cours de laquelle l’assentiment au transfert a été marqué par l’établissement/service spécialisé/centre ou institut de recherche scientifique d’origine",
    pv_accueil: "Procès-verbal de la réunion au cours de laquelle l’assentiment au transfert a été marqué par l’établissement/service spécialisé/centre ou institut de recherche scientifique d’accueil",
    cadre_organique_accueil: "Copie du cadre organique de l’établissement/service spécialisé/centre ou institut de recherche scientifique d’accueil, en cas d’existence d’un tel cadre.",
    attestation_effectifs_enseignants: "Attestation, par laquelle l’établissement/service spécialisé/centre ou institut de recherche scientifique d’accueil indique l’effectif total de son PATO et du PATO du service où il entend affecter le requérant.",

    // preuve_paiement: "La preuve du versement par le requérant de la somme équivalente à 50 USD (cinquante dollars américains), dans l'un des comptes bancaires du Ministère de l'Enseignement Supérieur, Universitaire, Recherche Scientifique et Innovations repris ci-dessous. La preuve de paiement doit impérativement porter le libellé « Paiement frais administratifs de transfert ».",
    preuve_charge_horaire: "Document prouvant la charge horaire de l'étudiant dans l'établissement.",
    pv_attribution_charge: "Procès-verbal d'attribution de charge d'enseignement ou de recherche.",
    acte_nomination: "Document officiel attestant la nomination du requérant à son poste actuel.",
    acte_affectation: "Document officiel attestant l'affectation du requérant à son établissement actuel.",
    attestation_pato: "Attestation du personnel administratif, technique et ouvrier (optionnel).",
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
        label: "Province de provenance",
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

  const fetchOfficeTransfert = async (numeroSaisie) => {
    if (!numeroSaisie.trim()) {
      setMessage({
        type: 'error',
        text: 'Veuillez saisir un numéro de demande valide.',
      });
      return;
    }

    setLoadingOffice(true);
    try {
      const response = await fetch(
        `https://admin.cgiibnn-esursi.cd/api/candidat/transfert-office/${numeroSaisie.toUpperCase()}/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOfficeData(data);
      } else {
        let errorMessage = 'Transfert d\'office non trouvé';
        try {
          const error = await response.json();
          errorMessage = error.message || error.detail || errorMessage;
        } catch (e) {
          // Ignorer si le body n'est pas JSON
        }
        setMessage({
          type: 'error',
          text: `Erreur: ${errorMessage}`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Erreur réseau: ${error.message}`,
      });
    } finally {
      setLoadingOffice(false);
    }
  };

  const handleOfficeSubmit = () => {
    fetchOfficeTransfert(officeNumero);
  };

  const handleCloseOfficeModal = () => {
    setShowOfficeModal(false);
    setOfficeData(null);
    setOfficeNumero('');
  };

  const handleEditOfficeTransfert = () => {
    if (officeData) {
      onEditTransfert(officeData.numero_demande, {
        ...officeData,
        form_type: 'conjoint',
        is_office_transfer: true
      });
    }
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
            <h1>Mes demandes de transfert</h1>
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
              <div className="header-left">
                <h2>Mes transferts</h2>
                <span className="transferts-count">{transferts.length}</span>
              </div>
              <div className="header-buttons">
                <button className="primary-btn office-btn" onClick={() => setShowOfficeModal(true)}>
                  <FiClipboard size={18} /> Transfert d'office
                </button>
                <button className="primary-btn" onClick={onCreateNew}>
                  <FiPlus size={18} /> Nouvelle demande
                </button>
              </div>
            </div>

            <div className="transferts-layout">
              <div className="transferts-list-column">
                {transferts.map((transfert, idx) => {
                  const missingFiles = getMissingFiles(transfert);
                  const statusInfo = getStatusLabel(transfert.status);
                  const isIncomplete = missingFiles.length > 0;
                  const transferNumber = String(idx + 1).padStart(2, '0');
                  const isSelected = selectedTransfert?.id === transfert.id;

                  return (
                    <div 
                      key={transfert.id} 
                      className={`transfert-list-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedTransfert(transfert)}
                    >
                      <div className="list-item-number">{transferNumber}</div>
                      <div className="list-item-content">
                        <div className="list-item-name">
                          {transfert.nom} {transfert.prenom}
                        </div>
                        <div className="list-item-meta">
                          <span className="status-badge-small" style={{ backgroundColor: statusInfo.color }}>
                            {statusInfo.label}
                          </span>
                          {isIncomplete && (
                            <span className="list-item-incomplete">
                              <span className="warning-dot">●</span> {missingFiles.length} manquant(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="transfert-details-column">
                {selectedTransfert ? (
                  (() => {
                    const missingFiles = getMissingFiles(selectedTransfert);
                    const statusInfo = getStatusLabel(selectedTransfert.status);
                    const isIncomplete = missingFiles.length > 0;
                    const uploadedFiles = getUploadedFiles(selectedTransfert);
                    const provinceDetails = getProvinceDetails(selectedTransfert);
                    const hasProvinceInfo = provinceDetails.length > 0;
                    const transferNumber = String(transferts.findIndex(t => t.id === selectedTransfert.id) + 1).padStart(2, '0');
                    const emailValue = selectedTransfert.email || user?.email || '—';
                    const phoneValue = selectedTransfert.telephone || user?.telephone || '—';

                    return (
                      <div className="transfert-details">
                        <div className="details-header">
                          <div className="details-header-top">
                            <div className="details-number">N° {transferNumber}</div>
                            <span className="status-badge" style={{ backgroundColor: statusInfo.color }}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <h3 className="details-name">
                            {selectedTransfert.nom} {selectedTransfert.prenom} {selectedTransfert.postnom}
                          </h3>
                          <div className="details-contact">
                            <div className="contact-item">
                              <FiMail className="contact-icon" size={18} />
                              <span>{emailValue}</span>
                            </div>
                            <div className="contact-item">
                              <FiPhone className="contact-icon" size={18} />
                              <span>{phoneValue}</span>
                            </div>
                          </div>
                        </div>

                        <div className="details-body">
                          <div className="details-grid">
                            {isIncomplete && (
                              <div className="details-card alert-card">
                                <div className="card-icon warning-icon">
                                  <FiAlertTriangle size={24} />
                                </div>
                                <div className="card-content">
                                  <h4 className="card-title">Documents manquants</h4>
                                  <div className="missing-chips">
                                    {missingFiles.map((file) => (
                                      <span key={file} className="missing-chip">
                                        {fileLabels[file] || file.replace(/_/g, ' ')}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {uploadedFiles.length > 0 && (
                              <div className="details-card files-card">
                                <div className="card-icon files-icon">
                                  <FiPaperclip size={24} />
                                </div>
                                <div className="card-content">
                                  <h4 className="card-title">
                                    Fichiers uploadés <span className="badge-count">{uploadedFiles.length}</span>
                                  </h4>
                                  <div className="files-compact-list">
                                    {uploadedFiles.map((file) => (
                                      <div key={file.key} className="file-compact-item">
                                        <span className="file-compact-label">{file.label}</span>
                                        <button
                                          className="download-icon-btn"
                                          onClick={() => handleDownloadFile(file.url, file.label)}
                                          title="Télécharger"
                                        >
                                          <FiDownload size={14} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {hasProvinceInfo && (
                              <div className="details-card province-card">
                                <div className="card-icon province-icon">
                                  <FiMap size={24} />
                                </div>
                                <div className="card-content">
                                  <h4 className="card-title">
                                    Provinces <span className="badge-count">{provinceDetails.length}</span>
                                  </h4>
                                  <div className="province-chips">
                                    {provinceDetails.map((province) => (
                                      <span key={province.key} className="province-chip">
                                        <strong>{province.label}:</strong> {province.value}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="details-actions">
                          {isIncomplete ? (
                            <button
                              className="secondary-btn complete-btn"
                              onClick={() => onEditTransfert(selectedTransfert.id, selectedTransfert)}
                            >
                              Compléter le dossier
                            </button>
                          ) : (
                            <button
                              className="secondary-btn"
                              onClick={() => onEditTransfert(selectedTransfert.id, selectedTransfert)}
                            >
                              Modifier
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="no-selection">
                    <FiFileText size={48} color="#ccc" />
                    <p>Sélectionnez un transfert pour voir les détails</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {showOfficeModal && (
          <div className="modal-overlay" onClick={handleCloseOfficeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{officeData ? 'Détails du transfert d\'office' : 'Transfert d\'office'}</h2>
                <button 
                  className="modal-close-btn" 
                  onClick={handleCloseOfficeModal}
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="modal-body">
                {!officeData ? (
                  <>
                    <p className="modal-description">
                      Veuillez saisir votre numéro de demande de transfert d'office (ex: TXXXXXXXXXX)
                    </p>
                    
                    <div className="modal-form-group">
                      <label htmlFor="office-numero">Numéro de demande *</label>
                      <input
                        type="text"
                        id="office-numero"
                        placeholder="TXXXXXXXXXX"
                        value={officeNumero}
                        onChange={(e) => setOfficeNumero(e.target.value.toUpperCase())}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleOfficeSubmit();
                          }
                        }}
                        disabled={loadingOffice}
                      />
                    </div>
                  </>
                ) : (
                  <div className="office-results">
                    <div className="result-section">
                      <h3>Informations de la demande</h3>
                      <div className="result-grid">
                        <div className="result-item">
                          <span className="result-label">Numéro de demande:</span>
                          <span className="result-value">{officeData.numero_demande}</span>
                        </div>
                        <div className="result-item">
                          <span className="result-label">Matricule:</span>
                          <span className="result-value">{officeData.matricule}</span>
                        </div>
                        <div className="result-item">
                          <span className="result-label">Email:</span>
                          <span className="result-value">{officeData.email}</span>
                        </div>
                        <div className="result-item">
                          <span className="result-label">Téléphone:</span>
                          <span className="result-value">{officeData.telephone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="result-section">
                      <h3>Statut</h3>
                      <div className="result-status">
                        <span className="status-badge" style={{ backgroundColor: getStatusLabel(officeData.statut).color }}>
                          {officeData.statut_display || getStatusLabel(officeData.statut).label}
                        </span>
                      </div>
                    </div>

                    {officeData.commentaires && (
                      <div className="result-section">
                        <h3>Commentaires</h3>
                        <p className="result-comments">{officeData.commentaires}</p>
                      </div>
                    )}

                    <div className="result-section">
                      <h3>Documents</h3>
                      <div className="result-files">
                        {Object.entries({
                          piece_identite: 'Pièce d\'identité',
                          carte_service: 'Carte de service',
                          acte_affectation: 'Acte d\'affectation',
                          acte_nomination: 'Acte de nomination',
                          acte_mariage: 'Acte de mariage',
                          preuve_emploi: 'Preuve d\'emploi',
                          coordonnees_etablissement_transfert: 'Coordonnées établissement',
                          preuve_nouvelle_residence: 'Preuve nouvelle résidence',
                          preuve_activite_ou_traitement: 'Preuve activité/traitement'
                        }).map(([key, label]) => (
                          <div key={key} className="file-result-item">
                            <span className={officeData[key] ? 'file-ok' : 'file-missing'}>
                              {officeData[key] ? '✓' : '✗'} {label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button 
                  className="secondary-btn" 
                  onClick={handleCloseOfficeModal}
                  disabled={loadingOffice}
                >
                  {officeData ? 'Fermer' : 'Annuler'}
                </button>
                {!officeData ? (
                  <button 
                    className="primary-btn" 
                    onClick={handleOfficeSubmit}
                    disabled={loadingOffice || !officeNumero.trim()}
                  >
                    {loadingOffice ? 'Chargement...' : 'Continuer'}
                  </button>
                ) : (
                  <button 
                    className="primary-btn" 
                    onClick={handleEditOfficeTransfert}
                  >
                    Modifier le dossier
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TransfertList;
