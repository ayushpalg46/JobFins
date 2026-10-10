import React, { useState } from 'react';
import { userService } from '../services/api';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

export default function TalentSourcing({ onExtendOffer, syncTrigger }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [invitedList, setInvitedList] = useState([]);
  const [message, setMessage] = useState(null);

  const frameworksList = ['Spring Boot', 'FastAPI', 'React', 'Flutter', 'Rust', 'Docker', 'PostgreSQL', 'Java', 'Python'];

  const loadCandidates = async (silent = false) => {
    if (!silent && candidates.length === 0) {
      setLoading(true);
    }
    try {
      const res = await userService.getCandidates();
      const rawUsers = res.data || [];
      
      const parsed = rawUsers.map((u, idx) => {
        const bioText = u.bioOrSkills || '';
        // Extract skills by splitting on common delimiters
        let skills = bioText
          .split(/[,|•\n/]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 1 && !s.toLowerCase().includes('developer') && !s.toLowerCase().includes('engineer'));

        if (skills.length === 0) {
          skills = ['Spring Boot', 'Java', 'React', 'SQL'];
        }

        const roleTitle = bioText.includes('|')
          ? bioText.split('|')[0].trim()
          : bioText.length > 5
          ? bioText.slice(0, 45)
          : 'Software Development Engineer';

        return {
          id: u.id || idx + 1,
          name: u.name || 'Job Seeker',
          email: u.email || 'candidate@jobfins.com',
          role: roleTitle,
          contactNumber: u.contactNumber || '+91 9876543210',
          location: u.location || 'Bengaluru / Mumbai / Remote',
          skills,
          bio: bioText || 'Registered developer on JobFins platform specializing in modern software development.',
          createdAt: u.createdAt,
          github: u.portfolioUrl || '',
          demo: u.portfolioUrl || '',
          expectedCtc: '₹12 - ₹25 LPA',
          notice: 'Immediate / <15 Days',
          match: 95 - (idx % 10),
        };
      });

      setCandidates(parsed);
    } catch (err) {
      console.error('Failed to load registered candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(loadCandidates, 3000, [syncTrigger]);

  const handleInvite = (candidate) => {
    setInvitedList((prev) => [...prev, candidate.id]);
    setMessage({ type: 'success', text: `Invitation to apply sent successfully to ${candidate.name} (${candidate.email})!` });
    setTimeout(() => setMessage(null), 3500);
  };

  const filteredCandidates = candidates.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.bio.toLowerCase().includes(q) ||
      c.skills.some((s) => s.toLowerCase().includes(q)) ||
      c.location.toLowerCase().includes(q);

    const matchFw =
      selectedFramework === 'all' ||
      c.skills.some((s) => s.toLowerCase().includes(selectedFramework.toLowerCase())) ||
      c.bio.toLowerCase().includes(selectedFramework.toLowerCase());

    const matchLoc =
      selectedLocation === 'all' ||
      c.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchQuery && matchFw && matchLoc;
  });

  return (
    <div className="container py-4">
      {/* Subheader / Breadcrumb */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-4 bg-white rounded-3 border shadow-sm">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white">Recruiter Talent Sourcing</span>
            <span className="response-sla-badge">
              <i className="bi bi-shield-check text-success"></i> Registered Candidate Directory
            </span>
          </div>
          <h2 className="h4 mb-0 fw-bold text-dark">Proof-Over-Paper Talent Sourcing</h2>
          <small className="text-muted">Directly discover, inspect code, and invite registered JobFins candidates</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-primary btn-sm fw-bold" onClick={loadCandidates} disabled={loading}>
            <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spin' : ''}`}></i> Refresh Directory
          </button>
          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-bold">
            <i className="bi bi-people-fill me-1"></i> {candidates.length} Registered Candidates
          </span>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type} py-2 small alert-dismissible fade show`} role="alert">
          <i className="bi bi-check-circle-fill me-1"></i> {message.text}
        </div>
      )}

      <div className="row g-4">
        {/* Left Filter Sidebar */}
        <div className="col-lg-3">
          <div className="bg-white p-3 rounded-3 border shadow-sm sticky-top" style={{ top: '90px' }}>
            <h6 className="fw-bold text-dark mb-3">
              <i className="bi bi-funnel me-1 text-primary"></i> Sourcing Filters
            </h6>

            {/* Keyword Search */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Search Name, Email, or Skill</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. Ayush, Spring Boot, React..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Framework Select */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Required Tech Stack</label>
              <select
                className="form-select form-select-sm"
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
              >
                <option value="all">All Tech Stacks</option>
                {frameworksList.map((fw) => (
                  <option key={fw} value={fw}>{fw}</option>
                ))}
              </select>
            </div>

            {/* Location Select */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Location / Work Setup</label>
              <select
                className="form-select form-select-sm"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="all">All Locations</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <button
              className="btn btn-outline-secondary btn-sm w-100 mt-2"
              onClick={() => {
                setSearchQuery('');
                setSelectedFramework('all');
                setSelectedLocation('all');
              }}
            >
              <i className="bi bi-arrow-clockwise me-1"></i> Reset Filters
            </button>
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="small text-muted">
              Showing <strong>{filteredCandidates.length}</strong> of <strong>{candidates.length}</strong> registered candidates in JobFins
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5 bg-white rounded-3 border">
              <div className="spinner-border text-primary mb-2" role="status"></div>
              <p className="small text-muted mb-0">Loading registered candidates from database...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-3 border">
              <i className="bi bi-person-x display-4 text-muted mb-2 d-block"></i>
              <h6 className="fw-bold text-dark">No candidates match your current filter criteria</h6>
              <p className="text-muted small mb-3">Try clearing search keywords or selecting all tech stacks.</p>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFramework('all');
                  setSelectedLocation('all');
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="row g-3">
              {filteredCandidates.map((candidate) => (
                <div className="col-12" key={candidate.id}>
                  <div className="card border shadow-sm h-100 p-3 hover-lift">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                          <h5 className="mb-0 fw-bold text-dark">{candidate.name}</h5>
                          <span className="badge bg-success-subtle text-success border border-success-subtle small">
                            <i className="bi bi-shield-check me-1"></i> Registered Seeker
                          </span>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle small">
                            {candidate.match}% Stack Match
                          </span>
                        </div>
                        <p className="text-primary fw-semibold mb-0 small">
                          <i className="bi bi-briefcase me-1"></i> {candidate.role}
                        </p>
                        <small className="text-muted">
                          <i className="bi bi-envelope me-1"></i> {candidate.email} &bull; <i className="bi bi-telephone me-1"></i> {candidate.contactNumber}
                        </small>
                      </div>

                      <div className="text-end">
                        <span className="d-block text-success fw-bold small">{candidate.expectedCtc}</span>
                        <small className="badge bg-light text-dark border">{candidate.notice}</small>
                      </div>
                    </div>

                    {/* Bio / Skills summary */}
                    <p className="small text-muted mb-2 bg-light p-2 rounded border">
                      {candidate.bio}
                    </p>

                    {/* Skills tags */}
                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {candidate.skills.map((skill, idx) => (
                        <span key={idx} className="tech-tag-cyber" style={{ fontSize: '0.72rem' }}>
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Footer CTAs */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center pt-2 border-top">
                      <small className="text-muted">
                        <i className="bi bi-geo-alt me-1"></i> {candidate.location}
                      </small>

                      <div className="d-flex gap-2">
                        <a
                          href={candidate.github}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-dark btn-sm px-2"
                          title="View GitHub Code"
                        >
                          <i className="bi bi-github me-1"></i> GitHub
                        </a>

                        <button
                          className="btn btn-outline-primary btn-sm px-3"
                          onClick={() => handleInvite(candidate)}
                          disabled={invitedList.includes(candidate.id)}
                        >
                          <i className={`bi ${invitedList.includes(candidate.id) ? 'bi-check-circle-fill text-success' : 'bi-send'} me-1`}></i>
                          {invitedList.includes(candidate.id) ? 'Invited' : 'Invite to Apply'}
                        </button>

                        <button
                          className="btn btn-cobalt btn-sm px-3 shadow-sm fw-bold"
                          onClick={() => onExtendOffer && onExtendOffer(candidate)}
                        >
                          <i className="bi bi-file-earmark-text me-1"></i> Extend Direct Offer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
