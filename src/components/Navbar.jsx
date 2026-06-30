import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Activity, LogOut, ChevronDown, User, Heart, MessageSquare, Users, Shield } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ activeTab, setActiveTab }) {
  const { currentUser, switchUser, patients, doctorUser } = useContext(AppContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleRoleChange = (user) => {
    switchUser(user);
    setDropdownOpen(false);
    // Reset view tab to default for the newly active role
    if (user.role === 'doctor') {
      setActiveTab('doctor-dashboard');
    } else {
      setActiveTab('patient-dashboard');
    }
  };

  const handleLogout = () => {
    switchUser(null);
  };

  return (
    <nav className="navbar glass-panel">
      <div className="nav-logo" onClick={() => currentUser ? null : setActiveTab('landing')}>
        <Activity className="logo-icon animate-pulse" />
        <span className="logo-text">Med<span>Sphere</span></span>
      </div>

      {currentUser && (
        <div className="nav-links">
          {currentUser.role === 'doctor' ? (
            <>
              <button 
                className={`nav-item ${activeTab === 'doctor-dashboard' ? 'active cyan' : ''}`}
                onClick={() => setActiveTab('doctor-dashboard')}
              >
                <Shield size={18} />
                <span>Patient Center</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'chat' ? 'active cyan' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <MessageSquare size={18} />
                <span>Inbox</span>
              </button>
            </>
          ) : (
            <>
              <button 
                className={`nav-item ${activeTab === 'patient-dashboard' ? 'active emerald' : ''}`}
                onClick={() => setActiveTab('patient-dashboard')}
              >
                <Heart size={18} />
                <span>Health Center</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'chat' ? 'active emerald' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <MessageSquare size={18} />
                <span>Doctor Chat</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'community' ? 'active purple' : ''}`}
                onClick={() => setActiveTab('community')}
              >
                <Users size={18} />
                <span>Community Board</span>
              </button>
            </>
          )}
        </div>
      )}

      {currentUser ? (
        <div className="nav-actions">
          {/* Simulation Switcher */}
          <div className="role-switcher-container">
            <button 
              className="role-switcher-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="avatar-mini">
                <img src={currentUser.avatar} alt={currentUser.name} />
              </div>
              <div className="role-switcher-info">
                <span className="role-name">{currentUser.name}</span>
                <span className="role-label">
                  {currentUser.role === 'doctor' ? 'Staff Physician' : 'Patient'}
                </span>
              </div>
              <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'rotate' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="role-dropdown glass-panel animate-slide-up">
                <div className="dropdown-section-title">Log in / Switch Role</div>
                
                {/* Doctor Option */}
                <button 
                  className={`dropdown-item ${currentUser.role === 'doctor' ? 'current' : ''}`}
                  onClick={() => handleRoleChange(doctorUser)}
                >
                  <img src={doctorUser.avatar} alt={doctorUser.name} className="avatar-micro" />
                  <div className="item-text">
                    <p className="name">{doctorUser.name}</p>
                    <p className="desc">{doctorUser.specialty}</p>
                  </div>
                </button>

                <div className="dropdown-divider"></div>
                <div className="dropdown-section-title">Simulate Patients</div>

                {/* Patients Options */}
                {patients.map((pat) => (
                  <button 
                    key={pat.id}
                    className={`dropdown-item ${currentUser.id === pat.id ? 'current' : ''}`}
                    onClick={() => handleRoleChange(pat)}
                  >
                    <img src={pat.avatar} alt={pat.name} className="avatar-micro" />
                    <div className="item-text">
                      <p className="name">{pat.name}</p>
                      <p className="desc">Age: {pat.age} | {pat.condition.split('&')[0]}</p>
                    </div>
                  </button>
                ))}

                <div className="dropdown-divider"></div>
                <button className="dropdown-logout" onClick={handleLogout}>
                  <LogOut size={14} />
                  <span>Log Out Portal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="nav-guest">
          <span className="badge badge-normal">Sandbox Mode</span>
        </div>
      )}
    </nav>
  );
}
