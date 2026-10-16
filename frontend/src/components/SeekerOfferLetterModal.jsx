import React, { useState } from 'react';
import { applicationService } from '../services/api';

export default function SeekerOfferLetterModal({ isOpen, onClose, application, onOfferAccepted }) {
  if (!isOpen || !application) return null;

  const [isAccepting, setIsAccepting] = useState(false);
  const [localAccepted, setLocalAccepted] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

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

  const isAccepted = application.status === 'OFFER_ACCEPTED' || offer?.candidateAccepted === true || localAccepted;

  const candidateName = offer?.candidateName || application.seeker?.name || 'Candidate';
  const role = offer?.role || application.job?.title || 'Software Engineer';
  const company = offer?.companyName || application.job?.company || 'TechCorp Innovations';
  const department = offer?.department || 'Core Engineering & Cloud Scale';
  const joiningDate = offer?.joiningDate || '2026-11-01';
  const baseSalary = offer?.baseSalary !== undefined && offer?.baseSalary !== null ? Number(offer.baseSalary) : 1000000;
  const bonus = offer?.bonus !== undefined && offer?.bonus !== null ? Number(offer.bonus) : 0;
  const esops = offer?.esops !== undefined && offer?.esops !== null ? Number(offer.esops) : 0;
  const joiningBonus = offer?.joiningBonus !== undefined && offer?.joiningBonus !== null ? Number(offer.joiningBonus) : 0;
  const totalFirstYearCtc = offer?.totalFirstYearCtc !== undefined && offer?.totalFirstYearCtc !== null
    ? Number(offer.totalFirstYearCtc)
    : (baseSalary + bonus + joiningBonus + Math.round(esops / 4));
  const offerId = offer?.offerId || `JOBFIN-OFFER-${application.id * 1111}`;
  const issuedDate = offer?.issuedDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  const handleAcceptOffer = async () => {
    setIsAccepting(true);
    setActionMsg(null);
    try {
      await applicationService.acceptOffer(application.id);
      setLocalAccepted(true);
      setActionMsg({
        type: 'success',
        text: `🎉 Congratulations! You have officially accepted the offer for "${role}" with ${company}. The recruiter has been notified in real time.`,
      });
      if (onOfferAccepted) {
        onOfferAccepted();
      }
    } catch (err) {
      console.error('Failed to accept offer:', err);
      setActionMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to accept offer. Please try again.',
      });
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-3">
          {/* Header */}
          <div className={`modal-header ${isAccepted ? 'bg-success' : 'bg-primary'} text-white py-3 px-4`}>
            <div>
              <span className="badge bg-white text-dark fw-bold mb-1">
                {isAccepted ? 'Official Employment Offer (Signed & Accepted)' : 'Official Offer Letter'}
              </span>
              <h5 className="modal-title fw-bold text-white mb-0">
                <i className={`bi ${isAccepted ? 'bi-patch-check-fill' : 'bi-award-fill'} me-2`}></i>
                {isAccepted ? `Offer Accepted • Congratulations, ${candidateName}!` : `Congratulations, ${candidateName}!`}
              </h5>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-light">
            {actionMsg && (
              <div className={`alert alert-${actionMsg.type} py-2 mb-3 small d-flex align-items-center shadow-sm`}>
                <i className={`bi ${actionMsg.type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger'} me-2 fs-5`}></i>
                <div>{actionMsg.text}</div>
              </div>
            )}

            {/* Offer Banner */}
            <div className="p-3 bg-white rounded-3 border shadow-sm mb-4 d-flex flex-wrap justify-content-between align-items-center">
              <div>
                <small className="text-muted text-uppercase fw-bold">Total First Year Package</small>
                <h3 className="fw-bold text-success mb-0">
                  ₹{(totalFirstYearCtc / 100000).toFixed(2)} LPA
                </h3>
              </div>
              <div>
                {isAccepted ? (
                  <span className="badge bg-success text-white p-2 px-3 shadow-sm fs-7">
                    <i className="bi bi-award-fill me-1"></i> Offer Accepted & Signed
                  </span>
                ) : (
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle p-2 px-3">
                    <i className="bi bi-clock-history me-1"></i> Offer Extended &bull; Awaiting Your Acceptance
                  </span>
                )}
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
                  {isAccepted ? (
                    <span className="badge bg-success small py-1 px-2">
                      <i className="bi bi-patch-check-fill me-1"></i> Candidate Signed & Accepted
                    </span>
                  ) : (
                    <span className="badge bg-primary small py-1 px-2">
                      <i className="bi bi-shield-lock-fill me-1"></i> Digitally Signed & Verified
                    </span>
                  )}
                  <small className="text-muted d-block mt-1 font-monospace" style={{ fontSize: '0.72rem' }}>
                    #{offerId}-VERIFIED
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer bg-white py-3 px-4 d-flex justify-content-between align-items-center">
            <div>
              {isAccepted ? (
                <span className="text-success fw-semibold small">
                  <i className="bi bi-check-circle-fill me-1"></i> You officially accepted and signed this offer of employment.
                </span>
              ) : (
                <span className="text-muted small">
                  <i className="bi bi-info-circle me-1"></i> Review all terms before accepting your official offer letter.
                </span>
              )}
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={onClose}>
                Close
              </button>
              <button type="button" className="btn btn-outline-dark btn-sm px-3" onClick={handlePrint}>
                <i className="bi bi-printer me-1"></i> Print / Save PDF
              </button>

              {!isAccepted && (
                <button
                  type="button"
                  className="btn btn-success btn-sm px-4 fw-bold shadow-sm"
                  disabled={isAccepting}
                  onClick={handleAcceptOffer}
                >
                  {isAccepting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Accepting & Signing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-patch-check-fill me-1"></i> Accept & Sign Offer
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
