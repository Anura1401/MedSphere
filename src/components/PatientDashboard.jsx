import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { FileText, Calendar, Pill, CheckCircle2, ChevronRight, Activity, Download, HeartPulse, ShieldAlert, Award, X } from 'lucide-react';
import './PatientDashboard.css';

export default function PatientDashboard() {
  const { currentUser, reports, prescriptions, togglePrescriptionTracker } = useContext(AppContext);
  const [selectedReport, setSelectedReport] = useState(null);
  const [downloadingReportId, setDownloadingReportId] = useState(null);

  const patientReports = reports.filter((r) => r.patientId === currentUser.id);
  const patientPrescriptions = prescriptions.filter((rx) => rx.patientId === currentUser.id);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleDownload = (rep, e) => {
    e.stopPropagation();
    setDownloadingReportId(rep.id);
    setTimeout(() => {
      // Simulate file download
      const element = document.createElement("a");
      const file = new Blob([
        `MEDSPHERE DIGITAL MEDICAL REPORT\n\n` +
        `Patient Name: ${currentUser.name}\n` +
        `Report Title: ${rep.title}\n` +
        `Date: ${rep.date}\n` +
        `Type: ${rep.type}\n` +
        `Clinical Status: ${rep.status.toUpperCase()}\n\n` +
        `Summary:\n${rep.summary}\n\n` +
        `Detailed Findings:\n${rep.details}\n\n` +
        `Published securely by MedSphere Systems.`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${rep.title.replace(/\s+/g, '_')}_${rep.date}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDownloadingReportId(null);
    }, 1200);
  };

  // Compliance calculations
  const totalPrescriptions = patientPrescriptions.length;
  const takenTodayCount = patientPrescriptions.filter(rx => rx.takenDates.includes(todayStr)).length;
  
  // Calculate average compliance (arbitrary score based on logged days)
  const totalLoggedDays = patientPrescriptions.reduce((sum, rx) => sum + rx.takenDates.length, 0);
  const complianceScore = totalPrescriptions > 0 
    ? Math.min(100, Math.round((totalLoggedDays / (totalPrescriptions * 4)) * 100)) 
    : 100;

  return (
    <div className="patient-dashboard animate-fade-in">
      {/* Welcome Banner */}
      <header className="patient-header">
        <div className="patient-welcome">
          <HeartPulse size={24} className="icon-emerald" />
          <div>
            <h1>Welcome back, {currentUser.name}</h1>
            <p>Your digital medical charts and prescription tracker are up-to-date.</p>
          </div>
        </div>
      </header>

      {/* Summary Scorecard Grid */}
      <section className="scorecard-grid">
        <div className="scorecard glass-card">
          <Activity size={24} className="scorecard-icon cyan" />
          <div className="scorecard-info">
            <span className="value">{patientReports.length}</span>
            <span className="label">Diagnostic Files</span>
          </div>
        </div>
        
        <div className="scorecard glass-card">
          <Pill size={24} className="scorecard-icon purple" />
          <div className="scorecard-info">
            <span className="value">{patientPrescriptions.length}</span>
            <span className="label">Active Medications</span>
          </div>
        </div>

        <div className="scorecard glass-card">
          <Award size={24} className="scorecard-icon emerald" />
          <div className="scorecard-info">
            <span className="value">{complianceScore}%</span>
            <span className="label">Adherence Score</span>
          </div>
        </div>

        <div className="scorecard glass-card">
          <CheckCircle2 size={24} className="scorecard-icon green" />
          <div className="scorecard-info">
            <span className="value">{takenTodayCount} / {totalPrescriptions}</span>
            <span className="label">Doses Logged Today</span>
          </div>
        </div>
      </section>

      {/* Roster-Main Content Section */}
      <div className="dashboard-layout">
        {/* Left Side: Medical Reports */}
        <section className="main-left glass-panel">
          <div className="panel-header">
            <FileText size={20} className="icon-emerald" />
            <h2>Clinical Diagnosis & Reports</h2>
          </div>

          {patientReports.length === 0 ? (
            <div className="empty-panel">No medical files have been uploaded yet.</div>
          ) : (
            <div className="reports-list">
              {patientReports.map((rep) => (
                <div 
                  key={rep.id} 
                  className="report-card glass-card"
                  onClick={() => setSelectedReport(rep)}
                >
                  <div className="report-card-top">
                    <span className="type-badge">{rep.type}</span>
                    <span className={`badge badge-${rep.status}`}>{rep.status}</span>
                  </div>
                  <h3>{rep.title}</h3>
                  <p className="summary">{rep.summary}</p>
                  
                  <div className="report-card-footer">
                    <span className="date">
                      <Calendar size={12} />
                      {rep.date}
                    </span>
                    <button 
                      className={`download-btn ${downloadingReportId === rep.id ? 'loading' : ''}`}
                      onClick={(e) => handleDownload(rep, e)}
                      disabled={downloadingReportId !== null}
                    >
                      <Download size={14} />
                      <span>{downloadingReportId === rep.id ? 'Saving...' : 'PDF'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Side: Medication Adherence Checklist */}
        <section className="main-right glass-panel">
          <div className="panel-header">
            <Pill size={20} className="icon-purple" />
            <h2>Daily Prescription Tracker</h2>
          </div>

          <p className="tracker-tip">
            Check off each prescribed medication as you take your daily dosage to log compliance.
          </p>

          {patientPrescriptions.length === 0 ? (
            <div className="empty-panel">No medications are currently prescribed.</div>
          ) : (
            <div className="meds-list">
              {patientPrescriptions.map((rx) => {
                const isTakenToday = rx.takenDates.includes(todayStr);
                return (
                  <div key={rx.id} className={`med-item glass-card ${isTakenToday ? 'taken glow-emerald' : ''}`}>
                    <div className="med-checkbox-container">
                      <button 
                        className={`checkbox-btn ${isTakenToday ? 'checked' : ''}`}
                        onClick={() => togglePrescriptionTracker(rx.id, todayStr)}
                        aria-label={isTakenToday ? "Mark medication not taken" : "Mark medication taken"}
                      >
                        <CheckCircle2 size={24} />
                      </button>
                    </div>
                    
                    <div className="med-info">
                      <div className="med-title-row">
                        <h3>{rx.medicineName}</h3>
                        <span className="dosage-pill">{rx.dosage}</span>
                      </div>
                      <p className="frequency"><strong>Schedule:</strong> {rx.frequency}</p>
                      <p className="instructions"><strong>Usage:</strong> {rx.instructions}</p>
                      
                      <div className="med-footer">
                        <span>Course: {rx.duration}</span>
                        <span className="compliance-badge">
                          Logged: {rx.takenDates.length} days
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Report Expand Overlay/Modal */}
      {selectedReport && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setSelectedReport(null)}>
          <div className="modal-content glass-panel glow-cyan animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedReport(null)}>
              <X size={20} />
            </button>

            <header className="modal-header">
              <span className="type-badge">{selectedReport.type}</span>
              <span className={`badge badge-${selectedReport.status}`}>{selectedReport.status}</span>
              <h2>{selectedReport.title}</h2>
              <p className="modal-date">
                <Calendar size={14} />
                <span>Date Published: {selectedReport.date}</span>
              </p>
            </header>

            <div className="modal-body">
              <div className="section-block">
                <h4>Diagnostic Summary</h4>
                <p className="summary-callout">{selectedReport.summary}</p>
              </div>

              <div className="section-block">
                <h4>Detailed Pathology & Recommendations</h4>
                <div className="report-markdown">
                  {selectedReport.details.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            <footer className="modal-footer">
              <button 
                className="btn btn-primary"
                onClick={(e) => handleDownload(selectedReport, e)}
                disabled={downloadingReportId !== null}
              >
                <Download size={16} />
                <span>{downloadingReportId === selectedReport.id ? 'Downloading File...' : 'Download Full Medical Record'}</span>
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedReport(null)}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
