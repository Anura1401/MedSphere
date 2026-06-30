import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from './context/AppContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import DoctorDashboard from './components/DoctorDashboard';
import PatientDashboard from './components/PatientDashboard';
import Chat from './components/Chat';
import Community from './components/Community';
import './App.css';

function App() {
  const { currentUser } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('landing');

  // Synchronize active view when user switches or logs out
  useEffect(() => {
    if (!currentUser) {
      setActiveTab('landing');
    } else {
      if (currentUser.role === 'doctor') {
        setActiveTab('doctor-dashboard');
      } else {
        setActiveTab('patient-dashboard');
      }
    }
  }, [currentUser]);

  return (
    <div className="app-layout">
      {currentUser && (
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
      
      <main className="app-main-content">
        {!currentUser && (
          <LandingPage setActiveTab={setActiveTab} />
        )}
        
        {currentUser && activeTab === 'doctor-dashboard' && (
          <DoctorDashboard />
        )}

        {currentUser && activeTab === 'patient-dashboard' && (
          <PatientDashboard />
        )}

        {currentUser && activeTab === 'chat' && (
          <Chat />
        )}

        {currentUser && activeTab === 'community' && (
          <Community />
        )}
      </main>
    </div>
  );
}

export default App;
