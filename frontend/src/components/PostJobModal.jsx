import React, { useState } from 'react';

const FREQUENT_LOCATIONS = [
  'Bangalore, Karnataka (Hybrid)',
  'Bangalore, Karnataka (On-site)',
  'Mumbai, Maharashtra (Hybrid)',
  'Mumbai, Maharashtra (On-site)',
  'Pune, Maharashtra (Hybrid)',
  'Hyderabad, Telangana (Hybrid)',
  'Gurgaon / Delhi NCR (Hybrid)',
  'Noida, Uttar Pradesh (Hybrid)',
  'Chennai, Tamil Nadu (Hybrid)',
  'Remote (All India)',
  'Remote (Work from Anywhere)',
];

const FREQUENT_SALARIES = [
  '₹6,00,000 - ₹10,00,000 / yr',
  '₹10,00,000 - ₹15,00,000 / yr',
  '₹12,00,000 - ₹18,00,000 / yr',
  '₹15,00,000 - ₹22,00,000 / yr',
  '₹18,00,000 - ₹25,00,000 / yr',
  '₹25,00,000 - ₹35,00,000 / yr',
  '₹35,00,000 - ₹50,00,000 / yr',
  '₹25,000 - ₹40,000 / month (Internship)',
  'Competitive / Best in Industry',
];

const FREQUENT_TITLES = [
  'Java Backend Developer',
  'Full Stack Java Engineer (Spring Boot + React)',
  'Senior Spring Boot Microservices Architect',
  'Frontend React Developer',
  'Cloud & DevOps Engineer (Docker & AWS)',
  'Software Development Engineer (SDE-1)',
  'Senior Software Engineer (SDE-2)',
  'Lead Backend Architect',
];

export default function PostJobModal({ isOpen, onClose, onJobCreated, user, onOpenLogin }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(user?.companyName || '');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'ROLE_RECRUITER') {
      setError('Please log in as a Recruiter to post a job.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onJobCreated({
        title,
        company: company || user.companyName,
        location,
        jobType,
        salary,
        description,
        requirements,
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
            <h5 className="modal-title fw-bold text-dark mb-0">
              <i className="bi bi-briefcase-fill me-2 text-primary"></i> Post a New Job Listing
            </h5>
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
                {success && <div className="alert alert-success py-2 small"><i className="bi bi-check-circle me-1"></i> Job listing posted successfully to MySQL database!</div>}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Job Title with Datalist */}
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
                        placeholder="Choose or type job title..."
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

                    {/* Location with Dropdown Selection & Datalist */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark d-flex justify-content-between">
                        <span>Location <span className="text-danger">*</span></span>
                        <span className="text-muted font-monospace" style={{ fontSize: '0.72rem' }}>Dropdown & Custom</span>
                      </label>
                      <div className="input-group input-group-sm">
                        <input
                          type="text"
                          className="form-control"
                          list="locations-list"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Select or type location..."
                          required
                        />
                        <select
                          className="form-select flex-grow-0"
                          style={{ width: '38px', padding: '0.25rem 0.5rem' }}
                          onChange={(e) => {
                            if (e.target.value) setLocation(e.target.value);
                          }}
                          value=""
                          title="Quick Select Location"
                        >
                          <option value="" disabled>▼</option>
                          {FREQUENT_LOCATIONS.map((loc, idx) => (
                            <option key={idx} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </div>
                      <datalist id="locations-list">
                        {FREQUENT_LOCATIONS.map((loc, idx) => (
                          <option key={idx} value={loc} />
                        ))}
                      </datalist>
                      {/* Quick Location Pills */}
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        <button type="button" className="badge bg-light text-secondary border-0 p-1" style={{ fontSize: '0.7rem', cursor: 'pointer' }} onClick={() => setLocation('Bangalore, Karnataka (Hybrid)')}>+ Bangalore</button>
                        <button type="button" className="badge bg-light text-secondary border-0 p-1" style={{ fontSize: '0.7rem', cursor: 'pointer' }} onClick={() => setLocation('Mumbai, Maharashtra (Hybrid)')}>+ Mumbai</button>
                        <button type="button" className="badge bg-light text-secondary border-0 p-1" style={{ fontSize: '0.7rem', cursor: 'pointer' }} onClick={() => setLocation('Remote (All India)')}>+ Remote</button>
                      </div>
                    </div>

                    {/* Job Type */}
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

                    {/* Salary / Compensation with Dropdown Selection & Datalist */}
                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-dark d-flex justify-content-between">
                        <span>Salary / Compensation</span>
                        <span className="text-muted font-monospace" style={{ fontSize: '0.72rem' }}>Dropdown & Custom</span>
                      </label>
                      <div className="input-group input-group-sm">
                        <input
                          type="text"
                          className="form-control"
                          list="salaries-list"
                          value={salary}
                          onChange={(e) => setSalary(e.target.value)}
                          placeholder="Select range or type e.g. ₹12,00,000 - ₹18,00,000 / yr"
                        />
                        <select
                          className="form-select flex-grow-0"
                          style={{ width: '38px', padding: '0.25rem 0.5rem' }}
                          onChange={(e) => {
                            if (e.target.value) setSalary(e.target.value);
                          }}
                          value=""
                          title="Quick Select Salary Band"
                        >
                          <option value="" disabled>▼</option>
                          {FREQUENT_SALARIES.map((sal, idx) => (
                            <option key={idx} value={sal}>{sal}</option>
                          ))}
                        </select>
                      </div>
                      <datalist id="salaries-list">
                        {FREQUENT_SALARIES.map((sal, idx) => (
                          <option key={idx} value={sal} />
                        ))}
                      </datalist>
                      {/* Quick Salary Pills */}
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        <button type="button" className="badge bg-light text-success border-0 p-1" style={{ fontSize: '0.7rem', cursor: 'pointer' }} onClick={() => setSalary('₹10,00,000 - ₹15,00,000 / yr')}>₹10-15 LPA</button>
                        <button type="button" className="badge bg-light text-success border-0 p-1" style={{ fontSize: '0.7rem', cursor: 'pointer' }} onClick={() => setSalary('₹15,00,000 - ₹22,00,000 / yr')}>₹15-22 LPA</button>
                        <button type="button" className="badge bg-light text-success border-0 p-1" style={{ fontSize: '0.7rem', cursor: 'pointer' }} onClick={() => setSalary('₹25,00,000 - ₹35,00,000 / yr')}>₹25-35 LPA</button>
                      </div>
                    </div>

                    {/* Job Description */}
                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-dark">
                        Job Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe key responsibilities, deliverables, and role expectations..."
                        required
                      ></textarea>
                    </div>

                    {/* Requirements & Tech Stack */}
                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-dark">Requirements & Tech Stack</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        placeholder="e.g. Java 17, Spring Boot, MySQL, REST APIs, Docker, React.js"
                      ></textarea>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-top d-flex gap-2 justify-content-end">
                    <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={onClose}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-cobalt btn-sm px-4 fw-bold" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Publishing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cloud-upload me-1"></i> Publish Job Listing
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
