import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';
import './TransfertForm.css';
import { extractOwnerId } from './utils/auth';

const TransfertForm = ({ user, token, onLogout, editingTransfert, onBackToList }) => {
  const formRef = useRef(null);
  const [formType, setFormType] = useState(editingTransfert ? null : (editingTransfert?.data?.form_type || null));
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    postnom: '',
    telephone: '',
    email: '',
    province_origine: '',
    province_accueil: '',
    matricule: '',
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
        matricule: editingTransfert.data.matricule || '',
      }));

      // Marquer les fichiers existants comme complétés
      const fileKeys = [
        'piece_identite', 'carte_service', 'lettre_transfert', 'formulaire_transfert_signe',
        'pv_origine', 'pv_accueil', 'cadre_organique_accueil',
        'attestation_effectifs_enseignants', 'attestation_effectifs_chercheurs',
        // 'preuve_paiement',
        'preuve_charge_horaire', 'pv_attribution_charge',
        'acte_nomination', 'acte_affectation', 'attestation_pato'
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
        postnom: user.postnom || '',
        telephone: user.telephone || '',
        email: user.email || '',
        province_origine: '',
        province_accueil: '',
        matricule: '',
      }));
    }
  }, [user, editingTransfert]);

  const getInitialFiles = () => {
    if (formType === 'conjoint') {
      return {
        piece_identite: null,
        carte_service: null,
        acte_affectation: null,
        acte_nomination: null,
        acte_mariage: null,
        preuve_emploi: null,
        coordonnees_etablissement_transfert: null,
        preuve_nouvelle_residence: null,
        preuve_activite_ou_traitement: null,
      };
    }

    const baseFiles = {
      piece_identite: null,
      carte_service: null,
      acte_nomination: null,
      acte_affectation: null,
      lettre_transfert: null,
      formulaire_transfert_signe: null,
      pv_origine: null,
      pv_accueil: null,
      cadre_organique_accueil: null,
      attestation_effectifs_enseignants: null,
      attestation_effectifs_chercheurs: null,
      // preuve_paiement: null,
      preuve_charge_horaire: null,
      pv_attribution_charge: null,
    };

    if (formType === 'chercheurs') {
      delete baseFiles.attestation_effectifs_chercheurs;
    }

    if (formType === 'enseignants') {
      delete baseFiles.attestation_effectifs_chercheurs;
    }

    if (formType === 'pato') {
      delete baseFiles.attestation_effectifs_chercheurs;
    }
    
    if (formType === 'pato') {
      delete baseFiles.preuve_charge_horaire;
      delete baseFiles.pv_attribution_charge;
    }
    
    return baseFiles;
  };

  const [files, setFiles] = useState(getInitialFiles());

  const getInitialExistingFiles = () => {
    if (formType === 'conjoint') {
      const baseFiles = {
        piece_identite: false,
        carte_service: false,
        acte_affectation: false,
        acte_nomination: false,
        acte_mariage: false,
        preuve_emploi: false,
        coordonnees_etablissement_transfert: false,
        preuve_nouvelle_residence: false,
        preuve_activite_ou_traitement: false,
      };
      
      if (editingTransfert?.data) {
        Object.keys(baseFiles).forEach((key) => {
          baseFiles[key] = !!editingTransfert.data[key];
        });
      }
      
      return baseFiles;
    }

    const baseFiles = {
      piece_identite: false,
      carte_service: false,
      acte_nomination: false,
      acte_affectation: false,
      lettre_transfert: false,
      formulaire_transfert_signe: false,
      pv_origine: false,
      pv_accueil: false,
      cadre_organique_accueil: false,
      attestation_effectifs_enseignants: false,
      attestation_effectifs_chercheurs: false,
      // preuve_paiement: false,
      preuve_charge_horaire: false,
      pv_attribution_charge: false,
    };

    if (formType === 'chercheurs') {
      delete baseFiles.attestation_effectifs_chercheurs;
    }

    if (formType === 'enseignants') {
      delete baseFiles.attestation_effectifs_chercheurs;
    }

    if (formType === 'pato') {
      delete baseFiles.attestation_effectifs_chercheurs;
    }
    
    if (formType === 'pato') {
      delete baseFiles.preuve_charge_horaire;
      delete baseFiles.pv_attribution_charge;
    }

    if (editingTransfert?.data) {
      Object.keys(baseFiles).forEach((key) => {
        baseFiles[key] = !!editingTransfert.data[key];
      });
    }
    
    return baseFiles;
  };

  const [existingFiles, setExistingFiles] = useState(getInitialExistingFiles());

  // Mettre à jour les fichiers quand le type change
  useEffect(() => {
    if (formType) {
      // Vérifier si des fichiers ont été sélectionnés
      const hasSelectedFiles = Object.values(files).some(file => file !== null);
      
      if (hasSelectedFiles && !editingTransfert) {
        const confirmChange = window.confirm(
          'Changer le type de formulaire réinitialisera tous les fichiers sélectionnés. Continuer ?'
        );
        
        if (!confirmChange) {
          return;
        }
      }
      
      setFiles(getInitialFiles());
      setExistingFiles(getInitialExistingFiles());
    }
  }, [formType]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({ completed: [], missing: [] });

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

  const submitTransfert = async () => {
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
    
    // Only append provinces for non-conjoint transfers
    if (formType !== 'conjoint') {
      formDataToSend.append('province_origine', formData.province_origine);
      formDataToSend.append('province_accueil', formData.province_accueil);
    }
    
    formDataToSend.append('form_type', formType);
    formDataToSend.append('matricule', formData.matricule);

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

      if (formType === 'conjoint') {
        // For conjoint type, use the transfert-office endpoint
        url = `https://admin.cgiibnn-esursi.cd/api/candidat/transfert-office/`;
        method = 'POST';
      } else if (transferId) {
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
        formRef.current?.reset();
      } else {
        let errorMessage = 'Une erreur est survenue';
        try {
          const error = await response.json();
          // Extraire le texte de l'erreur sans formatage JSON
          if (typeof error === 'string') {
            errorMessage = error;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.detail) {
            errorMessage = error.detail;
          } else if (error.error) {
            errorMessage = error.error;
          } else {
            // Si c'est un objet, extraire les valeurs textuelles
            const values = Object.values(error);
            if (values.length > 0) {
              errorMessage = Array.isArray(values[0]) ? values[0][0] : values[0];
            }
          }
          // Nettoyer les caractères JSON restants
          errorMessage = String(errorMessage).replace(/[\[\]{}\"]/g, '').trim();
        } catch (e) {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        setMessage({ 
          type: 'error', 
          text: errorMessage
        });
      }
    } catch (error) {
      const errorText = error.message || 'Erreur de connexion au serveur';
      setMessage({ 
        type: 'error', 
        text: errorText
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) {
      return;
    }
    setReviewSummary(buildSubmissionSummary());
    setShowReviewModal(true);
  };

  const handleConfirmSubmission = () => {
    setShowReviewModal(false);
    submitTransfert();
  };

  const resetForm = () => {
    if (user) {
      setFormData({ 
        nom: user.nom || '', 
        prenom: user.prenom || '', 
        postnom: user.postnom || '',
        telephone: user.telephone || '', 
        email: user.email || '',
        province_origine: '',
        province_accueil: '',
        matricule: '',
      });
    } else {
      setFormData({ 
        nom: '', 
        prenom: '', 
        postnom: '', 
        telephone: '', 
        email: '',
        province_origine: '',
        province_accueil: '',
        matricule: '',
      });
    }
    setFiles({
      piece_identite: null,
      carte_service: null,
      acte_nomination: null,
      acte_affectation: null,
      lettre_transfert: null,
      formulaire_transfert_signe: null,
      pv_origine: null,
      pv_accueil: null,
      cadre_organique_accueil: null,
      attestation_effectifs_enseignants: null,
      attestation_effectifs_chercheurs: null,
      // preuve_paiement: null,
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
    // preuve_paiement: "Preuve de paiement Bancaire",
    preuve_charge_horaire: "Charge horaire",
    pv_attribution_charge: "PV de réunion d'attribution de charge",
    acte_nomination: "Acte de nomination",
    acte_affectation: "Acte d'affectation",
    attestation_pato: "Attestation PATO (optionnel)",
    acte_mariage: "Acte de mariage",
    preuve_emploi: "Preuve d'emploi",
    coordonnees_etablissement_transfert: "Coordonnées de l'établissement de transfert",
    preuve_nouvelle_residence: "Preuve de nouvelle résidence",
    preuve_activite_ou_traitement: "Preuve d'activité ou de traitement",
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
    // preuve_paiement: "Justificatif du paiement bancaire des frais liés à la demande.",
    preuve_charge_horaire: "Document prouvant la disponibilité d'une charge horaire disponible dans l'établissement d'accueil.",
    pv_attribution_charge: "Procès-verbal d'attribution de charge d'enseignement ou de recherche.",
    acte_nomination: "Document officiel attestant la nomination du requérant à son poste actuel.",
    acte_affectation: "Document officiel attestant l'affectation du requérant à son établissement actuel.",
    attestation_pato: "Attestation du Personnel Administratif, Technique et Ouvrier (optionnel).",
    acte_mariage: "L’acte de mariage du (de la) requérant(e) ",
    preuve_emploi: "La preuve de l'emploi occupé par le requérant au sein de l'enseignement supérieur et universitaire ou de la recherche scientifique",
    coordonnees_etablissement_transfert: "Les coordonnées complètes de l'établissement, service spécialisé, centre ou institut de recherche le plus proche de la nouvelle résidence du(de la) conjoint(e) du (de la) requérant(e) dans lequel celui-ci ou cette dernière souhaite être transféré(e)",
    preuve_nouvelle_residence: "La preuve de la nouvelle résidence du (de la) conjoint(e)",
    preuve_activite_ou_traitement: "La preuve de l'activité professionnelle exercée par le(la) conjoint(e) ou du traitement médical de longue durée dont bénéficie le(la) conjoint(e).",
  };

  const getFileLabel = (fileKey) => {
    if (fileKey === 'formulaire_transfert_signe' && formType === 'enseignants') {
      return "Formulaire Ad-Hoc signé par l'établissement de provenance et d'accueil";
    }
    if (fileKey === 'formulaire_transfert_signe' && formType === 'chercheurs') {
      return "Formulaire Ad-Hoc signé par les centres/instituts de provenance et d'accueil";
    }
    if (fileKey === 'formulaire_transfert_signe' && formType === 'pato') {
      return "Formulaire Ad-Hoc signé par les établissements/centres/instituts de provenance et d'accueil";
    }
    if (fileKey === 'pv_origine' && formType === 'chercheurs') {
      return "PV du conseil/comité de gestion de l'institut/centre de provenance (transfert sortant)";
    }
    if (fileKey === 'pv_origine' && formType === 'enseignants') {
      return "PV de validation de l'établissement de provenance (transfert sortant)";
    }
    if (fileKey === 'pv_origine' && formType === 'pato') {
      return "PV du Comité de gestion de l'établissement/service spécialisé/institut/centre de provenance";
    }
    if (fileKey === 'pv_accueil' && formType === 'chercheurs') {
      return "PV du conseil/comité de gestion de l'institut/centre d'accueil (transfert entrant)";
    }
    if (fileKey === 'pv_accueil' && formType === 'enseignants') {
      return "PV d'acceptation de l'établissement d'accueil";
    }
    if (fileKey === 'pv_accueil' && formType === 'pato') {
      return "PV du Comité de gestion de l'établissement/service spécialisé/institut/centre d'accueil";
    }
    if (fileKey === 'cadre_organique_accueil' && formType === 'chercheurs') {
      return "Cadre organique de l'institut/centre d'acceuil";
    }
    if (fileKey === 'cadre_organique_accueil' && formType === 'enseignants') {
      return "Cadre organique de l'établissement d'accueil";
    }
    if (fileKey === 'cadre_organique_accueil' && formType === 'pato') {
      return "Cadre organique du service spécialisé/cellule/section d'accueil";
    }
    if (fileKey === 'attestation_effectifs_enseignants' && formType === 'chercheurs') {
      return "Attestation des effectifs de chercheurs du departement/cellule/section d'affectation";
    }
    if (fileKey === 'attestation_effectifs_enseignants' && formType === 'pato') {
      return "Attestation des PATO de service/cellule/section";
    }
    // if (fileKey === 'preuve_paiement' && formType === 'chercheurs') {
    //   return "Preuve de paiement Bancaire des frais administratifs";
    // }
    // if (fileKey === 'preuve_paiement' && formType === 'enseignants') {
    //   return "Preuve de paiement des frais administratifs";
    // }
    // if (fileKey === 'preuve_paiement' && formType === 'pato') {
    //   return "Preuve de paiement Bancaire des frais administratifs";
    // }
    if (fileKey === 'preuve_charge_horaire' && formType === 'chercheurs') {
      return "Intitulé du Projet de recherche";
    }
    if (fileKey === 'acte_nomination' && formType === 'enseignants') {
      return "Dernier arrêté de nomination";
    }
    return fileLabels[fileKey];
  };

  const getFileDescription = (fileKey) => {    if (fileKey === 'carte_service' && formType === 'enseignants') {
      return "Copie recto-verso de la carte de service du requérant ou toute autre preuve d'appartenance au personnel à l'établissement de provenance";
    }
    if (fileKey === 'carte_service' && formType === 'chercheurs') {
      return "Copie recto-verso de la carte de service du requérant ou toute autre preuve d'appartenance au personnel du centre ou institut scientifique de provenance";
    }
    if (fileKey === 'carte_service' && formType === 'pato') {
      return "Copie recto-verso de la carte de service du requérant ou toute autre preuve d'appartenance au personnel à l'établissement/service spécialisé/centre ou institut de recherche scientifique de provenance";
    }
    if (fileKey === 'carte_service' && formType === 'conjoint') {
      return "Copie recto-verso de la carte de service du (de la) conjoint(e) ou toute autre preuve d'appartenance au personnel de l'établissement/service spécialisé/centre ou institut de recherche scientifique concerné par le transfert d'office.";
    }    if (fileKey === 'formulaire_transfert_signe' && formType === 'enseignants') {
      return "Formulaire Ad-Hoc signé par les établissements de provenance et d'accueil.";
    }
    if (fileKey === 'formulaire_transfert_signe' && formType === 'chercheurs') {
      return "Formulaire signé à la fois par les centres/instituts de provenance et d'accueil :";
    }
    if (fileKey === 'formulaire_transfert_signe' && formType === 'pato') {
      return "Formulaire Ad-Hoc signé par les établissements/Centres/Instituts de provenance et d'accueil.";
    }
    if (fileKey === 'pv_origine' && formType === 'chercheurs') {
      return "Procès-verbal du conseil/comité de gestion de l'institut/centre de provenance (transfert sortant)";
    }
    if (fileKey === 'pv_origine' && formType === 'enseignants') {
      return "Procès-verbal de validation de l'établissement de provenance";
    }
    if (fileKey === 'pv_origine' && formType === 'pato') {
      return "Procès-verbal du Comité de gestion/Etablissement/Institut/Centre d'Origine.";
    }
    if (fileKey === 'pv_accueil' && formType === 'chercheurs') {
      return "Procès-verbal du conseil/comité de gestion de l'institut/centre d'accueil (transfert entrant)";
    }
    if (fileKey === 'pv_accueil' && formType === 'enseignants') {
      return "Procès-verbal d'acceptation de l'établissement d'accueil";
    }
    if (fileKey === 'pv_accueil' && formType === 'pato') {
      return "Procès-verbal du Comité de gestion/Etablissement/Institut/Centre d'accueil.";
    }
    if (fileKey === 'cadre_organique_accueil' && formType === 'chercheurs') {
      return '';
    }
    if (fileKey === 'cadre_organique_accueil' && formType === 'enseignants') {
      return '';
    }
    if (fileKey === 'cadre_organique_accueil' && formType === 'pato') {
      return '';
    }
    if (fileKey === 'attestation_effectifs_enseignants' && formType === 'enseignants') {
      return "Attestation officielle indiquant les effectifs des étudiants de la faculté/département où vous souhaitez être transféré.";
    }
    if (fileKey === 'attestation_effectifs_enseignants' && formType === 'chercheurs') {
      return "Affectation officielle des effectifs des chercheurs affectés dans le departement/cellule/section où vous voulez être transferé";
    }
    if (fileKey === 'attestation_effectifs_enseignants' && formType === 'pato') {
      return "Attestation officielle des effectifs de PATO affectés dans le service/cellule/section où vous souhaitez être transféré.";
    }
    // if (fileKey === 'preuve_paiement' && formType === 'chercheurs') {
    //   return "Justificatif du paiement Bancaire de la somme de 70 USD au titre de frais administratifs liés à la demande.";
    // }

    // if (fileKey === 'preuve_paiement' && formType === 'enseignants') {
    //   return "Justificatif du paiement bancaire de la somme de 70 USD au titre des frais administratifs liés à la demande de transfert.";
    // }
    // if (fileKey === 'preuve_paiement' && formType === 'pato') {
    //   return "Justificatif du paiement de la somme de 50 USD à la banque au titre des frais administratifs liés à la demande de transfert.";
    // }
    if (fileKey === 'preuve_charge_horaire' && formType === 'chercheurs') {
      return "Indiquez le projet de recherche sur lequel vous allez travailler.";
    }
    if (fileKey === 'preuve_charge_horaire' && formType === 'enseignants') {
      return "Document prouvant qu’une charge horaire vous a été attribuée au sein de l’établissement d’accueil";
    }
    if (fileKey === 'pv_attribution_charge' && formType === 'enseignants') {
      return "Procès-verbal de la réunion de l’organe qui vous a attribué la charge horaire.";
    }
    if (fileKey === 'acte_affectation' && formType === 'enseignants') {
      return '';
    }
    return fileDescriptions[fileKey];
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

  const isOptionalFile = (fileKey) => {
    return fileKey === 'cadre_organique_accueil';
  };

  function buildSubmissionSummary() {
    const items = Object.keys(files).map((fileKey) => ({
      key: fileKey,
      label: getFileLabel(fileKey),
      completed: Boolean(files[fileKey] || existingFiles[fileKey]),
    }));

    return {
      completed: items.filter(item => item.completed),
      missing: items.filter(item => !item.completed),
    };
  }

  // Interface de sélection du type de formulaire
  if (!formType) {
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
              <h1>Sélectionnez le type de demande</h1>
              <p className="subtitle">
                Choisissez votre catégorie professionnelle
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
          <div className="form-type-selection">
            <h2>Vous demandez un transfert en tant que :</h2>
            <div className="form-type-cards">
              <div className="form-type-card" onClick={() => setFormType('enseignants')}>
                <div className="card-icon-type">👨‍🏫</div>
                <h3>Enseignants</h3>
                <p>Personnel enseignant des établissements d'enseignement supérieur et universitaire</p>
              </div>
              
              <div className="form-type-card" onClick={() => setFormType('chercheurs')}>
                <div className="card-icon-type">🔬</div>
                <h3>Chercheurs</h3>
                <p>Personnel de recherche scientifique et centres de recherche</p>
              </div>
              
              <div className="form-type-card" onClick={() => setFormType('pato')}>
                <div className="card-icon-type">💼</div>
                <h3>PATO</h3>
                <p>Personnel administratif, technique et ouvrier</p>
              </div>
              
              <div className="form-type-card" onClick={() => setFormType('conjoint')}>
                <div className="card-icon-type">👥</div>
                <h3>Conjoint(e)</h3>
                <p>Transfert d'office</p>
              </div>
            </div>
          </div>
        </div>
      </>
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
            <h1>{editingTransfert ? 'Compléter le dossier' : 'Créer une demande de transfert'}</h1>
            <p className="subtitle">
              Documents requis pour solliciter un transfert.
            </p>
            <div className="form-type-badge" onClick={() => setFormType(null)} title="Cliquer pour changer le type">
              Type: {formType === 'enseignants' ? '👨‍🏫 Enseignants' : formType === 'chercheurs' ? '🔬 Chercheurs' : formType === 'pato' ? '💼 PATO' : '👥 Conjoint(e)'}
              <span className="change-type-icon">↻</span>
            </div>
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

        {loading && (
          <div className="loading-toast">
            <div className="loading-spinner"></div>
            <span>En attente d'enregistrement...</span>
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

        {showReviewModal && (
          <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
            <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Vérification avant soumission</h2>
              <p>Vérifiez les éléments complétés et manquants avant de continuer.</p>

              <div className="review-section completed">
                <h3>✅ Complétés ({reviewSummary.completed.length})</h3>
                {reviewSummary.completed.length > 0 ? (
                  <ul>
                    {reviewSummary.completed.map((item) => (
                      <li key={`ok-${item.key}`}>{item.label}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="review-empty">Aucun élément complété.</p>
                )}
              </div>

              <div className="review-section missing">
                <h3>❌ Non complétés ({reviewSummary.missing.length})</h3>
                {reviewSummary.missing.length > 0 ? (
                  <ul>
                    {reviewSummary.missing.map((item) => (
                      <li key={`miss-${item.key}`}>{item.label}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="review-empty">Aucun élément manquant.</p>
                )}
              </div>

              <div className="review-actions">
                <button type="button" className="modal-btn" onClick={handleConfirmSubmission}>
                  Confirmer et soumettre
                </button>
                <button type="button" className="reset-btn" onClick={() => setShowReviewModal(false)}>
                  Fermer / Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="transfert-form">
        <div className="form-section">
          <h2>Informations</h2>
          <div className="form-group">
            <label htmlFor="matricule">Matricule <span className="required-asterisk">*</span></label>
            <input
              type="text"
              id="matricule"
              name="matricule"
              value={formData.matricule}
              onChange={(e) => setFormData(prev => ({ ...prev, matricule: e.target.value }))}
              maxLength={200}
              placeholder="Entrez votre matricule"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email <span className="required-asterisk">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              maxLength={200}
              placeholder="Entrez votre email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="telephone">Téléphone <span className="required-asterisk">*</span></label>
            <input
              type="text"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
              maxLength={20}
              placeholder="Entrez votre numéro de téléphone"
              required
            />
          </div>
        </div>

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
                      {getFileLabel(fileKey)} {!isExisting && !editingTransfert && !isOptionalFile(fileKey) && '*'}
                      {isExisting && <span className="existing-badge">Complété</span>}
                    </label>
                    {getFileDescription(fileKey) && (
                      <span className="tooltip-text">{getFileDescription(fileKey)}</span>
                    )}
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
                {isLast && formType !== 'conjoint' && (
                  <div className="provinces-columns-form">
                    <div className="form-group">
                      <div className="tooltip-container">
                        <label htmlFor="province_origine">
                          {formType === 'chercheurs'
                            ? "Province d'origine de l'institut/centre de provenance *"
                            : formType === 'enseignants'
                              ? "Province de l'établissement de provenance *"
                            : formType === 'pato'
                              ? "Province de l'établissement/centre/institut de provenance *"
                              : "Province de provenance *"}
                        </label>
                        <span className="tooltip-text">
                          {formType === 'chercheurs'
                            ? "Province d'origine de l'institut/centre de provenance"
                            : formType === 'enseignants'
                              ? "Province de l'établissement de provenance"
                            : "Province de l'établissement/service spécialisé/centre de recherche de provenance"}
                        </span>
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
                        <label htmlFor="province_accueil">
                          {formType === 'chercheurs'
                            ? "Province d'accueil de l'institut/centre d'accueil *"
                            : formType === 'enseignants'
                              ? "Province de l'établissement d'accueil *"
                            : formType === 'pato'
                              ? "Province de l'établissement/service spécialisé/centre d'accueil *"
                              : "Province d'accueil *"}
                        </label>
                        <span className="tooltip-text">
                          {formType === 'chercheurs'
                            ? "Province d'accueil de l'institut/centre d'accueil"
                            : formType === 'enseignants'
                              ? "Province de l'établissement d'accueil"
                            : "Province de l'établissement/service spécialisé/centre de recherche d'accueil"}
                        </span>
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








