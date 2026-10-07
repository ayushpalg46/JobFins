import React, { useState, useEffect } from 'react';
import { jobService, applicationService } from '../services/api';

export default function RecruiterDashboard({ user, onOpenPostJob, onExtendOffer }) {
  const [myJobs, setMyJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'applicants'
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchRecruiterData();
  }, []);

  const fetchRecruiterData = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        jobService.getMyJobs(),
        applicationService.getAllApplicantsForRecruiter(),
      ]);
      setMyJobs(jobsRes.data || []);
      setApplicants(appsRes.data || []);
    } catch (err) {
      console.error('Error fetching recruiter data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await applicationService.updateStatus(applicationId, newStatus);
      setMessage({ type: 'success', text: `Application status updated to ${newStatus}!` });
      fetchRecruiterData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to update application status.' });
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    try {
      await jobService.deleteJob(jobId);
      setMessage({ type: 'success', text: 'Job listing deleted successfully.' });
      fetchRecruiterData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to delete job listing.' });
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-4 bg-white rounded-3 border shadow-sm">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white">Recruiter ATS Portal</span>
            <span className="response-sla-badge">
              <i className="bi bi-shield-check text-success"></i> Zero-Ghosting Verified Partner
            </span>
          </div>
          <h2 className="h4 mb-0 text-dark fw-bold">{user?.companyName || 'My Company'} - Talent Hub</h2>
          <small className="text-muted">Logged in as {user?.name} ({user?.email})</small>
        </div>
        <button className="btn btn-cobalt btn-sm px-3 shadow-sm fw-bold" onClick={onOpenPostJob}>
          <i className="bi bi-plus-circle me-1"></i> Post Tech Stack Opening
        </button>
      </div>

      {/* Recruiter Zero-Ghosting Response SLA Banner */}
      <div className="card border-0 shadow-sm rounded-3 mb-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF' }}>
        <div className="card-body p-3 p-md-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-success text-white">
                  <i className="bi bi-lightning-fill text-warning me-1"></i> 100% SLA On-Track
                </span>
                <span className="text-light opacity-90 small">Average Turnaround: <strong>1.4 Days</strong></span>
              </div>
              <h5 className="fw-bold text-white mb-1">Zero-Ghosting Employer Compliance</h5>
              <p className="text-light opacity-75 small mb-0">
                You are maintaining the <strong>"⚡ Replies &lt;48 Hours"</strong> badge. Review and update candidate statuses within 7 days to preserve top algorithmic ranking for your job listings.
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <span className="badge bg-dark border border-secondary text-info px-3 py-2 font-monospace">
                <i className="bi bi-code-square me-1"></i> Proof-Over-Paper ATS
              </span>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type} py-2 small alert-dismissible fade show`} role="alert">
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link fw-bold ${activeTab === 'jobs' ? 'active text-primary' : 'text-muted'}`}
            onClick={() => setActiveTab('jobs')}
          >
            <i className="bi bi-briefcase me-1"></i> My Active Tech Jobs ({myJobs.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold ${activeTab === 'applicants' ? 'active text-primary' : 'text-muted'}`}
            onClick={() => setActiveTab('applicants')}
          >
            <i className="bi bi-people me-1"></i> Proof-of-Work Applicants ({applicants.length})
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted mt-2 small">Loading your recruitment data from MySQL...</p>
        </div>
      ) : activeTab === 'jobs' ? (
        // Jobs Tab
        <div className="table-responsive bg-white rounded-3 border shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-uppercase">
              <tr>
                <th>Job Title & Stack</th>
                <th>Location</th>
                <th>Type</th>
                <th>Compensation</th>
                <th>SLA Badge</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myJobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No active job listings found. Click "Post Tech Stack Opening" to create your first listing!
                  </td>
                </tr>
              ) : (
                myJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <strong className="text-dark d-block">{job.title}</strong>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {job.requirements?.includes('Primary Tech Stack:') ? (
                          job.requirements.split('Primary Tech Stack:')[1]?.split('\n')[0]?.split(',').slice(0, 3).map((t, idx) => (
                            <span key={idx} className="tech-tag-cyber" style={{ fontSize: '0.68rem' }}>
                              {t.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="badge bg-light text-primary border" style={{ fontSize: '0.68rem' }}>
                            Developer Role
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <small className="text-muted">
                        <i className="bi bi-geo-alt text-muted me-1"></i>{job.location}
                      </small>
                    </td>
                    <td><span className="badge bg-light text-primary border">{job.jobType}</span></td>
                    <td className="text-success fw-semibold">{job.salary ? job.salary.replace(/\?(\s*\d)/g, '₹$1') : 'N/A'}</td>
                    <td>
                      {job.requirements?.includes('Fast Response: <48h') || job.requirements?.includes('<48h Reply') || job.requirements?.includes('Replies <48h') ? (
                        <span className="response-sla-badge">
                          <i className="bi bi-lightning-fill text-warning"></i> &lt;48h Reply
                        </span>
                      ) : (
                        <span className="badge bg-light text-muted border" style={{ fontSize: '0.7rem' }}>
                          Standard Review
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <button className="btn btn-outline-danger btn-sm py-1 px-2" onClick={() => handleDeleteJob(job.id)} title="Delete Job Listing">
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // Applicants Tab
        <div className="table-responsive bg-white rounded-3 border shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-uppercase">
              <tr>
                <th>Candidate</th>
                <th>Applied For</th>
                <th>Cover Letter & Resume</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th className="text-end">Update Status</th>
              </tr>
            </thead>
            <tbody>
              {applicants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No candidates have applied to your listings yet.
                  </td>
                </tr>
              ) : (
                applicants.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong className="text-dark">{app.seeker?.name}</strong>
                      <small className="text-muted d-block">{app.seeker?.email}</small>
                      <small className="text-muted d-block">{app.seeker?.contactNumber}</small>
                    </td>
                    <td>
                      <span className="fw-semibold text-primary">{app.job?.title}</span>
                    </td>
                    <td style={{ maxWidth: '340px' }}>
                      {/* Parse GitHub and Live Demo Links */}
                      {(() => {
                        const note = app.coverLetter || '';
                        const ghMatch = note.match(/\[GitHub Repo\]:\s*(https?:\/\/[^\s\n]+)/i);
                        const demoMatch = note.match(/\[Live Demo\]:\s*(https?:\/\/[^\s\n]+)/i);
                        const techMatch = note.match(/\[Tech Stack\]:\s*([^\n]+)/i);
                        const cleanNote = note
                          .replace(/\[GitHub Repo\]:[^\n]*\n?/gi, '')
                          .replace(/\[Live Demo\]:[^\n]*\n?/gi, '')
                          .replace(/\[Tech Stack\]:[^\n]*\n?/gi, '')
                          .trim();

                        return (
                          <div>
                            {/* Proof-of-Work Badges */}
                            <div className="d-flex flex-wrap gap-1 mb-1">
                              {ghMatch && (
                                <a
                                  href={ghMatch[1]}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="tech-tag-cyber text-decoration-none py-1 px-2"
                                  title="View Candidate GitHub Repository"
                                >
                                  <i className="bi bi-github"></i> GitHub Repo
                                </a>
                              )}
                              {demoMatch && (
                                <a
                                  href={demoMatch[1]}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="badge bg-primary text-white text-decoration-none py-1 px-2"
                                  style={{ fontSize: '0.72rem' }}
                                  title="Open Live Deployed Project"
                                >
                                  <i className="bi bi-box-arrow-up-right me-1"></i> Live Demo
                                </a>
                              )}
                              {techMatch && (
                                <span className="badge bg-light text-dark border py-1" style={{ fontSize: '0.7rem' }}>
                                  <i className="bi bi-layers me-1 text-primary"></i> {techMatch[1]}
                                </span>
                              )}
                            </div>

                            {cleanNote && (
                              <p className="small text-muted mb-1 text-truncate" title={cleanNote}>
                                {cleanNote}
                              </p>
                            )}

                            {app.resumeLink && (
                              app.resumeLink.startsWith('data:') ? (
                                <a
                                  href={app.resumeLink}
                                  download={`${(app.seeker?.name || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`}
                                  className="btn btn-outline-secondary btn-sm py-0 px-2 mt-1"
                                  style={{ fontSize: '0.72rem' }}
                                >
                                  <i className="bi bi-download me-1"></i> PDF Resume
                                </a>
                              ) : !ghMatch && app.resumeLink.includes('github.com') ? (
                                <a
                                  href={app.resumeLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="tech-tag-cyber text-decoration-none py-1 px-2"
                                >
                                  <i className="bi bi-github"></i> Candidate GitHub
                                </a>
                              ) : (
                                <a
                                  href={app.resumeLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-outline-secondary btn-sm py-0 px-2 mt-1"
                                  style={{ fontSize: '0.72rem' }}
                                >
                                  <i className="bi bi-file-earmark-pdf me-1"></i> View Attached Doc
                                </a>
                              )
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="small text-muted">{app.appliedDate?.substring(0, 10)}</td>
                    <td>
                      <span className={`badge ${
                        app.status === 'ACCEPTED' ? 'bg-success' :
                        app.status === 'SHORTLISTED' ? 'bg-primary' :
                        app.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')}
                          title="Shortlist Candidate"
                        >
                          Shortlist
                        </button>
                        <button
                          className="btn btn-outline-success"
                          onClick={() => handleStatusUpdate(app.id, 'ACCEPTED')}
                          title="Accept Candidate"
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-cobalt"
                          onClick={() =>
                            onExtendOffer &&
                            onExtendOffer({
                              id: app.id,
                              applicationId: app.id,
                              name: app.seeker?.name || 'Candidate',
                              role: app.job?.title || 'Software Engineer',
                              location: app.job?.location || 'Mumbai / Hybrid',
                              email: app.seeker?.email,
                            })
                          }
                          title="Extend Formal Offer"
                        >
                          <i className="bi bi-file-earmark-check me-1"></i> Offer
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                          title="Reject Candidate"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
