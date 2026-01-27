import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';
import './TransfertForm.css';
import { extractOwnerId } from './utils/auth';

const TransfertForm = ({ user, token, onLogout, editingTransfert, onBackToList }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    postnom: '',
    telephone: '',
    email: '',
    province_origine: '',
    province_accueil: '',
  });

  // Liste des provinces de la RDC (pour react-select)
  const provincesRDC = [
    'Bas-Uele', 'Haut-Uele', 'Ituri', 'Tshopo', 'Haut-Lomami', 'Lomami',
    'Kasaï-Oriental', 'Kasaï', 'Kasaï-Central', 'Sankuru', 'Maniema',
    'Sud-Kivu', 'Nord-Kivu', 'Mongala', 'Nord-Ubangi', 'Sud-Ubangi',
    'Équateur', 'Tshuapa', 'Mai-Ndombe', 'Kwilu', 'Kwango', 'Kinshasa',
    'Kongo-Central', 'Haut-Katanga', 'Lualaba', 'Tanganyika', 'Haut-Lomami'
  ].map(p => ({ value: p, label: p }));

  // Pré-remplir les données personnelles avec les infos de l'utilisateur connecté
  useEffect(() => {
    if (editingTransfert?.data) {
      // Mode édition - pré-remplir avec les données existantes
      setFormData(prev => ({
        ...prev,
        nom: editingTransfert.data.nom || '',
        prenom: editingTransfert.data.prenom || '',
        postnom: editingTransfert.data.postnom || '',
        telephone: editingTransfert.data.telephone || '',
        email: editingTransfert.data.email || '',
        province_origine: editingTransfert.data.province_origine || '',
        province_accueil: editingTransfert.data.province_accueil || '',
      }));

      // Marquer les fichiers existants comme complétés
      const fileKeys = [
        'piece_identite', 'carte_service', 'lettre_transfert', 'formulaire_transfert_signe',
        'pv_origine', 'pv_accueil', 'cadre_organique_accueil',
        'attestation_effectifs_enseignants', 'attestation_effectifs_chercheurs',
        'preuve_paiement', 'preuve_charge_horaire', 'pv_attribution_charge'
      ];
      const existing = {};
      fileKeys.forEach(key => {
        existing[key] = !!editingTransfert.data[key];
      });
      setExistingFiles(existing);
    } else if (user) {
      // Mode création - pré-remplir avec les infos de l'utilisateur
      setFormData(prev => ({
        ...prev,
        nom: user.nom || '',
        prenom: user.prenom || '',
        telephone: user.telephone || '',
        email: user.email || '',
        province_origine: '',
        province_accueil: '',
      }));
    }
  }, [user, editingTransfert]);

  const [files, setFiles] = useState({
    piece_identite: null,
    carte_service: null,
    lettre_transfert: null,
    formulaire_transfert_signe: null,
    pv_origine: null,
    pv_accueil: null,
    cadre_organique_accueil: null,
    attestation_effectifs_enseignants: null,
    attestation_effectifs_chercheurs: null,
    preuve_paiement: null,
    preuve_charge_horaire: null,
    pv_attribution_charge: null,
  });

  const [existingFiles, setExistingFiles] = useState({
    piece_identite: false,
    carte_service: false,
    lettre_transfert: false,
    formulaire_transfert_signe: false,
    pv_origine: false,
    pv_accueil: false,
    cadre_organique_accueil: false,
    attestation_effectifs_enseignants: false,
    attestation_effectifs_chercheurs: false,
    preuve_paiement: false,
    preuve_charge_horaire: false,
    pv_attribution_charge: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Pour react-select (provinces)
  const handleProvinceChange = (selected, { name }) => {
    setFormData(prev => ({
      ...prev,
      [name]: selected ? selected.value : ''
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];
      const maxSize = 10 * 1024 * 1024; // 10 MB in bytes

      if (file.size > maxSize) {
        setMessage({
          type: 'error',
          text: `Le fichier "${file.name}" dépasse la taille maximale de 10 MB.`
        });
        e.target.value = ''; // Reset the input
        return;
      }

      setMessage({ type: '', text: '' }); // Clear any previous error
      setFiles(prev => ({
        ...prev,
        [name]: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // // Validation
    // Prepare FormData for upload
    const formDataToSend = new FormData();
    // Append text fields
    formDataToSend.append('nom', formData.nom);
    formDataToSend.append('prenom', formData.prenom);
    formDataToSend.append('postnom', formData.postnom);
    formDataToSend.append('telephone', formData.telephone);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('province_origine', formData.province_origine);
    formDataToSend.append('province_accueil', formData.province_accueil);

    // Append files
    Object.keys(files).forEach(key => {
      if (files[key]) {
        formDataToSend.append(key, files[key]);
      }
    });

    try {
      const ownerId = extractOwnerId(user);
      if (!ownerId) {
        setMessage({
          type: 'error',
          text: 'Identifiant utilisateur introuvable.',
        });
        setLoading(false);
        return;
      }

      // Déterminer l'ID du transfert pour la mise à jour partielle
      const transferIdCandidates = [
        editingTransfert?.id,
        editingTransfert?.data?.id,
        editingTransfert?.data?.pk,
        editingTransfert?.data?.transfert_id,
        editingTransfert?.data?.id_transfert,
      ];

      const transferId = transferIdCandidates.find(v => v !== undefined && v !== null && String(v).trim() !== '');

      let url;
      let method = 'POST';

      if (transferId) {
        // PATCH existing transfert using the required update route with user id and transfert id
        url = `https://admin.cgiibnn-esursi.cd/api/candidat/transfert/update/${ownerId}/${transferId}/`;
        method = 'PATCH';
      } else {
        // Create new transfert for current user
        url = `https://admin.cgiibnn-esursi.cd/api/candidat/transfert/create/${ownerId}/`;
        method = 'POST';
      }

      // Debug logs to help server-side troubleshooting
      console.log('Submitting transfert', { method, url, ownerId, transferId });

      const response = await fetch(url, {
        method: method,
        body: formDataToSend,
      });

      if (response.ok) {
        await response.json();
        setShowSuccessModal(true);
        // Reset form
        resetForm();
        // Reset file inputs
        e.target.reset();
      } else {
        let errorMessage = 'Une erreur est survenue';
        try {
          const error = await response.json();
          errorMessage = error.message || error.detail || JSON.stringify(error);
        } catch (e) {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        setMessage({ 
          type: 'error', 
          text: `Erreur: ${errorMessage}` 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Erreur de connexion: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (user) {
      setFormData({ 
        nom: user.nom || '', 
        prenom: user.prenom || '', 
        postnom: '',
        telephone: user.telephone || '', 
        email: user.email || '' 
      });
    } else {
      setFormData({ nom: '', prenom: '', postnom: '', telephone: '', email: '' });
    }
    setFiles({
      piece_identite: null,
      carte_service: null,
      lettre_transfert: null,
      formulaire_transfert_signe: null,
      pv_origine: null,
      pv_accueil: null,
      cadre_organique_accueil: null,
      attestation_effectifs_enseignants: null,
      attestation_effectifs_chercheurs: null,
      preuve_paiement: null,
      preuve_charge_horaire: null,
      pv_attribution_charge: null,
    });
  };

  const handleReset = () => {
    resetForm();
    setMessage({ type: '', text: '' });
    document.querySelector('form').reset();
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    onBackToList();
  };

  const fileLabels = {
    piece_identite: "Pièce d'identité",
    carte_service: "Carte de service",
    lettre_transfert: "Lettre de demande de transfert",
    formulaire_transfert_signe: "Formulaire Ad-Hoc signé par l’ etablissement d’origine et d’accueil",
    pv_origine: "PV de l'établissement d'origine (transfert sortant)",
    pv_accueil: "PV de l'établissement d'accueil (transfert entrant)",
    cadre_organique_accueil: "Cadre organique de l'établissement | Institutions | centre d'accueil",
    attestation_effectifs_enseignants: "Attestation des effectifs enseignants et étudiants",
    attestation_effectifs_chercheurs: "Attestation des effectifs chercheurs",
    preuve_paiement: "Preuve de paiement Banquaire",
    preuve_charge_horaire: "Charge horaire",
    pv_attribution_charge: "PV de réunion d'attribution de charge",
  };

  // Descriptions de 58 à 60 caractères pour chaque document
  const fileDescriptions = {
    piece_identite: "Pièce d’identité valide (carte d’électeur, passeport, permis de conduire biométrique de la RDC) du requérant",
    carte_service: "Copie recto-verso de la carte de service du requérant ou toute autre preuve d’appartenance au personnel à l’établissement/service spécialisé/centre ou institut de recherche scientifique de provenance",
    lettre_transfert: "Lettre de demande de transfert (contenant l’identité, le grade, la fonction et le numéro matricule du requérant), justifiant, de manière claire, la nécessité du transfert dans l’intérêt du service",
    formulaire_transfert_signe: "Formulaire ad-Hoc signé par l’ etablissement d’origine et d’accueil.",
    pv_origine: "Procès-verbal du conseil de l'établissement d'origine validant le transfert.",
    pv_accueil: "Procès-verbal du conseil de l'établissement d'accueil acceptant le transfert.",
    cadre_organique_accueil: "Document attestant la capacité d'accueil de l'établissement, Institution ou centre.",
    attestation_effectifs_enseignants: "Attestation officielle des effectifs enseignants et étudiants actuels.",
    attestation_effectifs_chercheurs: "Attestation officielle des effectifs chercheurs de l'établissement.",
    preuve_paiement: "Justificatif du paiement banquaire des frais liés à la demande.",
    preuve_charge_horaire: "Document prouvant la disponibilité d'une charge horaire disponible dans l'établissement d'accueil.",
    pv_attribution_charge: "Procès-verbal d'attribution de charge d'enseignement ou de recherche.",
  };

  // Calculer le pourcentage de complétion
  const calculateCompletionPercentage = () => {
    const totalFiles = Object.keys(files).length;
    const completedFiles = Object.keys(files).filter(key => files[key] || existingFiles[key]).length;
    return Math.round((completedFiles / totalFiles) * 100);
  };

  const completionPercentage = editingTransfert ? calculateCompletionPercentage() : 0;

  const getFileStatus = (fileKey) => {
    // Un fichier est considéré comme complété s'il existe localement OU sur le serveur
    if (files[fileKey] || existingFiles[fileKey]) {
      return { status: 'completed', color: '#27ae60', icon: <FiCheck /> };
    }
    return { status: 'missing', color: '#e74c3c', icon: <FiX /> };
  };

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
            <h1>{editingTransfert ? 'Compléter le dossier' : 'Créer une demande de transfert'}</h1>
            <p className="subtitle">
              Documents requis pour solliciter un transfert autre que d'office
            </p>
          </div>
          
          <div className="header-right">
            <span className="user-info">{user?.nom} {user?.prenom}</span>
            <button className="guide-btn" onClick={onBackToList}>
              ← Retour à la liste
            </button>
            <button className="logout-btn" onClick={onLogout}>
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="transfert-form-container">
        {editingTransfert && (
          <div className="completion-progress-section">
            <div className="progress-header">
              <h3>Progression du dossier</h3>
              <span className="completion-percentage">{completionPercentage}%</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ 
                  width: `${completionPercentage}%`,
                  backgroundColor: completionPercentage === 100 ? '#27ae60' : '#f39c12'
                }}
              />
            </div>
            <p className="progress-text">
              {completionPercentage === 100 
                ? 'Tous les documents sont complétés!' 
                : `${Object.keys(files).length - Object.keys(files).filter(key => files[key]).length} document(s) manquant(s)`}
            </p>
          </div>
        )}

        {showSuccessModal && (
          <div className="modal-overlay" onClick={closeSuccessModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <FiCheckCircle size={32} color="white" />
            </div>
              <h2>Succès!</h2>
              <p>Votre demande de transfert a été soumise avec succès.</p>
              <button className="modal-btn" onClick={closeSuccessModal}>
                Fermer
              </button>
            </div>
          </div>
        )}

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="transfert-form">
        <div className="form-section">
          <h2>Documents {editingTransfert ? '(optionnels)' : 'requis'}</h2>
          {Object.keys(files).map((fileKey, idx, arr) => {
            const fileStatus = getFileStatus(fileKey);
            const isExisting = existingFiles[fileKey];
            const isLast = idx === arr.length - 1;
            return (
              <React.Fragment key={fileKey}>
                <div className={`form-group document-with-status`}>
                  <div className="tooltip-container">
                    <label htmlFor={fileKey}>
                      {fileLabels[fileKey]} {!isExisting && !editingTransfert && '*'}
                      {isExisting && <span className="existing-badge">Complété</span>}
                    </label>
                    <span className="tooltip-text">{fileDescriptions[fileKey]}</span>
                  </div>
                  <input
                    type="file"
                    id={fileKey}
                    name={fileKey}
                    onChange={handleFileChange}
                    accept={fileKey === 'piece_identite' ? '.png,.jpg,.jpeg,.pdf,.docx' : '.pdf,.jpg,.jpeg,.png'}
                    className={files[fileKey] ? 'file-uploaded' : (isExisting ? 'file-existing' : 'file-missing')}
                    disabled={isExisting && !files[fileKey] && !editingTransfert}
                  />
                  <div className={`document-status-badge ${fileStatus.status}`}>
                    {fileStatus.icon}
                  </div>
                  {files[fileKey] && (
                    <span className="file-name">
                      {files[fileKey].name}
                    </span>
                  )}
                  {isExisting && !files[fileKey] && (
                    <span className="file-name existing">
                      Fichier existant (optionnel de remplacer)
                    </span>
                  )}
                </div>
                {isLast && (
                  <div className="provinces-columns-form">
                    <div className="form-group">
                      <div className="tooltip-container">
                        <label htmlFor="province_origine">Province d'origine *</label>
                        <span className="tooltip-text">Province de l’Etablissement | Service Spécial | Centre de Recherche d’origine</span>
                      </div>
                      <Select
                        inputId="province_origine"
                        name="province_origine"
                        options={provincesRDC}
                        value={provincesRDC.find(opt => opt.value === formData.province_origine) || null}
                        onChange={handleProvinceChange}
                        placeholder="Sélectionnez la province d'origine"
                        isClearable
                        isSearchable
                        required
                      />
                    </div>
                    <div className="form-group">
                      <div className="tooltip-container">
                        <label htmlFor="province_accueil">Province d'accueil *</label>
                        <span className="tooltip-text">Province de l’Etablissement | Service Spécial | Centre de Recherche accueil</span>
                      </div>
                      <Select
                        inputId="province_accueil"
                        name="province_accueil"
                        options={provincesRDC}
                        value={provincesRDC.find(opt => opt.value === formData.province_accueil) || null}
                        onChange={handleProvinceChange}
                        placeholder="Sélectionnez la province d'accueil"
                        isClearable
                        isSearchable
                        required
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : (editingTransfert ? 'Mettre à jour' : 'Soumettre la demande')}
          </button>
          <button 
            type="button" 
            className="reset-btn"
            onClick={editingTransfert ? onBackToList : handleReset}
            disabled={loading}
          >
            {editingTransfert ? 'Annuler' : 'Réinitialiser'}
          </button>
        </div>
      </form>
    </div>
    </>
  );
};

export default TransfertForm;
