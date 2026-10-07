import React, { useState } from 'react';

const FREQUENT_TRANSIT_CORRIDORS = [
  'Western Line: Andheri / Bandra / BKC (Hybrid)',
  'Western Line: Goregaon / Malad / Borivali (Hybrid)',
  'Western Line: Churchgate / Lower Parel (On-site)',
  'Central Line: Thane / Powai / Airoli (Hybrid)',
  'Central Line: Kurla / Ghatkopar / CSMT (Hybrid)',
  'Harbour Line: Vashi / Belapur / Panvel (Hybrid)',
  'Metro Line 1 / 2A / 7 Corridor (Mumbai)',
  'Bangalore: Outer Ring Road / Bellandur (Hybrid)',
  'Bangalore: Whitefield / ITPL (Hybrid)',
  'Bangalore: Electronic City (Hybrid)',
  'Pune: Hinjewadi Phase 1-3 (Hybrid)',
  'Pune: Magarpatta / Kharadi (Hybrid)',
  'Hyderabad: HITEC City / Gachibowli (Hybrid)',
  'Gurgaon: Cyber City / Golf Course Rd (Hybrid)',
  '100% Remote (Zero Commute / Anywhere in India)',
  'Other / Custom Transit Corridor',
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
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(user?.companyName || '');
  const [location, setLocation] = useState(FREQUENT_TRANSIT_CORRIDORS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [salary, setSalary] = useState('₹12,00,000 - ₹18,00,000 / yr');
  const [customSalary, setCustomSalary] = useState('');
  const [selectedTech, setSelectedTech] = useState(['Spring Boot', 'Java 17/21']);
  const [proofRequirement, setProofRequirement] = useState('GitHub Repo + Live Demo');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

    const finalLocation = location === 'Other / Custom Transit Corridor' ? (customLocation || 'Mumbai, Maharashtra') : location;
    const finalSalary = salary === 'Other / Custom Salary Range' ? (customSalary || '₹12,00,000 - ₹18,00,000 / yr') : salary;

    // Assemble rich requirements with Tech Stack & Proof requirements
    let combinedReqs = '';
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
      await onJobCreated({
        title,
        company: company || user.companyName,
        location: finalLocation,
        jobType,
        salary: finalSalary,
        description,
        requirements: combinedReqs,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
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
                <span className="badge bg-dark text-cyan tech-tag-cyber" style={{ fontSize: '0.7rem' }}>
                  <i className="bi bi-cpu me-1"></i> Developer-First Job Creator
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

                    {/* Company Name */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">
                        Company Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. TechCorp Innovations"
                        required
                      />
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

                    {/* Transit Corridor Dropdown */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">
                        <i className="bi bi-train-front text-primary me-1"></i> Transit & Commute Corridor <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      >
                        {FREQUENT_TRANSIT_CORRIDORS.map((loc, idx) => (
                          <option key={idx} value={loc}>{loc}</option>
                        ))}
                      </select>
                      {location === 'Other / Custom Transit Corridor' && (
                        <input
                          type="text"
                          className="form-control form-control-sm mt-2"
                          placeholder="Type custom transit line or railway station..."
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
                        <option value="GitHub Repo + Live Demo">GitHub Repository + Live Demo Required</option>
                        <option value="GitHub Repo Only">GitHub Repository Required</option>
                        <option value="Live Deployed URL Only">Live Deployed Project URL Required</option>
                        <option value="GitHub Repo or PDF Resume">Either GitHub Repo or PDF Resume</option>
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

                  {/* Recruiter Zero-Ghosting Pledge */}
                  <div className="p-2 bg-success-subtle rounded border border-success-subtle mt-3 d-flex align-items-center gap-2 small text-success">
                    <i className="bi bi-shield-lock-fill fs-5"></i>
                    <div>
                      <strong>JobFins Zero-Ghosting Commitment:</strong> As a verified recruiter, you pledge to review applications within 7 days to maintain your company's <span className="badge bg-success text-white">⚡ Replies &lt;48h</span> badge.
                    </div>
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
