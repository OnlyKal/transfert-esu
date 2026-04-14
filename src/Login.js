import React, { useState } from 'react';
import './Login.css';
import { normalizeAuthToken, extractOwnerId } from './utils/auth';

const Login = ({ onLoginSuccess, onShowSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (!formData.email || !formData.mot_de_passe) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs.' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://admin.cgiibnn-esursi.cd/api/candidat/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
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

        const baseUser = result.data && typeof result.data === 'object' ? result.data : {};
        const ownerId = extractOwnerId(result) ?? extractOwnerId(baseUser);
        const userPayload = { ...baseUser };

        if (ownerId !== null && ownerId !== undefined) {
          if (userPayload.id === undefined) {
            userPayload.id = ownerId;
          }
          if (userPayload.candidat_id === undefined) {
            userPayload.candidat_id = ownerId;
          }
        }
        sessionStorage.setItem('token', authToken);
        sessionStorage.setItem('user', JSON.stringify(userPayload));
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        onLoginSuccess(userPayload, authToken);

        setMessage({ type: 'success', text: 'Connexion réussie!' });
      } else {
        const error = await response.json();
        setMessage({ 
          type: 'error', 
          text: error.message || 'Identifiants incorrects.' 
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

  return (
    <div className="login-page">
      <div className="login-main-column">
        <h1 className="main-login-title">FORMULAIRE DE DEMANDE DE TRANSFERT</h1>
        <div className="login-card">
        {/* Logo en haut */}
        <div className="login-header">
          <div className="login-logo">
            <img src="/app-logo.png" alt="Logo" className="logo" />
          </div>
        </div>

        {/* Titre et description */}
        <div className="login-content-header">
          <h1 className="login-title">Connexion</h1>
          <p className="login-description">Accédez à votre demande de transfert</p>
        </div>

        {/* Message d'erreur/succès */}
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Entrez votre email"
              disabled={loading}
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
                required
                placeholder="Entrez votre mot de passe 8 caractères minimum"
                disabled={loading}
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

          {/* Bouton Se connecter */}
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        {/* Lien pour créer un compte */}
        <div className="login-footer">
          <p>
            Vous n'avez pas de compte? 
            <button 
              onClick={onShowSignup} 
              className="signup-link"
            >
              Créez-en un maintenant
            </button>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;
