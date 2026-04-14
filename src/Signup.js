import React, { useState } from 'react';
import './Login.css';
import { normalizeAuthToken, extractOwnerId } from './utils/auth';

const Signup = ({ onSignupSuccess, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    nom: '',
    postnom: '',
    email: '',
    telephone: '',
    mot_de_passe: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    // Accepter les formats internationaux
    const re = /^\+?[\d\s\-()]{9,}$/;
    return re.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (!formData.nom || !formData.postnom || !formData.email || !formData.telephone || !formData.mot_de_passe) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs.' });
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setMessage({ type: 'error', text: 'Adresse email invalide.' });
      setLoading(false);
      return;
    }

    if (!validatePhone(formData.telephone)) {
      setMessage({ type: 'error', text: 'Numéro de téléphone invalide.' });
      setLoading(false);
      return;
    }

    if (formData.mot_de_passe.length < 8) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères.' });
      setLoading(false);
      return;
    }

    if (formData.mot_de_passe !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://admin.cgiibnn-esursi.cd/api/candidat/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: formData.nom,
          postnom: formData.postnom,
          email: formData.email,
          telephone: formData.telephone,
          mot_de_passe: formData.mot_de_passe,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        const authToken = normalizeAuthToken(result.token, result.token_type);
        if (!authToken) {
          setMessage({ type: 'error', text: 'Token d\'authentification manquant.' });
          setLoading(false);
          return;
        }

        const userPayload = {
          nom: formData.nom,
          postnom: formData.postnom,
          email: formData.email,
          telephone: formData.telephone,
        };

        const ownerId = extractOwnerId(result) ?? extractOwnerId(result.data);
        if (ownerId !== null && ownerId !== undefined) {
          userPayload.id = ownerId;
          if (userPayload.candidat_id === undefined) {
            userPayload.candidat_id = ownerId;
          }
        }

        sessionStorage.setItem('token', authToken);
        sessionStorage.setItem('user', JSON.stringify(userPayload));
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setMessage({ type: 'success', text: 'Inscription réussie! Redirection en cours...' });
        setTimeout(() => {
          onSignupSuccess(authToken, userPayload);
        }, 1500);
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.message || error.detail || 'Erreur lors de l\'inscription',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Erreur de connexion: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo en haut */}
        <div className="login-header">
          <div className="login-logo">
            <img src="/app-logo.png" alt="Logo" className="logo" />
          </div>
        </div>

        {/* Titre et description */}
        <div className="login-content-header">
          <h1 className="login-title">Créer un Compte</h1>
          <p className="login-description">Inscrivez-vous pour soumettre une demande de transfert</p>
        </div>

        {/* Message d'erreur/succès */}
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="nom">Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              placeholder="Votre nom"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="postnom">Post-nom</label>
            <input
              type="text"
              id="postnom"
              name="postnom"
              value={formData.postnom}
              onChange={handleInputChange}
              placeholder="Votre post-nom"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="votre@email.com"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="telephone">Téléphone</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              placeholder="+243123456789"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mot_de_passe">Mot de passe</label>
            <div className="password-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="mot_de_passe"
                name="mot_de_passe"
                value={formData.mot_de_passe}
                onChange={handleInputChange}
                placeholder="Entrez votre mot de passe 8 caractères minimum"
                minLength={8}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <div className="password-input-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirmez votre mot de passe 8 caractères minimum"
                minLength={8}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>

        {/* Lien pour retourner à la connexion */}
        <div className="login-footer">
          <p>
            Vous avez déjà un compte?
            <button 
              onClick={onBackToLogin} 
              className="signup-link"
            >
              Connectez-vous
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
