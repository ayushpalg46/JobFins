import React, { useState } from 'react';

const FREQUENT_LOCATIONS = [
  'Mumbai, Maharashtra (Hybrid)',
  'Mumbai, Maharashtra (On-site)',
  'Bangalore, Karnataka (Hybrid)',
  'Bangalore, Karnataka (On-site)',
  'Pune, Maharashtra (Hybrid)',
  'Hyderabad, Telangana (Hybrid)',
  'Gurgaon / Delhi NCR (Hybrid)',
  'Noida, Uttar Pradesh (Hybrid)',
  'Chennai, Tamil Nadu (Hybrid)',
  'Remote (All India)',
  'Remote (Work from Anywhere)',
  'Other / Custom Location',
];

const POPULAR_FRAMEWORKS = [
  'Spring Boot',
  'FastAPI',
  'React',
  'Flutter',
  'Rust',
  'Docker',
  'PostgreSQL',
  'Next.js',
  'Go',
  'Node.js',
  'Java 17/21',
  'MySQL',
];

const FREQUENT_SALARIES = [
  '₹6,00,000 - ₹10,00,000 / yr',
  '₹10,00,000 - ₹15,00,000 / yr',
  '₹12,00,000 - ₹18,00,000 / yr',
  '₹15,00,000 - ₹22,00,000 / yr',
  '₹18,00,000 - ₹25,00,000 / yr',
  '₹25,00,000 - ₹35,00,000 / yr',
  '₹35,00,000 - ₹50,00,000 / yr',
  '₹25,000 - ₹45,000 / month (Internship)',
  'Competitive / Best in Industry',
  'Other / Custom Salary Range',
];

const FREQUENT_TITLES = [
  'Java Backend Developer (Spring Boot)',
  'Full Stack Java Engineer (Spring Boot + React)',
  'Senior Spring Boot Microservices Architect',
  'Python / FastAPI Backend Engineer',
  'Frontend React Developer',
  'Flutter Mobile App Developer',
  'Rust Systems Engineer',
  'Cloud & DevOps Engineer (Docker / K8s)',
  'Software Development Engineer (SDE-1)',
  'Senior Software Engineer (SDE-2)',
];

export default function PostJobModal({ isOpen, onClose, onJobCreated, user, onOpenLogin }) {
  const recruiterCompany = user?.companyName || user?.name || 'TechCorp Innovations';
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(recruiterCompany);
  const [location, setLocation] = useState(FREQUENT_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [salary, setSalary] = useState('₹12,00,000 - ₹18,00,000 / yr');
  const [customSalary, setCustomSalary] = useState('');
  const [selectedTech, setSelectedTech] = useState(['Spring Boot', 'Java 17/21']);
  const [proofRequirement, setProofRequirement] = useState('GitHub Repository + Live Demo Required');
  const [enableFastResponse, setEnableFastResponse] = useState(false);
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Keep company synchronized with recruiter profile
  React.useEffect(() => {
    if (user) {
      setCompany(user.companyName || user.name || 'TechCorp Innovations');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const toggleTech = (tech) => {
    if (selectedTech.includes(tech)) {
      setSelectedTech(selectedTech.filter((t) => t !== tech));
    } else {
      setSelectedTech([...selectedTech, tech]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'ROLE_RECRUITER') {
      setError('Please log in as a Recruiter to post a job.');
      return;
    }

    const finalLocation = location === 'Other / Custom Location' ? (customLocation || 'Mumbai, Maharashtra') : location;
    const finalSalary = salary === 'Other / Custom Salary Range' ? (customSalary || '₹12,00,000 - ₹18,00,000 / yr') : salary;

    // Assemble rich requirements with Tech Stack, Proof & Fast Response SLA
    let combinedReqs = '';
    if (enableFastResponse) {
      combinedReqs += `[Fast Response: <48h Reply Guaranteed]\n`;
    }
    if (selectedTech.length > 0) {
      combinedReqs += `Primary Tech Stack: ${selectedTech.join(', ')}\n`;
    }
    combinedReqs += `Proof of Work Required: ${proofRequirement}\n`;
    if (requirements.trim()) {
      combinedReqs += requirements.trim();
    }

    setLoading(true);
    setError(null);
    try {
      const finalDesc = description.trim() || `We are looking for a skilled ${title || 'Software Engineer'} with hands-on expertise in ${selectedTech.join(', ') || 'modern software engineering'} to design and deliver scalable solutions.`;

      // Enforce the recruiter's verified company name
      const verifiedCompanyName = (user.companyName || user.name || company || 'TechCorp Innovations').trim();

      await onJobCreated({
        title: (title || 'Software Engineer').trim(),
        company: verifiedCompanyName,
        location: finalLocation,
        jobType,
        salary: finalSalary,
        description: finalDesc,
        requirements: combinedReqs,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError('Your recruiter authentication session has expired or is invalid. Please sign in again with your Recruiter account.');
      } else {
        const serverError = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : null) || err.message;
        setError(serverError || 'Failed to post job. Please check all fields and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(10,25,47,0.6)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-3">
          <div className="modal-header bg-white border-bottom py-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="tech-tag-cyber" style={{ fontSize: '0.7rem' }}>
                  <i className="bi bi-cpu me-1 text-primary"></i> Developer-First Job Creator
                </span>
                <span className="response-sla-badge">
                  <i className="bi bi-shield-check text-success"></i> Zero-Ghosting Monitored
                </span>
              </div>
              <h5 className="modal-title fw-bold text-dark mb-0">
                <i className="bi bi-briefcase-fill me-2 text-primary"></i> Post Tech Stack Opening
              </h5>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {!user || user.role !== 'ROLE_RECRUITER' ? (
              <div className="text-center py-4">
                <i className="bi bi-person-lock text-warning display-4 mb-3 d-block"></i>
                <h6 className="fw-bold text-dark">Recruiter Access Required</h6>
                <p className="text-muted small">You need to be logged in with a Recruiter account to post job vacancies.</p>
                <button className="btn btn-cobalt btn-sm px-4" onClick={() => { onClose(); onOpenLogin(); }}>
                  Sign In as Recruiter
                </button>
              </div>
            ) : (
              <>
                {error && <div className="alert alert-danger py-2 small">{error}</div>}
                {success && <div className="alert alert-success py-2 small"><i className="bi bi-check-circle me-1"></i> Tech Job listing posted successfully with Proof-of-Work & Transit tags!</div>}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Job Title */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">
                        Job Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        list="job-titles-list"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Full Stack Java Engineer (Spring Boot + React)"
                        required
                      />
                      <datalist id="job-titles-list">
                        {FREQUENT_TITLES.map((t, idx) => (
                          <option key={idx} value={t} />
                        ))}
                      </datalist>
                    </div>

                    {/* Company Name (Auto-filled & Locked) */}
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label small fw-bold text-dark mb-0">
                          Company Name <span className="text-danger">*</span>
                        </label>
                        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle" style={{ fontSize: '0.68rem' }}>
                          <i className="bi bi-lock-fill me-1"></i> Verified Recruiter Profile
                        </span>
                      </div>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light text-muted border-end-0">
                          <i className="bi bi-building"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control form-control-sm bg-light text-dark fw-bold border-start-0"
                          value={user?.companyName || user?.name || company || 'TechCorp Innovations'}
                          readOnly
                          disabled
                          title="Company Name is automatically linked to your verified Recruiter profile"
                        />
                      </div>
                      <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                        <i className="bi bi-shield-check text-success me-1"></i> Auto-filled from your Recruiter company profile (cannot be altered)
                      </small>
                    </div>

                    {/* Tech Stack Chips Selector */}
                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-dark mb-1">
                        <i className="bi bi-code-slash text-primary me-1"></i> Target Tech Stack & Frameworks <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex flex-wrap gap-1 p-2 bg-light rounded border">
                        {POPULAR_FRAMEWORKS.map((fw) => {
                          const isSelected = selectedTech.includes(fw);
                          return (
                            <button
                              type="button"
                              key={fw}
                              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-secondary'} py-0 px-2`}
                              style={{ fontSize: '0.78rem' }}
                              onClick={() => toggleTech(fw)}
                            >
                              <i className={`bi ${isSelected ? 'bi-check-lg' : 'bi-plus'} me-1`}></i>
                              {fw}
                            </button>
                          );
                        })}
                      </div>
                      <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                        Selected: {selectedTech.join(', ') || 'None selected'}
                      </small>
                    </div>

                    {/* Location Dropdown */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">
                        <i className="bi bi-geo-alt text-primary me-1"></i> Location <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      >
                        {FREQUENT_LOCATIONS.map((loc, idx) => (
                          <option key={idx} value={loc}>{loc}</option>
                        ))}
                      </select>
                      {location === 'Other / Custom Location' && (
                        <input
                          type="text"
                          className="form-control form-control-sm mt-2"
                          placeholder="Type custom location..."
                          value={customLocation}
                          onChange={(e) => setCustomLocation(e.target.value)}
                          required
                        />
                      )}
                    </div>

                    {/* Proof of Work Requirement */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">
                        <i className="bi bi-patch-check-fill text-success me-1"></i> Proof of Work Requirement
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={proofRequirement}
                        onChange={(e) => setProofRequirement(e.target.value)}
                      >
                        <option value="GitHub Repository + Live Demo Required">GitHub Repository + Live Demo Required</option>
                        <option value="GitHub Repository Required">GitHub Repository Required</option>
                        <option value="Live Deployed Project URL Required">Live Deployed Project URL Required</option>
                        <option value="Either GitHub Repo or PDF Resume">Either GitHub Repo or PDF Resume</option>
                      </select>
                    </div>

                    {/* Job Type & Salary */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">Job Type</label>
                      <select
                        className="form-select form-select-sm"
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Remote">Remote</option>
                        <option value="Internship">Internship</option>
                        <option value="Part-time">Part-time</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">Compensation Metric (₹)</label>
                      <select
                        className="form-select form-select-sm"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                      >
                        {FREQUENT_SALARIES.map((sal, idx) => (
                          <option key={idx} value={sal}>{sal}</option>
                        ))}
                      </select>
                      {salary === 'Other / Custom Salary Range' && (
                        <input
                          type="text"
                          className="form-control form-control-sm mt-2"
                          placeholder="e.g. ₹40,00,000 - ₹60,00,000 / yr"
                          value={customSalary}
                          onChange={(e) => setCustomSalary(e.target.value)}
                        />
                      )}
                    </div>

                    {/* Job Description */}
                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-dark">
                        Role Description & Core Deliverables <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what the engineer will build, architecture responsibilities, and expected deliverables..."
                        required
                      ></textarea>
                    </div>

                    {/* Additional Requirements */}
                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-dark">Additional Engineering Requirements</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        placeholder="e.g. Experience with microservices, clean architecture, Redis caching, or CI/CD pipelines"
                      ></textarea>
                    </div>
                  </div>

                  {/* Feature: <48h Reply Guarantee Badge Opt-in */}
                  <div className={`p-3 rounded-3 border mt-3 transition-all ${enableFastResponse ? 'bg-success-subtle border-success' : 'bg-light border-secondary-subtle'}`}>
                    <div className="form-check form-switch d-flex align-items-center justify-content-between ps-0 mb-0">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          className="form-check-input ms-0 me-2"
                          type="checkbox"
                          role="switch"
                          id="enableFastResponseSwitch"
                          checked={enableFastResponse}
                          onChange={(e) => setEnableFastResponse(e.target.checked)}
                          style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                        />
                        <label className="form-check-label fw-bold text-dark cursor-pointer mb-0" htmlFor="enableFastResponseSwitch">
                          Add Feature Badge: <span className="response-sla-badge ms-1"><i className="bi bi-lightning-fill text-warning"></i> &lt;48h Reply</span>
                        </label>
                      </div>
                      <span className={`badge ${enableFastResponse ? 'bg-success text-white' : 'bg-secondary-subtle text-secondary border'}`} style={{ fontSize: '0.72rem' }}>
                        {enableFastResponse ? 'Feature Active On This Post' : 'Feature Off'}
                      </span>
                    </div>
                    <p className="text-muted small mb-0 mt-2" style={{ fontSize: '0.78rem' }}>
                      {enableFastResponse
                        ? "⚡ This post will showcase the verified '<48h Reply' badge. You commit to reviewing applications within 48 hours."
                        : "Turn on this feature if you want your post to display the verified '⚡ <48h Reply' badge to attract more candidates."}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-top d-flex gap-2 justify-content-end">
                    <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={onClose}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-cobalt btn-sm px-4 fw-bold shadow-sm" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Publishing Tech Role...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cloud-upload me-1"></i> Publish Tech Role
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
