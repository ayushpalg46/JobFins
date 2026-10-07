import React from 'react';

export default function SeekerOfferLetterModal({ isOpen, onClose, application }) {
  if (!isOpen || !application) return null;

  let offer = null;
  if (application.offerDetails) {
    try {
      offer = typeof application.offerDetails === 'string'
        ? JSON.parse(application.offerDetails)
        : application.offerDetails;
    } catch (e) {
      console.error('Failed to parse offer details:', e);
    }
  }

  const candidateName = offer?.candidateName || application.seeker?.name || 'Candidate';
  const role = offer?.role || application.job?.title || 'Software Engineer';
  const company = offer?.companyName || application.job?.company || 'TechCorp Innovations';
  const department = offer?.department || 'Core Engineering & Cloud Scale';
  const joiningDate = offer?.joiningDate || '2026-11-01';
  const baseSalary = offer?.baseSalary || 2800000;
  const bonus = offer?.bonus || 400000;
  const esops = offer?.esops || 1200000;
  const joiningBonus = offer?.joiningBonus || 200000;
  const totalFirstYearCtc = offer?.totalFirstYearCtc || (baseSalary + bonus + joiningBonus + Math.round(esops / 4));
  const offerId = offer?.offerId || `JOBFIN-OFFER-${application.id * 1111}`;
  const issuedDate = offer?.issuedDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-3">
          {/* Header */}
          <div className="modal-header bg-success text-white py-3 px-4">
            <div>
              <span className="badge bg-white text-success fw-bold mb-1">Official Offer Letter</span>
              <h5 className="modal-title fw-bold text-white mb-0">
                <i className="bi bi-award-fill me-2"></i> Congratulations, {candidateName}!
              </h5>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-light">
            {/* Offer Banner */}
            <div className="p-3 bg-white rounded-3 border shadow-sm mb-4 d-flex flex-wrap justify-content-between align-items-center">
              <div>
                <small className="text-muted text-uppercase fw-bold">Total First Year Package</small>
                <h3 className="fw-bold text-success mb-0">
                  ₹{(totalFirstYearCtc / 100000).toFixed(2)} LPA
                </h3>
              </div>
              <div>
                <span className="badge bg-success-subtle text-success border border-success-subtle p-2 px-3">
                  <i className="bi bi-check-circle-fill me-1"></i> Offer Extended & Verified
                </span>
              </div>
            </div>

            {/* Appointment Letter Sheet */}
            <div className="bg-white p-4 rounded-3 border shadow-sm font-monospace text-dark" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                <div>
                  <h5 className="fw-bold text-dark mb-0">{company}</h5>
                  <p className="text-muted small mb-0">Corporate Headquarters &bull; CIN: U72200MH2026PTC09918</p>
                </div>
                <div className="text-end">
                  <span className="badge bg-light text-dark border">Ref: #{offerId}</span>
                  <small className="text-muted d-block mt-1">Date: {issuedDate}</small>
                </div>
              </div>

              <p className="mb-1"><strong>To:</strong> {candidateName}</p>
              <p className="mb-3"><strong>Email:</strong> {application.seeker?.email}</p>

              <p className="mb-2">Dear <strong>{candidateName}</strong>,</p>
              <p>
                We are pleased to extend an offer of employment for the position of <strong>{role}</strong> with <strong>{company}</strong> in the <strong>{department}</strong> department.
              </p>
              <p>
                Your expected date of joining will be <strong>{joiningDate}</strong>. Below is the comprehensive breakdown of your compensation structure:
              </p>

              {/* Compensation Table */}
              <div className="table-responsive my-3">
                <table className="table table-bordered table-sm bg-white mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Salary Component</th>
                      <th className="text-end">Annual Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Fixed Annual Base</td>
                      <td className="text-end fw-semibold">₹{baseSalary.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td>Target Performance Bonus</td>
                      <td className="text-end">₹{bonus.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td>ESOP Equity Grant (4-Year Total)</td>
                      <td className="text-end">₹{esops.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td>Joining & Relocation Grant</td>
                      <td className="text-end">₹{joiningBonus.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="table-success fw-bold">
                      <td>Total Realized First Year CTC</td>
                      <td className="text-end text-success">₹{totalFirstYearCtc.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h6 className="fw-bold mt-3 mb-2 small text-uppercase">Terms & Conditions of Employment:</h6>
              <ul className="ps-3 mb-3 text-secondary small">
                <li>This offer is contingent upon successful verification of references and academic credentials.</li>
                <li>Standard 3-month probation with milestone review prior to permanent confirmation.</li>
                <li>ESOPs subject to 4-year standard vesting schedule with a 1-year cliff (25% post year 1).</li>
              </ul>

              <div className="d-flex justify-content-between align-items-end pt-4 border-top mt-4">
                <div>
                  <p className="small text-muted mb-0">Authorized Signatory</p>
                  <strong className="text-dark">Talent Acquisition Team</strong>
                  <p className="text-muted small mb-0">{company}</p>
                </div>
                <div className="text-end">
                  <span className="badge bg-success small py-1 px-2">
                    <i className="bi bi-shield-lock-fill me-1"></i> Digitally Signed & Verified
                  </span>
                  <small className="text-muted d-block mt-1 font-monospace" style={{ fontSize: '0.72rem' }}>
                    #{offerId}-VERIFIED
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer bg-white py-2 px-4 d-flex justify-content-between">
            <span className="text-muted small">
              <i className="bi bi-info-circle me-1"></i> You can print or save this offer letter for your records.
            </span>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={onClose}>
                Close
              </button>
              <button type="button" className="btn btn-success btn-sm px-4 fw-bold" onClick={handlePrint}>
                <i className="bi bi-printer me-1"></i> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
