import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Heart, MessageCircle, Send, Award, Compass, HeartPulse, BrainCircuit, Apple, ShieldAlert, Sparkles } from 'lucide-react';
import './Community.css';

export default function Community() {
  const { currentUser, communityPosts, addCommunityPost, addComment, toggleLikePost, patients } = useContext(AppContext);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Composer states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newContent, setNewContent] = useState('');
  const [commentInputs, setCommentInputs] = useState({}); // { postId: text }
  const [expandedComments, setExpandedComments] = useState({}); // { postId: boolean }

  // Restrict access if current user is doctor (although nav hides it)
  if (currentUser && currentUser.role === 'doctor') {
    return (
      <div className="access-denied glass-panel glow-purple animate-fade-in">
        <ShieldAlert size={48} className="icon-purple" />
        <h2>Patient Community Board Access Denied</h2>
        <p>To preserve clinical boundaries and patient privacy, medical practitioners are excluded from the Patient Lounge.</p>
        <p className="hint">Tip: Use the navbar role switcher to act as a patient (e.g. John Doe) to test this panel.</p>
      </div>
    );
  }

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    addCommunityPost({
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim()
    });

    setNewTitle('');
    setNewContent('');
  };

  const handleCommentSubmit = (postId, e) => {
    e.preventDefault();
    const commentText = commentInputs[postId] || '';
    if (!commentText.trim()) return;

    addComment(postId, commentText.trim());
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const toggleCommentsExpansion = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentChange = (postId, text) => {
    setCommentInputs(prev => ({ ...prev, [postId]: text }));
  };

  const categories = [
    { name: 'All', icon: <Compass size={16} /> },
    { name: 'General', icon: <HeartPulse size={16} /> },
    { name: 'Mental Health', icon: <BrainCircuit size={16} /> },
    { name: 'Nutrition', icon: <Apple size={16} /> },
    { name: 'Recovery', icon: <Award size={16} /> }
  ];

  const filteredPosts = selectedCategory === 'All'
    ? communityPosts
    : communityPosts.filter(post => post.category === selectedCategory);

  const wellnessTips = [
    { id: 1, title: "Stay Hydrated", text: "Drinking 8-10 glasses of water daily keeps blood flow smooth and aids liver/kidney filters." },
    { id: 2, title: "Consistent Logs", text: "Logging your blood pressure or medication daily builds a vital chart for your next clinic check-up." },
    { id: 3, title: "Light Cardio", text: "A moderate 20-minute walk post-dinner helps steady glycemic blood glucose levels." }
  ];

  return (
    <div className="community-container animate-fade-in">
      {/* Category Navigation List */}
      <aside className="community-sidebar glass-panel">
        <h3 className="sidebar-title">Lounge Channels</h3>
        <div className="category-list">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`category-item ${selectedCategory === cat.name ? 'active glow-purple-btn' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Forum Feed stream */}
      <main className="community-feed">
        {/* Post Creator Panel */}
        <div className="post-composer glass-panel">
          <div className="composer-header">
            <Sparkles size={16} className="icon-purple" />
            <h3>Share with the Community</h3>
          </div>
          <form onSubmit={handlePostSubmit} className="composer-form">
            <div className="composer-row">
              <input
                type="text"
                placeholder="Topic Title (e.g. Salt-free soup recipes...)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option>General</option>
                <option>Mental Health</option>
                <option>Nutrition</option>
                <option>Recovery</option>
              </select>
            </div>
            <textarea
              placeholder="What is on your mind? Share tips, questions, or your recovery stories..."
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary btn-post-submit">
              <Send size={14} />
              <span>Publish to Lounge</span>
            </button>
          </form>
        </div>

        {/* Posts List */}
        <div className="posts-stream">
          {filteredPosts.length === 0 ? (
            <div className="empty-feed glass-card">
              <h3>No discussions found in #{selectedCategory}</h3>
              <p>Be the first to start a conversation in this topic lounge!</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const hasLiked = post.likes && Array.isArray(post.likes) && post.likes.includes(currentUser?.id);
              const isCommentsExpanded = !!expandedComments[post.id];
              const formattedTime = new Date(post.timestamp).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <article key={post.id} className="post-card glass-card">
                  {/* Post top header */}
                  <header className="post-header-top">
                    <div className="author-info">
                      <img src={post.authorAvatar} alt={post.authorName} className="author-avatar" />
                      <div>
                        <h4>{post.authorName}</h4>
                        <span className="post-time">{formattedTime}</span>
                      </div>
                    </div>
                    <span className="post-category-tag">{post.category}</span>
                  </header>

                  {/* Post title & content */}
                  <div className="post-main">
                    <h3>{post.title}</h3>
                    <p className="post-text">{post.content}</p>
                  </div>

                  {/* Likes and comments counts trigger */}
                  <footer className="post-actions">
                    <button 
                      className={`action-btn like-btn ${hasLiked ? 'liked' : ''}`}
                      onClick={() => toggleLikePost(post.id)}
                    >
                      <Heart size={16} fill={hasLiked ? "currentColor" : "none"} />
                      <span>{post.likes ? post.likes.length : 0} Likes</span>
                    </button>
                    
                    <button 
                      className="action-btn comment-btn"
                      onClick={() => toggleCommentsExpansion(post.id)}
                    >
                      <MessageCircle size={16} />
                      <span>{post.comments ? post.comments.length : 0} Comments</span>
                    </button>
                  </footer>

                  {/* Comments section toggle */}
                  {isCommentsExpanded && (
                    <div className="comments-section">
                      <div className="comments-divider"></div>
                      
                      {post.comments && Array.isArray(post.comments) && post.comments.length > 0 && (
                        <div className="comments-list">
                          {post.comments.map((comm) => (
                            <div key={comm.id} className="comment-item">
                              <img src={comm.authorAvatar} alt={comm.authorName} className="comment-avatar" />
                              <div className="comment-body">
                                <div className="comment-meta">
                                  <strong>{comm.authorName}</strong>
                                  <span className="comment-time">
                                    {new Date(comm.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="comment-text-content">{comm.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment input form */}
                      <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="comment-composer-form">
                        <input
                          type="text"
                          placeholder="Write a supportive reply..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => handleCommentChange(post.id, e.target.value)}
                        />
                        <button type="submit" className="btn btn-secondary btn-comment-send">
                          <Send size={12} />
                        </button>
                      </form>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </main>

      {/* Right Sidebar: Active Tips of the day + Online Users */}
      <aside className="community-right-sidebar glass-panel">
        <section className="members-widget">
          <h4 className="widget-title">Patients Online</h4>
          <div className="members-list">
            {patients.map((pat) => (
              <div key={pat.id} className="member-item">
                <div className="member-avatar-wrapper">
                  <img src={pat.avatar} alt={pat.name} className="member-avatar" />
                  <span className="active-dot"></span>
                </div>
                <span className="member-name">{pat.name}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="widget-divider"></div>

        <section className="tips-widget">
          <h4 className="widget-title">Wellness Insights</h4>
          <div className="tips-list">
            {wellnessTips.map((tip) => (
              <div key={tip.id} className="tip-card glass-card">
                <h5>{tip.title}</h5>
                <p>{tip.text}</p>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
