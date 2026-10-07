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
  'Other / Custom Salary Range',
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
  const [location, setLocation] = useState('Mumbai, Maharashtra (Hybrid)');
  const [customLocation, setCustomLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [salary, setSalary] = useState('₹12,00,000 - ₹18,00,000 / yr');
  const [customSalary, setCustomSalary] = useState('');
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

    const finalLocation = location === 'Other / Custom Location' ? (customLocation || 'Mumbai, Maharashtra') : location;
    const finalSalary = salary === 'Other / Custom Salary Range' ? (customSalary || '₹12,00,000 - ₹18,00,000 / yr') : salary;

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

                    {/* Location Dropdown */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">
                        Location <span className="text-danger">*</span>
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

                    {/* Job Type Dropdown */}
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

                    {/* Salary / Compensation Dropdown */}
                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-dark">Salary / Compensation</label>
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
