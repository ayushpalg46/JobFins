import React, { useState } from 'react';

export default function JobDetailsModal({ job, isOpen, onClose, onApplySubmit, user }) {
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [techStackUsed, setTechStackUsed] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedFileBase64, setAttachedFileBase64] = useState('');
  const [useProfileResume, setUseProfileResume] = useState(Boolean(user?.resumeFileName || user?.resumeBase64 || user?.resumeUrl));
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen || !job) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'danger', message: 'File size exceeds 5MB limit. Please upload a smaller document.' });
      return;
    }
    setAttachedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFileBase64(reader.result);
      setUseProfileResume(false);
      setFeedback(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setFeedback({ type: 'danger', message: 'Please sign in as a Job Seeker to apply for this position.' });
      return;
    }
    if (user.role !== 'ROLE_SEEKER') {
      setFeedback({ type: 'warning', message: 'Recruiters cannot apply for jobs. Please log in as a Job Seeker.' });
      return;
    }

    if (!githubUrl.trim() && !attachedFileBase64 && !resumeLink.trim() && !useProfileResume) {
      setFeedback({ type: 'danger', message: 'Please provide either a GitHub Repository URL (Proof of Work) or a Resume attachment.' });
      return;
    }

    let finalResume = '';
    if (attachedFileBase64) {
      finalResume = attachedFileBase64;
    } else if (resumeLink.trim()) {
      finalResume = resumeLink.trim();
    } else if (useProfileResume && (user?.resumeBase64 || user?.resumeUrl || user?.resumeFileName)) {
      finalResume = user.resumeBase64 || user.resumeUrl || user.resumeFileName;
    } else if (githubUrl.trim()) {
      finalResume = githubUrl.trim();
    }

    // Build structured note including GitHub & Live Demo
    let structuredNote = '';
    if (githubUrl.trim()) structuredNote += `[GitHub Repo]: ${githubUrl.trim()}\n`;
    if (liveDemoUrl.trim()) structuredNote += `[Live Demo]: ${liveDemoUrl.trim()}\n`;
    if (techStackUsed.trim()) structuredNote += `[Tech Stack]: ${techStackUsed.trim()}\n\n`;
    structuredNote += coverLetter.trim();

    setSubmitting(true);
    setFeedback(null);
    try {
      await onApplySubmit(job.id, { coverLetter: structuredNote, resumeLink: finalResume });
      setFeedback({ type: 'success', message: 'Application & Proof of Work submitted successfully to employer!' });
      setGithubUrl('');
      setLiveDemoUrl('');
      setTechStackUsed('');
      setCoverLetter('');
      setResumeLink('');
      setAttachedFile(null);
      setAttachedFileBase64('');
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1800);
    } catch (err) {
      setFeedback({ type: 'danger', message: err.response?.data?.message || 'Failed to submit application. You may have already applied!' });
    } finally {
      setSubmitting(false);
    }
  };

  const hasProfileResume = Boolean(user?.resumeFileName || user?.resumeBase64 || user?.resumeUrl);

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(10,25,47,0.6)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-dark text-cyan tech-tag-cyber" style={{ fontSize: '0.7rem' }}>
                  <i className="bi bi-shield-check me-1 text-info"></i> Zero Ghosting Verified
                </span>
                <span className="response-sla-badge">
                  <i className="bi bi-lightning-fill text-warning"></i> Replies &lt;48 Hours
                </span>
              </div>
              <h5 className="modal-title fw-bold text-dark">{job.title}</h5>
              <div className="text-primary fw-semibold small">
                <i className="bi bi-building me-1"></i> {job.company} &bull; <i className="bi bi-geo-alt me-1"></i> {job.location}
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="row g-4">
              <div className="col-md-6">
                <h6 className="fw-bold text-dark mb-2"><i className="bi bi-info-circle me-1 text-primary"></i> Role Overview</h6>
                <p className="text-muted small">{job.description}</p>

                <h6 className="fw-bold text-dark mt-4 mb-2"><i className="bi bi-check2-square me-1 text-success"></i> Requirements & Tech Stack</h6>
                <div className="bg-light p-3 rounded border small text-muted">
                  <pre className="mb-0" style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>{job.requirements || 'No specific requirements listed.'}</pre>
                </div>

                <div className="mt-3 d-flex flex-wrap gap-3 small text-muted">
                  <span><strong>Job Type:</strong> {job.jobType}</span>
                  <span><strong>Compensation:</strong> {job.salary ? job.salary.replace(/\?(\s*\d)/g, '₹$1') : 'Competitive'}</span>
                  <span><strong>Transit Commute:</strong> {job.location || 'Remote'}</span>
                </div>
              </div>

              <div className="col-md-6 border-start">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="fw-bold text-dark mb-0"><i className="bi bi-code-slash me-1 text-primary"></i> "Proof Over Paper" Application</h6>
                </div>
                <p className="text-muted small mb-3" style={{ fontSize: '0.78rem' }}>
                  Get hired for what you've actually built. Share your code repo and live project demo.
                </p>

                {feedback && (
                  <div className={`alert alert-${feedback.type} py-2 small`}>
                    {feedback.message}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Proof 1: GitHub Repo URL */}
                  <div className="mb-2">
                    <label className="form-label small fw-bold mb-1 text-dark">
                      <i className="bi bi-github text-dark me-1"></i> GitHub Repository URL *
                    </label>
                    <input
                      type="url"
                      className="form-control form-control-sm font-monospace"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/your-handle/project-repo"
                    />
                    <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                      Repository verifying your framework capability (e.g., Spring Boot, FastAPI, React).
                    </small>
                  </div>

                  {/* Proof 2: Live Deployed Demo URL */}
                  <div className="mb-2">
                    <label className="form-label small fw-bold mb-1 text-dark">
                      <i className="bi bi-globe me-1 text-primary"></i> Live Deployed Demo / Hackathon URL
                    </label>
                    <input
                      type="url"
                      className="form-control form-control-sm"
                      value={liveDemoUrl}
                      onChange={(e) => setLiveDemoUrl(e.target.value)}
                      placeholder="https://your-project.vercel.app"
                    />
                  </div>

                  {/* Proof 3: Frameworks Used */}
                  <div className="mb-2">
                    <label className="form-label small fw-bold mb-1 text-dark">
                      <i className="bi bi-layers me-1 text-info"></i> Primary Tech Stack Used
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={techStackUsed}
                      onChange={(e) => setTechStackUsed(e.target.value)}
                      placeholder="e.g. Spring Boot, PostgreSQL, Docker, React"
                    />
                  </div>

                  {/* Cover Note */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold mb-1">Architecture / Application Note</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Briefly describe what you built and how it solves the engineering requirements..."
                    ></textarea>
                  </div>

                  {/* Supporting Document / PDF */}
                  <div className="mb-3 p-2 bg-light rounded border">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small fw-bold mb-0 text-muted" style={{ fontSize: '0.72rem' }}>
                        <i className="bi bi-file-earmark-pdf me-1"></i> Optional Resume / Architecture PDF:
                      </label>
                      {hasProfileResume && (
                        <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.65rem' }}>
                          Profile Resume Linked
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                    {attachedFile && (
                      <small className="text-primary d-block mt-1" style={{ fontSize: '0.72rem' }}>
                        <i className="bi bi-check-circle-fill me-1"></i> Attached: {attachedFile.name}
                      </small>
                    )}
                  </div>

                  <button type="submit" className="btn btn-cobalt w-100 btn-sm py-2 fw-bold shadow-sm" disabled={submitting}>
                    <i className="bi bi-send-check me-1"></i> {submitting ? 'Submitting Application...' : 'Submit Proof Application'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

