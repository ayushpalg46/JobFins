import React from 'react';

export default function Footer({ onOpenPostJob }) {
  return (
    <footer>
      <div className="container text-center text-md-start">
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <img src="/logo.svg" alt="JobFins Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
              <span className="brand-title fs-4 mb-0">
                <span className="brand-job">Job</span><span className="brand-fins">Fins</span>
              </span>
            </div>
            <p className="small text-muted mb-0" style={{ maxWidth: '420px' }}>
              JobFins is India's leading recruitment platform connecting verified employers with elite tech and finance talent.
            </p>
          </div>
          <div className="col-md-3 col-6">
            <h6 className="text-dark fw-bold small text-uppercase mb-3">For Candidates</h6>
            <ul className="list-unstyled small mb-0">
              <li className="mb-2"><a className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Browse Jobs</a></li>
              <li className="mb-2"><a className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Verified Opportunities</a></li>
              <li className="mb-2"><a className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Fast Response Jobs</a></li>
            </ul>
          </div>
          <div className="col-md-3 col-6">
            <h6 className="text-dark fw-bold small text-uppercase mb-3">For Employers</h6>
            <ul className="list-unstyled small mb-0">
              <li className="mb-2"><a className="cursor-pointer" onClick={onOpenPostJob}>Post a Job</a></li>
              <li className="mb-2"><a className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Talent Sourcing</a></li>
              <li className="mb-2"><a className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Direct Offer Dispatch</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-3 border-top text-center small text-muted">
          &copy; 2026 JobFins Recruitment Technologies. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
