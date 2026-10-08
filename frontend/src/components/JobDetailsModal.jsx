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
    const line = req.split('\n').find((l) => l.includes('proof of work required:')) || req;

    if (line.includes('either') || line.includes('pdf resume') || line.includes('github repo or pdf') || line.includes('resume')) {
      return {
        type: 'GITHUB_OR_RESUME',
        heading: 'GitHub Repo OR PDF Resume Application',
        tagline: 'You can apply with either a verified GitHub repository OR your PDF resume document.',
        badgeText: 'GitHub Repo or PDF Resume',
        badgeClass: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
        submitBtnText: 'Submit Application (Repo or Resume)',
        demoFirst: false,
        githubRequired: false,
        demoRequired: false,
      };
    }

    if ((line.includes('github') || line.includes('repo')) && (line.includes('demo') || line.includes('live') || line.includes('deploy'))) {
      return {
        type: 'GITHUB_AND_DEMO',
        heading: '"Proof Over Paper" Application',
        tagline: 'Get hired for what you\'ve actually built. Both your GitHub repo and a live deployed demo are required.',
        badgeText: 'GitHub + Live Demo Required',
        badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle',
        submitBtnText: 'Submit Proof Application (Code + Demo)',
        demoFirst: false,
        githubRequired: true,
        demoRequired: true,
      };
    }

    if (line.includes('live deployed') || line.includes('live demo') || line.includes('project url') || line.includes('url only')) {
      return {
        type: 'DEMO_ONLY',
        heading: 'Live Deployed Project URL Application',
        tagline: 'Recruiter requires a working, public live deployed application or demo URL.',
        badgeText: 'Live Demo URL Required',
        badgeClass: 'bg-info-subtle text-info-emphasis border border-info-subtle',
        submitBtnText: 'Submit Live Demo Proof',
        demoFirst: true,
        githubRequired: false,
        demoRequired: true,
      };
    }

    // Default & GITHUB_ONLY
    return {
      type: 'GITHUB_ONLY',
      heading: 'GitHub Source Code Application',
      tagline: 'Recruiter evaluates your code architecture. A verified GitHub repository URL is required.',
      badgeText: 'GitHub Repo Required',
      badgeClass: 'bg-dark-subtle text-dark border border-secondary-subtle',
      submitBtnText: 'Submit GitHub Code Proof',
      demoFirst: false,
      githubRequired: true,
      demoRequired: false,
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

    if (proofInfo.githubRequired && !githubUrl.trim()) {
      setFeedback({ type: 'danger', message: 'GitHub Repository URL is required by the recruiter for this position.' });
      return;
    }
    if (proofInfo.demoRequired && !liveDemoUrl.trim()) {
      setFeedback({ type: 'danger', message: 'Live Deployed Project / Demo URL is required by the recruiter for this position.' });
      return;
    }
    if (proofInfo.type === 'GITHUB_OR_RESUME' && !githubUrl.trim() && !hasResume) {
      setFeedback({ type: 'danger', message: 'Please provide either a GitHub Repository URL OR upload/attach a Resume PDF to submit.' });
      return;
    }

    let finalResume = attachedFileBase64 || resumeLink.trim() || (useProfileResume && (user?.resumeBase64 || user?.resumeUrl || user?.resumeFileName)) || liveDemoUrl.trim() || githubUrl.trim() || '';

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

  // Single reusable input field components
  const renderGithubField = () => (
    <div className={`mb-2 ${proofInfo.type === 'GITHUB_ONLY' ? 'p-2 bg-light border border-dark-subtle rounded' : proofInfo.type === 'GITHUB_OR_RESUME' ? 'p-2 bg-light rounded border' : ''}`}>
      <label className="form-label small fw-bold mb-1 text-dark">
        <i className="bi bi-github text-dark me-1"></i>
        {proofInfo.type === 'GITHUB_OR_RESUME' ? 'Option A: GitHub Repository URL' : 'GitHub Repository URL'}{' '}
        {proofInfo.githubRequired ? (
          <span className="text-danger">*</span>
        ) : proofInfo.type === 'GITHUB_OR_RESUME' ? (
          !attachedFile && !resumeLink && !useProfileResume ? (
            <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '0.65rem' }}>Provide Repo OR Resume</span>
          ) : (
            <span className="text-muted fw-normal small">(Optional)</span>
          )
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
        required={proofInfo.githubRequired}
      />
      {proofInfo.githubRequired && (
        <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
          Mandatory: Repository verifying your codebase and architecture.
        </small>
      )}
    </div>
  );

  const renderDemoField = () => (
    <div className={`mb-2 ${proofInfo.type === 'DEMO_ONLY' ? 'p-2 bg-info-subtle border border-info-subtle rounded mb-3' : ''}`}>
      <label className="form-label small fw-bold mb-1 text-dark">
        <i className="bi bi-globe me-1 text-primary"></i> Live Deployed Demo / Project URL{' '}
        {proofInfo.demoRequired ? <span className="text-danger">*</span> : <span className="text-muted fw-normal small">(Optional)</span>}
      </label>
      <input
        type="url"
        className="form-control form-control-sm"
        value={liveDemoUrl}
        onChange={(e) => setLiveDemoUrl(e.target.value)}
        placeholder="https://your-project.vercel.app"
        required={proofInfo.demoRequired}
      />
      {proofInfo.demoRequired && (
        <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
          Mandatory: Working public URL where the recruiter can test your project live.
        </small>
      )}
    </div>
  );

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(10,25,47,0.6)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-3">
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

              {/* Right Column: Proof Form */}
              <div className="col-md-6 border-start ps-md-4">
                <div className="mb-3">
                  <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                    <i className="bi bi-code-slash text-primary"></i>
                    {proofInfo.heading}
                  </h6>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
                    {proofInfo.tagline}
                  </p>
                </div>

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
                  {/* Render fields in order based on recruiter selection */}
                  {proofInfo.demoFirst ? (
                    <>
                      {renderDemoField()}
                      {renderGithubField()}
                    </>
                  ) : (
                    <>
                      {renderGithubField()}
                      {renderDemoField()}
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

                  {/* Architecture Note */}
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

                  {/* PDF Resume Section */}
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
