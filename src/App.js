import './App.css';
import { useState, useEffect } from 'react';
import Login from './Login';
import Signup from './Signup';
import TransfertList from './TransfertList';
import TransfertForm from './TransfertForm';
import GuidePage from './GuidePage';
import { normalizeAuthToken, extractOwnerId } from './utils/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // 'list' ou 'form'
  const [authView, setAuthView] = useState('login'); // 'login' ou 'signup'
  const [editingTransfert, setEditingTransfert] = useState(null);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const storedToken = sessionStorage.getItem('token') || localStorage.getItem('token');
    const storedUserString = sessionStorage.getItem('user') || localStorage.getItem('user');

    if (!storedUserString) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      return;
    }

    let parsedUser = null;
    try {
      parsedUser = JSON.parse(storedUserString);
    } catch (error) {
      parsedUser = null;
    }

    if (!parsedUser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      return;
    }

    const ownerId = extractOwnerId(parsedUser);
    if (ownerId !== null && ownerId !== undefined) {
      if (parsedUser.id === undefined) {
        parsedUser.id = ownerId;
      }
      if (parsedUser.candidat_id === undefined) {
        parsedUser.candidat_id = ownerId;
      }
    }

    const normalizedToken = normalizeAuthToken(storedToken);

    if (normalizedToken) {
      if (normalizedToken !== storedToken) {
        sessionStorage.setItem('token', normalizedToken);
      } else if (!sessionStorage.getItem('token')) {
        sessionStorage.setItem('token', normalizedToken);
      }
      sessionStorage.setItem('user', JSON.stringify(parsedUser));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(normalizedToken);
      setUser(parsedUser);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
  }, []);

  const handleLoginSuccess = (userData, token) => {
    const normalizedToken = normalizeAuthToken(token);
    if (!normalizedToken) {
      return;
    }
    setUser(userData);
    setToken(normalizedToken);
    setIsAuthenticated(true);
    setCurrentView('list');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setCurrentView('list');
    setEditingTransfert(null);
  };

  const handleCreateNew = () => {
    setEditingTransfert(null);
    setCurrentView('form');
  };

  const handleEditTransfert = (transfertId, transfertData) => {
    setEditingTransfert({
      id: transfertId,
      data: transfertData,
    });
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setEditingTransfert(null);
  };

  const handleShowGuide = () => {
    setEditingTransfert(null);
    setCurrentView('guide');
  };

  const handleSignupSuccess = (token, userData) => {
    const normalizedToken = normalizeAuthToken(token);
    if (!normalizedToken) {
      return;
    }
    setUser(userData);
    setToken(normalizedToken);
    setIsAuthenticated(true);
    setCurrentView('list');
    setAuthView('login');
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <>
          {currentView === 'list' && (
            <TransfertList
              user={user}
              token={token}
              onLogout={handleLogout}
              onCreateNew={handleCreateNew}
              onEditTransfert={handleEditTransfert}
              onShowGuide={handleShowGuide}
            />
          )}

          {currentView === 'form' && (
            <TransfertForm
              user={user}
              token={token}
              onLogout={handleLogout}
              editingTransfert={editingTransfert}
              onBackToList={handleBackToList}
            />
          )}

          {currentView === 'guide' && (
            <GuidePage
              user={user}
              onBack={handleBackToList}
              onLogout={handleLogout}
            />
          )}
        </>
      ) : authView === 'login' ? (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onShowSignup={() => setAuthView('signup')}
        />
      ) : (
        <Signup 
          onSignupSuccess={handleSignupSuccess}
          onBackToLogin={() => setAuthView('login')}
        />
      )}
    </div>
  );
}

export default App;
