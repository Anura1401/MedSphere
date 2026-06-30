import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Send, Phone, Video, Search, MessageSquare, PlusCircle, CheckCircle, Shield } from 'lucide-react';
import './Chat.css';

export default function Chat() {
  const { currentUser, doctorUser, patients, chats, sendMessage } = useContext(AppContext);
  
  // If doctor, they select which patient thread is active
  const [activePatientId, setActivePatientId] = useState(() => {
    return patients[0]?.id || '';
  });
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  // Determine current context settings
  const isDoctor = currentUser.role === 'doctor';
  const activeChatPartnerId = isDoctor ? activePatientId : doctorUser.id;
  const activeChatPartner = isDoctor 
    ? patients.find(p => p.id === activePatientId)
    : doctorUser;

  // Filter messages exchanged between current user and the chat partner
  const activeMessages = chats.filter((msg) => {
    return (msg.senderId === currentUser.id && msg.receiverId === activeChatPartnerId) ||
           (msg.senderId === activeChatPartnerId && msg.receiverId === currentUser.id);
  });

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChatPartnerId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(currentUser.id, activeChatPartnerId, inputText.trim());
    setInputText('');
  };

  const handleQuickReply = (text) => {
    sendMessage(currentUser.id, activeChatPartnerId, text);
  };

  const quickReplies = [
    "I took my medication today.",
    "No side effects experienced so far.",
    "Could you review my cholesterol report?",
    "Do I take Metformin with food?"
  ];

  return (
    <div className="chat-container glass-panel animate-fade-in">
      {/* Sidebar - Doctor Only: Shows Patient Roster with Active Chats */}
      {isDoctor && (
        <aside className="chat-sidebar">
          <div className="sidebar-search">
            <Search size={16} />
            <input type="text" placeholder="Search direct messages..." disabled />
          </div>
          <div className="threads-list">
            {patients.map((pat) => {
              const lastMessage = chats
                .filter(m => (m.senderId === pat.id && m.receiverId === doctorUser.id) || (m.senderId === doctorUser.id && m.receiverId === pat.id))
                .slice(-1)[0];
              
              return (
                <button
                  key={pat.id}
                  className={`thread-item ${activePatientId === pat.id ? 'active' : ''}`}
                  onClick={() => setActivePatientId(pat.id)}
                >
                  <img src={pat.avatar} alt={pat.name} className="thread-avatar" />
                  <div className="thread-details">
                    <div className="thread-header">
                      <span className="name">{pat.name}</span>
                      {lastMessage && (
                        <span className="time">
                          {new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="last-message">
                      {lastMessage ? lastMessage.text : "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {/* Main Messaging Hub */}
      <main className="chat-window">
        {activeChatPartner ? (
          <>
            {/* Header info */}
            <header className="chat-header">
              <div className="partner-profile">
                <div className="avatar-status-container">
                  <img src={activeChatPartner.avatar} alt={activeChatPartner.name} className="partner-avatar" />
                  <span className="status-dot"></span>
                </div>
                <div className="partner-info">
                  <h3>{activeChatPartner.name}</h3>
                  <p className="specialty">
                    {isDoctor ? activeChatPartner.condition : activeChatPartner.specialty}
                  </p>
                </div>
              </div>
              <div className="chat-header-actions">
                <button className="icon-btn" title="Simulated Call"><Phone size={18} /></button>
                <button className="icon-btn" title="Simulated Teleconsultation"><Video size={18} /></button>
              </div>
            </header>

            {/* Conversation list */}
            <div className="messages-thread">
              {activeMessages.length === 0 ? (
                <div className="empty-chat animate-fade-in">
                  <MessageSquare size={36} className="empty-icon" />
                  <h3>Consultation Started</h3>
                  <p>Send a secure message to {activeChatPartner.name} to begin your medical inquiry.</p>
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isOwn = msg.senderId === currentUser.id;
                  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={msg.id} className={`message-bubble-wrapper ${isOwn ? 'own' : 'partner'}`}>
                      {!isOwn && (
                        <img src={activeChatPartner.avatar} alt={activeChatPartner.name} className="bubble-avatar" />
                      )}
                      <div className="bubble-content-wrapper">
                        <div className="bubble-text">{msg.text}</div>
                        <span className="bubble-time">{time}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick replies for Patient */}
            {!isDoctor && activeMessages.length > 0 && (
              <div className="quick-replies-tray">
                {quickReplies.map((replyText, idx) => (
                  <button
                    key={idx}
                    className="quick-reply-chip"
                    onClick={() => handleQuickReply(replyText)}
                  >
                    {replyText}
                  </button>
                ))}
              </div>
            )}

            {/* Message composer */}
            <form onSubmit={handleSend} className="message-composer">
              <input
                type="text"
                placeholder={isDoctor ? `Write clinical response to ${activeChatPartner.name}...` : "Consult Doctor Jenkins (e.g. log doses, ask symptoms)..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit" className="btn btn-primary send-btn" aria-label="Send message">
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="empty-chat flex-grow flex-center">
            <h3>No conversation selected</h3>
          </div>
        )}
      </main>
    </div>
  );
}
