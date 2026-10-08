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

  // Determine recruiter proof requirement
  const getProofRequirementInfo = () => {
    const req = (job?.requirements || '').toLowerCase();
    
    // Check for "Proof of Work Required:" line first
    if (req.includes('proof of work required:')) {
      const line = req.split('\n').find((l) => l.includes('proof of work required:')) || '';
      
      if (line.includes('either') || line.includes('pdf resume') || line.includes('github repo or pdf') || line.includes('resume')) {
        return {
          type: 'GITHUB_OR_RESUME',
          title: 'Either GitHub Repo or PDF Resume',
          heading: 'GitHub Repo OR PDF Resume Application',
          tagline: 'You can apply with either a verified GitHub repository OR your PDF resume document.',
          badgeText: 'GitHub Repo or PDF Resume',
          badgeClass: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
          submitBtnText: 'Submit Application (Repo or Resume)',
        };
      }
      
      if (line.includes('live deployed') || line.includes('live demo') || line.includes('project url') || line.includes('url only')) {
        return {
          type: 'DEMO_ONLY',
          title: 'Live Deployed Project URL Required',
          heading: 'Live Deployed Project URL Application',
          tagline: 'Recruiter requires a working, public live deployed application or demo URL.',
          badgeText: 'Live Demo URL Required',
          badgeClass: 'bg-info-subtle text-info-emphasis border border-info-subtle',
          submitBtnText: 'Submit Live Demo Proof',
        };
      }
      
      if (line.includes('github repository required') || line.includes('github repo only') || (line.includes('github') && !line.includes('demo') && !line.includes('live'))) {
        return {
          type: 'GITHUB_ONLY',
          title: 'GitHub Repository Required',
          heading: 'GitHub Source Code Application',
          tagline: 'Recruiter evaluates your code architecture. A verified GitHub repository URL is required.',
          badgeText: 'GitHub Repo Required',
          badgeClass: 'bg-dark-subtle text-dark border border-secondary-subtle',
          submitBtnText: 'Submit GitHub Code Proof',
        };
      }
      
      if (line.includes('github') && (line.includes('demo') || line.includes('live'))) {
        return {
          type: 'GITHUB_AND_DEMO',
          title: 'GitHub Repository + Live Demo Required',
          heading: '"Proof Over Paper" Application',
          tagline: 'Get hired for what you\'ve actually built. Both your GitHub repo and a live deployed demo are required.',
          badgeText: 'GitHub + Live Demo Required',
          badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle',
          submitBtnText: 'Submit Proof Application (Code + Demo)',
        };
      }
    }

    // Generic fallback checks across full text
    if (req.includes('live deployed project url required') || req.includes('live deployed url only') || req.includes('live demo required')) {
      return {
        type: 'DEMO_ONLY',
        title: 'Live Deployed Project URL Required',
        heading: 'Live Deployed Project URL Application',
        tagline: 'Recruiter requires a working, public live deployed application or demo URL.',
        badgeText: 'Live Demo URL Required',
        badgeClass: 'bg-info-subtle text-info-emphasis border border-info-subtle',
        submitBtnText: 'Submit Live Demo Proof',
      };
    }
    
    if (req.includes('either github') || req.includes('github repo or pdf')) {
      return {
        type: 'GITHUB_OR_RESUME',
        title: 'Either GitHub Repo or PDF Resume',
        heading: 'GitHub Repo OR PDF Resume Application',
        tagline: 'You can apply with either a verified GitHub repository OR your PDF resume document.',
        badgeText: 'GitHub Repo or PDF Resume',
        badgeClass: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
        submitBtnText: 'Submit Application (Repo or Resume)',
      };
    }

    if (req.includes('github repository required') || req.includes('github repo only')) {
      return {
        type: 'GITHUB_ONLY',
        title: 'GitHub Repository Required',
        heading: 'GitHub Source Code Application',
        tagline: 'Recruiter evaluates your code architecture. A verified GitHub repository URL is required.',
        badgeText: 'GitHub Repo Required',
        badgeClass: 'bg-dark-subtle text-dark border border-secondary-subtle',
        submitBtnText: 'Submit GitHub Code Proof',
      };
    }

    // Default: Both code repo and demo
    return {
      type: 'GITHUB_AND_DEMO',
      title: 'GitHub Repository + Live Demo Required',
      heading: '"Proof Over Paper" Application',
      tagline: 'Get hired for what you\'ve actually built. Both your GitHub repo and a live deployed demo are required.',
      badgeText: 'GitHub + Live Demo Required',
      badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle',
      submitBtnText: 'Submit Proof Application (Code + Demo)',
    };
  };

  const proofInfo = getProofRequirementInfo();

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

    const hasResume = Boolean(attachedFileBase64 || resumeLink.trim() || (useProfileResume && (user?.resumeBase64 || user?.resumeUrl || user?.resumeFileName)));

    // Dynamic validations based on recruiter's proof requirement
    if (proofInfo.type === 'DEMO_ONLY') {
      if (!liveDemoUrl.trim()) {
        setFeedback({ type: 'danger', message: 'Live Deployed Project URL is required by the recruiter for this position.' });
        return;
      }
    } else if (proofInfo.type === 'GITHUB_ONLY') {
      if (!githubUrl.trim()) {
        setFeedback({ type: 'danger', message: 'GitHub Repository URL is required by the recruiter for this position.' });
        return;
      }
    } else if (proofInfo.type === 'GITHUB_AND_DEMO') {
      if (!githubUrl.trim()) {
        setFeedback({ type: 'danger', message: 'GitHub Repository URL is required by the recruiter for this position.' });
        return;
      }
      if (!liveDemoUrl.trim()) {
        setFeedback({ type: 'danger', message: 'Live Deployed Demo URL is required by the recruiter for this position.' });
        return;
      }
    } else if (proofInfo.type === 'GITHUB_OR_RESUME') {
      if (!githubUrl.trim() && !hasResume) {
        setFeedback({ type: 'danger', message: 'Please provide either a GitHub Repository URL OR upload/attach a Resume PDF to submit.' });
        return;
      }
    }

    let finalResume = '';
    if (attachedFileBase64) {
      finalResume = attachedFileBase64;
    } else if (resumeLink.trim()) {
      finalResume = resumeLink.trim();
    } else if (useProfileResume && (user?.resumeBase64 || user?.resumeUrl || user?.resumeFileName)) {
      finalResume = user.resumeBase64 || user.resumeUrl || user.resumeFileName;
    } else if (liveDemoUrl.trim()) {
      finalResume = liveDemoUrl.trim();
    } else if (githubUrl.trim()) {
      finalResume = githubUrl.trim();
    }

    // Build structured note
    let structuredNote = '';
    if (liveDemoUrl.trim()) structuredNote += `[Live Demo]: ${liveDemoUrl.trim()}\n`;
    if (githubUrl.trim()) structuredNote += `[GitHub Repo]: ${githubUrl.trim()}\n`;
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
  const hasFastResponse =
    job.fastResponse === true ||
    job.requirements?.includes('Fast Response: <48h') ||
    job.requirements?.includes('<48h Reply') ||
    job.requirements?.includes('Replies <48h') ||
    job.description?.includes('Fast Response: <48h');

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(10,25,47,0.6)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-3">
          {/* Header */}
          <div className="modal-header bg-white border-bottom py-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                <span className="tech-tag-cyber" style={{ fontSize: '0.7rem' }}>
                  <i className="bi bi-shield-check me-1 text-primary"></i> Verified Tech Role
                </span>
                <span className={`badge ${proofInfo.badgeClass}`} style={{ fontSize: '0.7rem' }}>
                  <i className="bi bi-patch-check-fill me-1"></i> {proofInfo.badgeText}
                </span>
                {hasFastResponse && (
                  <span className="response-sla-badge">
                    <i className="bi bi-lightning-fill text-warning"></i> &lt;48h Reply
                  </span>
                )}
              </div>
              <h5 className="modal-title fw-bold text-dark">{job.title}</h5>
              <div className="text-primary fw-semibold small">
                <i className="bi bi-building me-1"></i> {job.company} &bull; <i className="bi bi-geo-alt me-1"></i> {job.location}
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            <div className="row g-4">
              {/* Left Column: Job Info */}
              <div className="col-md-6">
                <h6 className="fw-bold text-dark mb-2">
                  <i className="bi bi-info-circle me-1 text-primary"></i> Role Overview
                </h6>
                <p className="text-muted small">{job.description}</p>

                <h6 className="fw-bold text-dark mt-4 mb-2">
                  <i className="bi bi-check2-square me-1 text-success"></i> Requirements & Tech Stack
                </h6>
                <div className="bg-light p-3 rounded border small text-muted">
                  <pre className="mb-0" style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>
                    {job.requirements || 'No specific requirements listed.'}
                  </pre>
                </div>

                <div className="mt-3 d-flex flex-wrap gap-3 small text-muted">
                  <span><strong>Job Type:</strong> {job.jobType}</span>
                  <span><strong>Compensation:</strong> {job.salary ? job.salary.replace(/\?(\s*\d)/g, '₹$1') : 'Competitive'}</span>
                  <span><strong>Location:</strong> {job.location || 'Remote'}</span>
                </div>
              </div>

              {/* Right Column: Dynamic Proof Over Paper Form */}
              <div className="col-md-6 border-start ps-md-4">
                {/* Dynamic Title & Tagline matching recruiter selection */}
                <div className="mb-3">
                  <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                    <i className="bi bi-code-slash text-primary"></i>
                    {proofInfo.heading}
                  </h6>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
                    {proofInfo.tagline}
                  </p>
                </div>

                {/* Recruiter Requirement Callout Badge Card */}
                <div className={`p-2 rounded mb-3 border ${
                  proofInfo.type === 'DEMO_ONLY' ? 'bg-info-subtle border-info-subtle text-info-emphasis' :
                  proofInfo.type === 'GITHUB_ONLY' ? 'bg-dark-subtle border-secondary-subtle text-dark' :
                  proofInfo.type === 'GITHUB_OR_RESUME' ? 'bg-warning-subtle border-warning-subtle text-warning-emphasis' :
                  'bg-primary-subtle border-primary-subtle text-primary-emphasis'
                }`}>
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="fw-bold" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-check-circle-fill me-1"></i> Recruiter Proof Rule:
                    </span>
                    <span className={`badge ${proofInfo.badgeClass}`} style={{ fontSize: '0.65rem' }}>
                      {proofInfo.badgeText}
                    </span>
                  </div>
                </div>

                {feedback && (
                  <div className={`alert alert-${feedback.type} py-2 small`}>
                    {feedback.message}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* CASE 1: DEMO ONLY - Show Live Deployed URL as Primary Top Field */}
                  {proofInfo.type === 'DEMO_ONLY' && (
                    <>
                      <div className="mb-3 p-2 bg-info-subtle border border-info-subtle rounded">
                        <label className="form-label small fw-bold mb-1 text-dark">
                          <i className="bi bi-globe me-1 text-primary"></i> Live Deployed Demo / Project URL <span className="text-danger">*</span>
                        </label>
                        <input
                          type="url"
                          className="form-control form-control-sm border-primary"
                          value={liveDemoUrl}
                          onChange={(e) => setLiveDemoUrl(e.target.value)}
                          placeholder="https://your-project.vercel.app"
                          required
                          autoFocus
                        />
                        <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                          Mandatory: Public URL where the recruiter can test your working project.
                        </small>
                      </div>

                      <div className="mb-2">
                        <label className="form-label small fw-bold mb-1 text-dark">
                          <i className="bi bi-github text-dark me-1"></i> GitHub Repository URL <span className="text-muted fw-normal small">(Optional)</span>
                        </label>
                        <input
                          type="url"
                          className="form-control form-control-sm font-monospace"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/your-handle/project-repo"
                        />
                      </div>
                    </>
                  )}

                  {/* CASE 2: GITHUB ONLY - Show GitHub URL as Primary Field */}
                  {proofInfo.type === 'GITHUB_ONLY' && (
                    <>
                      <div className="mb-3 p-2 bg-light border border-dark-subtle rounded">
                        <label className="form-label small fw-bold mb-1 text-dark">
                          <i className="bi bi-github text-dark me-1"></i> GitHub Repository URL <span className="text-danger">*</span>
                        </label>
                        <input
                          type="url"
                          className="form-control form-control-sm font-monospace border-dark"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/your-handle/project-repo"
                          required
                          autoFocus
                        />
                        <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                          Mandatory: Public repo verifying your framework implementation and code structure.
                        </small>
                      </div>

                      <div className="mb-2">
                        <label className="form-label small fw-bold mb-1 text-dark">
                          <i className="bi bi-globe me-1 text-primary"></i> Live Deployed Demo URL <span className="text-muted fw-normal small">(Optional)</span>
                        </label>
                        <input
                          type="url"
                          className="form-control form-control-sm"
                          value={liveDemoUrl}
                          onChange={(e) => setLiveDemoUrl(e.target.value)}
                          placeholder="https://your-project.vercel.app"
                        />
                      </div>
                    </>
                  )}

                  {/* CASE 3: GITHUB + LIVE DEMO REQUIRED - Both Fields Required */}
                  {proofInfo.type === 'GITHUB_AND_DEMO' && (
                    <>
                      <div className="mb-2">
                        <label className="form-label small fw-bold mb-1 text-dark">
                          <i className="bi bi-github text-dark me-1"></i> GitHub Repository URL <span className="text-danger">*</span>
                        </label>
                        <input
                          type="url"
                          className="form-control form-control-sm font-monospace"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/your-handle/project-repo"
                          required
                        />
                        <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                          Repository verifying your backend/frontend code implementation.
                        </small>
                      </div>

                      <div className="mb-2">
                        <label className="form-label small fw-bold mb-1 text-dark">
                          <i className="bi bi-globe me-1 text-primary"></i> Live Deployed Demo / Hackathon URL <span className="text-danger">*</span>
                        </label>
                        <input
                          type="url"
                          className="form-control form-control-sm"
                          value={liveDemoUrl}
                          onChange={(e) => setLiveDemoUrl(e.target.value)}
                          placeholder="https://your-project.vercel.app"
                          required
                        />
                        <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                          Live deployed link for recruiters to test the running project.
                        </small>
                      </div>
                    </>
                  )}

                  {/* CASE 4: EITHER GITHUB OR RESUME */}
                  {proofInfo.type === 'GITHUB_OR_RESUME' && (
                    <>
                      <div className="p-2 mb-2 bg-light rounded border">
                        <label className="form-label small fw-bold mb-1 text-dark">
                          <i className="bi bi-github text-dark me-1"></i> Option A: GitHub Repository URL{' '}
                          {!attachedFile && !resumeLink && !useProfileResume ? (
                            <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '0.65rem' }}>Provide Repo OR Resume</span>
                          ) : (
                            <span className="text-muted fw-normal small">(Optional)</span>
                          )}
                        </label>
                        <input
                          type="url"
                          className="form-control form-control-sm font-monospace"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/your-handle/project-repo"
                        />
                      </div>

                      <div className="mb-2">
                        <label className="form-label small fw-bold mb-1 text-dark">
                          <i className="bi bi-globe me-1 text-primary"></i> Live Deployed Demo URL <span className="text-muted fw-normal small">(Optional)</span>
                        </label>
                        <input
                          type="url"
                          className="form-control form-control-sm"
                          value={liveDemoUrl}
                          onChange={(e) => setLiveDemoUrl(e.target.value)}
                          placeholder="https://your-project.vercel.app"
                        />
                      </div>
                    </>
                  )}

                  {/* Tech Stack Field */}
                  <div className="mb-2">
                    <label className="form-label small fw-bold mb-1 text-dark">
                      <i className="bi bi-layers me-1 text-info"></i> Primary Tech Stack Used <span className="text-muted fw-normal small">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={techStackUsed}
                      onChange={(e) => setTechStackUsed(e.target.value)}
                      placeholder="e.g. Spring Boot, PostgreSQL, Docker, React"
                    />
                  </div>

                  {/* Architecture / Cover Note */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold mb-1 text-dark">
                      Architecture / Application Note <span className="text-muted fw-normal small">(Optional)</span>
                    </label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Briefly describe what you built and how it solves the engineering requirements..."
                    ></textarea>
                  </div>

                  {/* Supporting Document / PDF Section */}
                  <div className={`mb-3 p-2 rounded border ${proofInfo.type === 'GITHUB_OR_RESUME' ? 'bg-warning-subtle border-warning-subtle' : 'bg-light'}`}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small fw-bold mb-0 text-dark" style={{ fontSize: '0.72rem' }}>
                        <i className="bi bi-file-earmark-pdf me-1 text-danger"></i>
                        {proofInfo.type === 'GITHUB_OR_RESUME' ? (
                          <>
                            Option B: Resume PDF / Architecture Document{' '}
                            {!githubUrl.trim() && (
                              <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '0.65rem' }}>
                                Required if no GitHub URL
                              </span>
                            )}
                          </>
                        ) : (
                          'Optional Resume / Architecture PDF:'
                        )}
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
                      <small className="text-primary d-block mt-1 fw-semibold" style={{ fontSize: '0.72rem' }}>
                        <i className="bi bi-check-circle-fill me-1 text-success"></i> Attached: {attachedFile.name}
                      </small>
                    )}
                  </div>

                  <button type="submit" className="btn btn-cobalt w-100 btn-sm py-2 fw-bold shadow-sm" disabled={submitting}>
                    <i className="bi bi-send-check me-1"></i> {submitting ? 'Submitting Application...' : proofInfo.submitBtnText}
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
