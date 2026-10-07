import React from 'react';

export default function JobCard({ job, onSelectJob, onApplyJob }) {
  const getBadgeClass = (type) => {
    switch (type) {
      case 'Full-time': return 'badge-fulltime';
      case 'Remote': return 'badge-remote';
      case 'Internship': return 'badge-intern';
      default: return 'bg-light text-dark';
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return '₹ Competitive';
    return salary.replace(/\?(\s*\d)/g, '₹$1');
  };

  // Helper to extract tech stack frameworks from job data
  const getTechStack = () => {
    const textToScan = `${job.title || ''} ${job.description || ''} ${job.requirements || ''}`.toLowerCase();
    const knownTech = [
      { name: 'Spring Boot', icon: 'bi-gear-wide-connected' },
      { name: 'Java', icon: 'bi-cup-hot' },
      { name: 'React', icon: 'bi-code-slash' },
      { name: 'FastAPI', icon: 'bi-lightning-charge' },
      { name: 'Python', icon: 'bi-terminal' },
      { name: 'Flutter', icon: 'bi-phone' },
      { name: 'Rust', icon: 'bi-cpu' },
      { name: 'Docker', icon: 'bi-box-seam' },
      { name: 'PostgreSQL', icon: 'bi-database' },
      { name: 'MySQL', icon: 'bi-database-fill' },
      { name: 'Node.js', icon: 'bi-diagram-3' },
      { name: 'Next.js', icon: 'bi-layers' },
    ];

    const matched = knownTech.filter(t => textToScan.includes(t.name.toLowerCase()));
    if (matched.length > 0) return matched.slice(0, 4);
    return [{ name: 'Full Stack', icon: 'bi-code-slash' }, { name: 'Git / REST', icon: 'bi-git' }];
  };

  const techStack = getTechStack();

  return (
    <div className="col-md-6 col-lg-6">
      <div className="job-card position-relative">
        <div>
          {/* Top Bar: Cyber Tech Stack Tags & SLA Badge */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2 pb-2 border-bottom">
            <div className="d-flex flex-wrap gap-1">
              {techStack.map((tech) => (
                <span key={tech.name} className="tech-tag-cyber">
                  <i className={`bi ${tech.icon}`}></i> {tech.name}
                </span>
              ))}
            </div>
            <span className="response-sla-badge" title="Verified active employer with <48h response SLA">
              <i className="bi bi-lightning-fill text-warning"></i> Replies &lt;48h
            </span>
          </div>

          {/* Role & Company */}
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h3 className="h5 mb-1 text-dark cursor-pointer fw-bold" onClick={() => onSelectJob(job)}>
                {job.title}
              </h3>
              <div className="text-primary fw-semibold small d-flex align-items-center gap-1">
                <i className="bi bi-building"></i> {job.company}
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.65rem' }}>
                  <i className="bi bi-shield-check me-1"></i> Verified
                </span>
              </div>
            </div>
            <span className={`job-badge ${getBadgeClass(job.jobType)}`}>
              {job.jobType}
            </span>
          </div>

          {/* Short Description */}
          <p className="text-muted small my-2" style={{ minHeight: '36px' }}>
            {job.description?.length > 115 ? `${job.description.substring(0, 115)}...` : job.description}
          </p>

          {/* Key Deliverables / Requirements */}
          {job.requirements && (
            <div className="bg-light p-2 rounded mb-2" style={{ fontSize: '0.78rem' }}>
              <span className="text-muted fw-bold d-block mb-1" style={{ fontSize: '0.7rem' }}>
                <i className="bi bi-check2-circle text-success me-1"></i> Core Stack / Requirements:
              </span>
              <div className="text-truncate text-muted">
                {job.requirements.split('\n').filter(r => r.trim())[0]?.replace(/^[0-9.]+\s*/, '')}
              </div>
            </div>
          )}
        </div>

        {/* Footer: Location, Salary, Proof Apply Button */}
        <div className="d-flex justify-content-between align-items-center pt-3 mt-2 border-top">
          <div>
            <small className="text-muted d-block mb-1">
              <i className="bi bi-geo-alt me-1"></i> {job.location}
            </small>
            <strong className="text-success small d-block">{formatSalary(job.salary)}</strong>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-custom btn-sm" onClick={() => onSelectJob(job)}>
              Details
            </button>
            <button className="btn btn-cobalt btn-sm px-3 shadow-sm fw-bold" onClick={() => onApplyJob(job)}>
              <i className="bi bi-code-square me-1"></i> Proof Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

