import React, { useState, useEffect } from 'react';
import { careerTipsService } from '../services/api';

export default function CareerTips({ user, onOpenLogin }) {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [likedTips, setLikedTips] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jobfins_liked_tips') || '[]');
    } catch {
      return [];
    }
  });
  const [bookmarkedTips, setBookmarkedTips] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jobfins_bookmarked_tips') || '[]');
    } catch {
      return [];
    }
  });

  // Post form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Technical Interview Prep');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const categories = [
    { id: 'all', label: 'All Insights' },
    { id: 'Technical Interview Prep', label: 'Technical Interview Prep' },
    { id: 'Resume & Portfolio', label: 'Resume & Portfolio' },
    { id: 'Offer & Salary Negotiation', label: 'Salary & Offer Negotiation' },
    { id: 'System Design & Microservices', label: 'System Design & Architecture' },
    { id: 'Hiring Manager Insights', label: 'Hiring Manager Insights' },
    { id: 'Engineering Culture', label: 'Engineering Culture' },
  ];

  const loadTips = async () => {
    setLoading(true);
    try {
      const res = await careerTipsService.getAllTips();
      setTips(res.data || []);
    } catch (err) {
      console.error('Failed to load career tips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTips();
  }, []);

  const handleLike = async (tipId) => {
    try {
      const res = await careerTipsService.likeTip(tipId);
      const updated = res.data;
      setTips((prev) => prev.map((t) => (t.id === tipId ? { ...t, likesCount: updated.likesCount } : t)));
      
      const newLiked = [...likedTips, tipId];
      setLikedTips(newLiked);
      localStorage.setItem('jobfins_liked_tips', JSON.stringify(newLiked));
    } catch (err) {
      console.error('Failed to like tip:', err);
    }
  };

  const toggleBookmark = (tipId) => {
    let updated;
    if (bookmarkedTips.includes(tipId)) {
      updated = bookmarkedTips.filter((id) => id !== tipId);
    } else {
      updated = [...bookmarkedTips, tipId];
    }
    setBookmarkedTips(updated);
    localStorage.setItem('jobfins_bookmarked_tips', JSON.stringify(updated));
  };

  const handlePostTip = async (e) => {
    e.preventDefault();
    if (!user) {
      setFeedback({ type: 'danger', message: 'Please log in to share a career tip.' });
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) {
      setFeedback({ type: 'danger', message: 'Title and content are required.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        title: newTitle.trim(),
        category: newCategory,
        summary: newSummary.trim() || newTitle.trim(),
        content: newContent.trim(),
        authorName: user.name || (user.role === 'ROLE_RECRUITER' ? 'Recruiter' : 'Candidate'),
        authorRole: user.role || 'ROLE_SEEKER',
        authorCompany: user.companyName || null,
        authorEmail: user.email || null,
      };

      const res = await careerTipsService.createTip(payload);
      setTips((prev) => [res.data, ...prev]);
      setFeedback({ type: 'success', message: 'Career tip published successfully to the community!' });
      setNewTitle('');
      setNewSummary('');
      setNewContent('');
      setTimeout(() => {
        setShowPostModal(false);
        setFeedback(null);
      }, 1500);
    } catch (err) {
      setFeedback({ type: 'danger', message: err.response?.data?.message || 'Failed to publish tip.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTips = tips.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchCategory = activeCategory === 'all' || t.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchQuery =
      !q ||
      t.title?.toLowerCase().includes(q) ||
      t.summary?.toLowerCase().includes(q) ||
      t.content?.toLowerCase().includes(q) ||
      t.authorName?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q);

    return matchCategory && matchQuery;
  });

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="p-4 p-md-5 bg-white rounded-3 border shadow-sm mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-primary text-white">Community Knowledge Base</span>
              <span className="response-sla-badge">
                <i className="bi bi-people-fill text-success"></i> Open to Recruiters & Candidates
              </span>
            </div>
            <h2 className="display-6 fw-bold text-dark mb-2">Career Advice, Interview Guides & Hiring Insights</h2>
            <p className="text-muted mb-0" style={{ maxWidth: '720px' }}>
              Shared knowledge from tech recruiters, engineering managers, and fellow software developers across the JobFins community.
            </p>
          </div>

          <div>
            <button
              className="btn btn-cobalt shadow-sm fw-bold px-4 py-2"
              onClick={() => {
                if (!user) {
                  onOpenLogin && onOpenLogin();
                } else {
                  setShowPostModal(true);
                }
              }}
            >
              <i className="bi bi-plus-circle me-1"></i> Share Career Tip / Guide
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="row g-3 align-items-center mb-4">
        <div className="col-md-7">
          <div className="d-flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`btn btn-sm ${activeCategory === cat.id ? 'btn-cobalt' : 'btn-outline-custom'}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="col-md-5">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search guides, authors, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="btn btn-outline-secondary" onClick={() => setSearchQuery('')}>
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="text-center py-5 bg-white rounded-3 border">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <p className="small text-muted mb-0">Loading community career tips...</p>
        </div>
      ) : filteredTips.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-3 border shadow-sm">
          <i className="bi bi-lightbulb display-5 text-muted mb-2 d-block"></i>
          <h5 className="fw-bold text-dark">No career tips found for this filter</h5>
          <p className="text-muted small mb-3">Be the first recruiter or developer to share knowledge on this topic!</p>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              if (!user) onOpenLogin && onOpenLogin();
              else setShowPostModal(true);
            }}
          >
            <i className="bi bi-plus-circle me-1"></i> Post the First Tip
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {filteredTips.map((tip) => {
            const isRecruiter = tip.authorRole === 'ROLE_RECRUITER';
            const isLiked = likedTips.includes(tip.id);
            const isBookmarked = bookmarkedTips.includes(tip.id);

            return (
              <div className="col-lg-6" key={tip.id}>
                <div className="card h-100 border shadow-sm rounded-3 overflow-hidden hover-lift">
                  <div className="card-header bg-white p-4 border-bottom">
                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                      <span className="badge bg-light text-primary border">{tip.category}</span>
                      
                      {/* Author badge */}
                      {isRecruiter ? (
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.72rem' }}>
                          <i className="bi bi-building me-1"></i> Recruiter: {tip.authorCompany || tip.authorName}
                        </span>
                      ) : (
                        <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.72rem' }}>
                          <i className="bi bi-person-check-fill me-1"></i> Developer: {tip.authorName}
                        </span>
                      )}
                    </div>

                    <h5 className="fw-bold text-dark mb-2">{tip.title}</h5>
                    {tip.summary && <p className="text-muted small mb-0">{tip.summary}</p>}
                  </div>

                  <div className="card-body p-4 bg-light">
                    <h6 className="fw-bold text-dark small text-uppercase mb-2">Key Guidance & Takeaways:</h6>
                    <div className="small text-muted mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {tip.content}
                    </div>
                  </div>

                  <div className="card-footer bg-white p-3 border-top d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <button
                        className={`btn btn-sm ${isLiked ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => handleLike(tip.id)}
                        title="Helpful Tip"
                      >
                        <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>
                        {tip.likesCount || 0} Helpful
                      </button>
                      <button
                        className={`btn btn-sm ${isBookmarked ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
                        onClick={() => toggleBookmark(tip.id)}
                        title="Save to reading list"
                      >
                        <i className={`bi ${isBookmarked ? 'bi-bookmark-fill' : 'bi-bookmark'} me-1`}></i>
                        {isBookmarked ? 'Saved' : 'Save'}
                      </button>
                    </div>

                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                      By <strong>{tip.authorName}</strong> &bull; {tip.createdAt ? new Date(tip.createdAt).toLocaleDateString() : 'Recent'}
                    </small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Career Tip Modal */}
      {showPostModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(10,25,47,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-white border-bottom py-3">
                <div>
                  <h5 className="modal-title fw-bold text-dark">
                    <i className="bi bi-lightbulb-fill text-warning me-2"></i> Share Career Advice or Guide
                  </h5>
                  <small className="text-muted">
                    Publish insights visible to all recruiters and job seekers on JobFins
                  </small>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowPostModal(false)}></button>
              </div>

              <div className="modal-body p-4">
                {feedback && (
                  <div className={`alert alert-${feedback.type} py-2 small mb-3`}>
                    {feedback.message}
                  </div>
                )}

                {/* Author Info Callout */}
                <div className="p-2 mb-3 bg-light rounded border small d-flex align-items-center justify-content-between">
                  <div>
                    <strong>Posting As:</strong> {user?.name} ({user?.role === 'ROLE_RECRUITER' ? 'Recruiter' : 'Candidate'})
                  </div>
                  {user?.companyName && (
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                      {user.companyName}
                    </span>
                  )}
                </div>

                <form onSubmit={handlePostTip}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">
                      Article / Tip Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. 5 System Design Questions I Ask Spring Boot Developers"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">Category</label>
                      <select
                        className="form-select form-select-sm"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      >
                        {categories.filter((c) => c.id !== 'all').map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">Summary / Tagline (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Brief 1-sentence summary"
                        value={newSummary}
                        onChange={(e) => setNewSummary(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">
                      Key Takeaways, Guide & Insights <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="6"
                      placeholder="Share detailed advice, code tips, preparation steps, or hiring perspectives..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm px-3"
                      onClick={() => setShowPostModal(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-cobalt btn-sm px-4 fw-bold shadow-sm"
                      disabled={submitting}
                    >
                      <i className="bi bi-send me-1"></i> {submitting ? 'Publishing...' : 'Publish Career Tip'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
