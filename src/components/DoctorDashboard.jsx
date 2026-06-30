import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { FileText, Plus, ListFilter, Trash2, Calendar, Pill, AlertTriangle, CheckCircle, Info, Upload } from 'lucide-react';
import AddPatientModal from './AddPatientModal';
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const { patients, reports, prescriptions, addReport, addPrescription, deletePrescription, addPatient } = useContext(AppContext);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState('upload'); // 'upload', 'prescribe', 'history'
  
  // Register Patient States
  const [showAddPatModal, setShowAddPatModal] = useState(false);

  const handleRegisterPatient = async (patientData) => {
    const finalAvatar = patientData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150';

    const newPat = await addPatient({
      ...patientData,
      avatar: finalAvatar
    });

    if (newPat) {
      setSelectedPatientId(newPat.id);
      showToast(`Patient ${newPat.name} registered.`);
    }

    setShowAddPatModal(false);
  };
  
  // Notification banner state
  const [toastMessage, setToastMessage] = useState(null);

  // Form states
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('Blood Test');
  const [reportStatus, setReportStatus] = useState('normal');
  const [reportSummary, setReportSummary] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFreq, setMedFreq] = useState('Once daily');
  const [medDuration, setMedDuration] = useState('30 days');
  const [medInstructions, setMedInstructions] = useState('');

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const patientReports = reports.filter(r => r.patientId === selectedPatientId);
  const patientPrescriptions = prescriptions.filter(rx => rx.patientId === selectedPatientId);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportTitle || !reportSummary || !reportDetails) {
      showToast('Please fill in all report fields.');
      return;
    }

    addReport({
      patientId: selectedPatientId,
      title: reportTitle,
      type: reportType,
      status: reportStatus,
      summary: reportSummary,
      details: reportDetails
    });

    showToast(`Successfully uploaded "${reportTitle}" for ${selectedPatient.name}.`);
    
    // Clear Form
    setReportTitle('');
    setReportSummary('');
    setReportDetails('');
    setActiveSubTab('history');
  };

  const handlePrescriptionSubmit = (e) => {
    e.preventDefault();
    if (!medName || !medDosage || !medDuration) {
      showToast('Please fill in all prescription fields.');
      return;
    }

    addPrescription({
      patientId: selectedPatientId,
      medicineName: medName,
      dosage: medDosage,
      frequency: medFreq,
      duration: medDuration,
      instructions: medInstructions
    });

    showToast(`Prescribed ${medName} ${medDosage} to ${selectedPatient.name}.`);

    // Clear Form
    setMedName('');
    setMedDosage('');
    setMedInstructions('');
    setActiveSubTab('history');
  };

  // Deletion functions to demonstrate database operations
  const handleDeletePrescription = (id) => {
    deletePrescription(id);
    showToast('Prescription course discontinued.');
  };

  return (
    <div className="doc-dashboard-container animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="doc-toast glass-panel glow-cyan animate-slide-up">
          <Info size={16} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Patient Selector Sidebar */}
      <aside className="patient-roster glass-panel">
        <div className="roster-header">
          <div className="roster-header-title">
            <ListFilter size={18} className="icon-accent" />
            <h3>Patient Roster</h3>
          </div>
          <button className="add-pat-btn-small" onClick={() => setShowAddPatModal(true)} title="Register New Patient">
            <Plus size={16} />
          </button>
        </div>
        <div className="roster-list">
          {patients.map((pat) => (
            <button
              key={pat.id}
              className={`roster-item ${selectedPatientId === pat.id ? 'active' : ''}`}
              onClick={() => setSelectedPatientId(pat.id)}
            >
              <img src={pat.avatar} alt={pat.name} className="roster-avatar" />
              <div className="roster-details">
                <span className="name">{pat.name}</span>
                <span className="condition">{pat.condition.split('&')[0]}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Roster Main Workstation */}
      <main className="workstation-container">
        {selectedPatient ? (
          <>
            {/* Patient overview header */}
            <div className="patient-overview-card glass-card">
              <div className="patient-meta-large">
                <img src={selectedPatient.avatar} alt={selectedPatient.name} />
                <div>
                  <h2>{selectedPatient.name}</h2>
                  <p className="pat-info">
                    Age: {selectedPatient.age} &bull; Gender: Male &bull; ID: {selectedPatient.id}
                  </p>
                  <p className="pat-cond">Active Condition: {selectedPatient.condition}</p>
                </div>
              </div>
            </div>

            {/* Workstation Tabs */}
            <div className="workstation-tabs">
              <button
                className={`w-tab ${activeSubTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('upload')}
              >
                <Upload size={16} />
                <span>Upload Report</span>
              </button>
              <button
                className={`w-tab ${activeSubTab === 'prescribe' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('prescribe')}
              >
                <Plus size={16} />
                <span>Prescribe Medication</span>
              </button>
              <button
                className={`w-tab ${activeSubTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('history')}
              >
                <FileText size={16} />
                <span>Medical Records History ({patientReports.length + patientPrescriptions.length})</span>
              </button>
            </div>

            {/* Active workstation tab content */}
            <div className="workstation-content glass-panel">
              {activeSubTab === 'upload' && (
                <form onSubmit={handleReportSubmit} className="doc-form">
                  <h3 className="form-title">Upload Diagnostics & Lab Files</h3>
                  
                  <div className="form-row">
                    <div className="form-group flex-2">
                      <label htmlFor="rep-title">Report Title</label>
                      <input
                        id="rep-title"
                        type="text"
                        placeholder="e.g. Lipid Profile, Chest X-Ray"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label htmlFor="rep-type">Report Type</label>
                      <select
                        id="rep-type"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                      >
                        <option>Blood Test</option>
                        <option>MRI Scan</option>
                        <option>ECG Report</option>
                        <option>General Exam</option>
                        <option>Ultrasound</option>
                      </select>
                    </div>
                    <div className="form-group flex-1">
                      <label htmlFor="rep-status">Clinical Status</label>
                      <select
                        id="rep-status"
                        value={reportStatus}
                        onChange={(e) => setReportStatus(e.target.value)}
                      >
                        <option value="normal">Normal</option>
                        <option value="warning">Warning / Elevated</option>
                        <option value="critical">Critical Action Req.</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="rep-summary">Clinical Summary</label>
                    <input
                      id="rep-summary"
                      type="text"
                      placeholder="Enter a brief, one-sentence clinical summary of the findings..."
                      value={reportSummary}
                      onChange={(e) => setReportSummary(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="rep-details">Lab Findings & Treatment Advice</label>
                    <textarea
                      id="rep-details"
                      rows={5}
                      placeholder="Write detailed numeric findings, references, dietary recommendations, and notes..."
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    <Upload size={16} />
                    <span>Publish Medical Report</span>
                  </button>
                </form>
              )}

              {activeSubTab === 'prescribe' && (
                <form onSubmit={handlePrescriptionSubmit} className="doc-form">
                  <h3 className="form-title">Issue Medication Prescription</h3>

                  <div className="form-row">
                    <div className="form-group flex-2">
                      <label htmlFor="rx-med">Medicine Name</label>
                      <input
                        id="rx-med"
                        type="text"
                        placeholder="e.g. Metformin, Atorvastatin, Lisinopril"
                        value={medName}
                        onChange={(e) => setMedName(e.target.value)}
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label htmlFor="rx-dosage">Dosage / Strength</label>
                      <input
                        id="rx-dosage"
                        type="text"
                        placeholder="e.g. 500mg, 10mg"
                        value={medDosage}
                        onChange={(e) => setMedDosage(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label htmlFor="rx-freq">Frequency</label>
                      <select
                        id="rx-freq"
                        value={medFreq}
                        onChange={(e) => setMedFreq(e.target.value)}
                      >
                        <option>Once daily</option>
                        <option>Once daily (at bedtime)</option>
                        <option>Once daily (in the morning)</option>
                        <option>Twice daily</option>
                        <option>Twice daily (with food)</option>
                        <option>Three times daily</option>
                        <option>As needed (PRN)</option>
                      </select>
                    </div>
                    <div className="form-group flex-1">
                      <label htmlFor="rx-duration">Duration Course</label>
                      <input
                        id="rx-duration"
                        type="text"
                        placeholder="e.g. 30 days, 90 days"
                        value={medDuration}
                        onChange={(e) => setMedDuration(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="rx-instructions">Special Instructions</label>
                    <textarea
                      id="rx-instructions"
                      rows={3}
                      placeholder="e.g. Take with breakfast. Avoid dairy within 2 hours. Monitor blood pressure daily..."
                      value={medInstructions}
                      onChange={(e) => setMedInstructions(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    <Pill size={16} />
                    <span>Issue Prescription</span>
                  </button>
                </form>
              )}

              {activeSubTab === 'history' && (
                <div className="history-logs">
                  <div className="history-section">
                    <h3 className="section-subtitle">Diagnostic Reports Archive</h3>
                    {patientReports.length === 0 ? (
                      <div className="empty-state">No clinical reports published yet.</div>
                    ) : (
                      <div className="logs-grid">
                        {patientReports.map((rep) => (
                          <div key={rep.id} className="history-item-card glass-card">
                            <div className="history-item-header">
                              <span className="log-type-badge">{rep.type}</span>
                              <span className={`badge badge-${rep.status}`}>{rep.status}</span>
                            </div>
                            <h4>{rep.title}</h4>
                            <p className="summary-text">{rep.summary}</p>
                            <p className="date-stamp">
                              <Calendar size={12} />
                              <span>{rep.date}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="history-divider"></div>

                  <div className="history-section">
                    <h3 className="section-subtitle">Active Prescribed Medicines</h3>
                    {patientPrescriptions.length === 0 ? (
                      <div className="empty-state">No medications prescribed yet.</div>
                    ) : (
                      <div className="logs-grid">
                        {patientPrescriptions.map((rx) => (
                          <div key={rx.id} className="history-item-card glass-card">
                            <div className="history-item-header">
                              <span className="rx-medicine-title">
                                <Pill size={14} className="icon-cyan" />
                                <strong>{rx.medicineName}</strong> ({rx.dosage})
                              </span>
                              {/* Option to terminate medication for simulator functionality */}
                              <button 
                                className="action-delete"
                                onClick={() => handleDeletePrescription(rx.id)}
                                title="Discontinue Medication"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <p className="rx-detail">Frequency: {rx.frequency}</p>
                            <p className="rx-detail">Duration: {rx.duration}</p>
                            <p className="date-stamp">
                              <Calendar size={12} />
                              <span>Started: {rx.startDate}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state-workspace glass-panel">
            <AlertTriangle size={32} />
            <h3>No Active Patient Selected</h3>
            <p>Please click a patient profile in the sidebar list to retrieve clinical records.</p>
          </div>
        )}
      </main>

      {/* Register Patient Modal Overlay */}
      <AddPatientModal
        isOpen={showAddPatModal}
        onClose={() => setShowAddPatModal(false)}
        onRegister={handleRegisterPatient}
      />
    </div>
  );
}
