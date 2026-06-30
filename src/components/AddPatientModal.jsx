import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AddPatientModal({ isOpen, onClose, onRegister }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [condition, setCondition] = useState('');
  const [avatar, setAvatar] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !age.trim() || !condition.trim()) return;

    onRegister({
      name: name.trim(),
      age: Number(age),
      condition: condition.trim(),
      avatar: avatar.trim()
    });

    // Reset fields
    setName('');
    setAge('');
    setCondition('');
    setAvatar('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card glass-panel glow-cyan animate-slide-up">
        <div className="modal-header">
          <h3>Register New Patient</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="composer-form">
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Age</label>
            <input
              type="number"
              placeholder="e.g. 45"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Primary Condition</label>
            <input
              type="text"
              placeholder="e.g. Chronic Kidney Disease"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Avatar Image URL (Optional)</label>
            <input
              type="url"
              placeholder="e.g. https://example.com/avatar.jpg"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>
          <div className="modal-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
