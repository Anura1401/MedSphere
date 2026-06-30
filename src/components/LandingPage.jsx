import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Shield, Users, Stethoscope, HeartPulse, UserCheck } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage({ setActiveTab }) {
  const { switchUser, doctorUser, patients } = useContext(AppContext);

  const handleLogin = (user) => {
    switchUser(user);
    if (user.role === 'doctor') {
      setActiveTab('doctor-dashboard');
    } else {
      setActiveTab('patient-dashboard');
    }
  };

  return (
    <div className="landing-container animate-fade-in">
      <header className="landing-header animate-slide-up">
        <div className="tagline">
          <HeartPulse size={16} className="heart-icon" />
          <span>Interactive Clinical Sandbox</span>
        </div>
        <h1>Future of Connected Healthcare</h1>
        <p className="subtitle">
          Welcome to MedSphere. Experience a unified workspace where doctors publish reports, patients manage prescriptions, consult via chat, and support one another in patient communities.
        </p>
      </header>

      <div className="portal-sections">
        {/* Doctor Section */}
        <section className="portal-column doctor-section animate-slide-up">
          <div className="section-header">
            <div className="icon-badge cyan-glow">
              <Stethoscope size={24} />
            </div>
            <h2>Medical Staff Portal</h2>
            <p>Upload clinical files, track diagnostic statuses, and prescribe medication courses.</p>
          </div>

          <div className="login-card glass-card glow-cyan">
            <div className="profile-large">
              <img src={doctorUser.avatar} alt={doctorUser.name} />
              <div className="doctor-badge">MD</div>
            </div>
            <h3>{doctorUser.name}</h3>
            <p className="specialty">{doctorUser.specialty}</p>
            <div className="stats-row">
              <div className="stat-item">
                <span className="num">{patients.length}</span>
                <span className="lbl">Active Patients</span>
              </div>
              <div className="stat-item">
                <span className="num">Cardio</span>
                <span className="lbl">Department</span>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => handleLogin(doctorUser)}>
              <UserCheck size={18} />
              <span>Enter Doctor Hub</span>
            </button>
          </div>
        </section>

        {/* Patient Section */}
        <section className="portal-column patient-section animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="section-header">
            <div className="icon-badge emerald-glow">
              <Users size={24} />
            </div>
            <h2>Patient Portal</h2>
            <p>Monitor reports, manage medication logs, check off doses, and access community boards.</p>
          </div>

          <div className="patients-grid">
            {patients.map((pat) => (
              <div key={pat.id} className="patient-card glass-card" onClick={() => handleLogin(pat)}>
                <div className="patient-avatar-container">
                  <img src={pat.avatar} alt={pat.name} className="patient-img" />
                </div>
                <div className="patient-body">
                  <h4>{pat.name}</h4>
                  <div className="patient-meta">Age: {pat.age} &bull; {pat.condition}</div>
                  <span className="enter-badge">Log In</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      <footer className="landing-footer">
        <div className="footer-pill">
          <Shield size={14} />
          <span>Compliant Simulation Environment &bull; Mock Records Encrypted Locally</span>
        </div>
      </footer>
    </div>
  );
}
