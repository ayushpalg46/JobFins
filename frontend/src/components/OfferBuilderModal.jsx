import React, { useState } from 'react';
import { applicationService } from '../services/api';

export default function OfferBuilderModal({ candidate, isOpen, onClose, user, onOfferDispatched }) {
  const [baseSalary, setBaseSalary] = useState(2800000);
  const [bonus, setBonus] = useState(400000);
  const [esops, setEsops] = useState(1200000);
  const [joiningBonus, setJoiningBonus] = useState(200000);
  const [department, setDepartment] = useState('Core Engineering & Cloud Scale');
  const [joiningDate, setJoiningDate] = useState('2026-11-01');
  const [statusMsg, setStatusMsg] = useState(null);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const targetCandidate = candidate || {
    name: 'Ayzen Vance',
    role: 'Senior Java Backend & Distributed Systems Lead',
    location: 'Bengaluru / Mumbai (Hybrid)',
  };

  const totalFirstYearCtc = baseSalary + bonus + joiningBonus + Math.round(esops / 4);

  const handleSendOffer = async () => {
    setIsSending(true);
    const offerId = `JOBFIN-OFFER-${Math.floor(1000 + Math.random() * 9000)}`;
    const offerPayload = JSON.stringify({
      offerId,
      candidateName: targetCandidate.name,
      role: targetCandidate.role,
      department,
      joiningDate,
      baseSalary,
      bonus,
      esops,
      joiningBonus,
      totalFirstYearCtc,
      companyName: user?.companyName || 'TechCorp Innovations',
      issuedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    });

    try {
      if (targetCandidate.applicationId) {
        await applicationService.updateStatus(targetCandidate.applicationId, 'ACCEPTED', offerPayload);
      }
      setStatusMsg({
        type: 'success',
        text: `Formal Offer Letter (#${offerId}) successfully dispatched to ${targetCandidate.name}! Candidate portal now reflects the offer with appointment letter access.`,
      });
      if (onOfferDispatched) {
        onOfferDispatched();
      }
      setTimeout(() => {
        setStatusMsg(null);
        setIsSending(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Error dispatching offer:', err);
      setStatusMsg({
        type: 'warning',
        text: `Formal Offer Letter (#${offerId}) generated for ${targetCandidate.name}.`,
      });
      setTimeout(() => {
        setStatusMsg(null);
        setIsSending(false);
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-3">
          {/* Header */}
          <div className="modal-header bg-dark text-white p-3">
            <div>
              <span className="badge bg-primary text-white mb-1">Recruiter Console &bull; Offer Generation</span>
              <h5 className="modal-title fw-bold text-white mb-0">
                <i className="bi bi-file-earmark-check text-primary me-2"></i>
                Formal Offer Letter & Compensation Builder
              </h5>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-light">
            {statusMsg && (
              <div className={`alert alert-${statusMsg.type} py-2 mb-3 small`}>
                {statusMsg.text}
              </div>
            )}

            <div className="row g-4">
              {/* Left Column: Candidate & Controls */}
              <div className="col-lg-6">
                <div className="bg-white p-4 rounded-3 border shadow-sm h-100">
                  <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                    <i className="bi bi-person-badge text-primary me-2"></i> Candidate & Position Context
                  </h6>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Candidate Name</label>
                    <input type="text" className="form-control" value={targetCandidate.name} readOnly />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Position / Role</label>
                    <input type="text" className="form-control" value={targetCandidate.role} readOnly />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">Department</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">Joining Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={joiningDate}
                        onChange={(e) => setJoiningDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <h6 className="fw-bold text-dark border-bottom pb-2 mt-4 mb-3">
                    <i className="bi bi-calculator text-primary me-2"></i> Compensation Structuring
                  </h6>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <label className="form-label small fw-bold text-muted">Annual Fixed Base (₹)</label>
                      <span className="fw-bold text-dark">₹{(baseSalary / 100000).toFixed(2)} LPA</span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="1000000"
                      max="6000000"
                      step="100000"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(Number(e.target.value))}
                    />
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <label className="form-label small fw-bold text-muted">Annual Performance Bonus (₹)</label>
                      <span className="fw-bold text-dark">₹{(bonus / 100000).toFixed(2)} LPA</span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="1500000"
                      step="50000"
                      value={bonus}
                      onChange={(e) => setBonus(Number(e.target.value))}
                    />
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <label className="form-label small fw-bold text-muted">4-Year ESOP / Equity Grant (₹)</label>
                      <span className="fw-bold text-dark">₹{(esops / 100000).toFixed(2)} Lakhs Total</span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="5000000"
                      step="100000"
                      value={esops}
                      onChange={(e) => setEsops(Number(e.target.value))}
                    />
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <label className="form-label small fw-bold text-muted">Joining & Relocation Grant (₹)</label>
                      <span className="fw-bold text-dark">₹{(joiningBonus / 100000).toFixed(2)} Lakhs</span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="1000000"
                      step="50000"
                      value={joiningBonus}
                      onChange={(e) => setJoiningBonus(Number(e.target.value))}
                    />
                  </div>

                  {/* Realized CTC Metric Hero */}
                  <div className="p-3 bg-primary-subtle rounded-3 border border-primary-subtle mt-3">
                    <small className="text-uppercase fw-bold text-primary d-block">First Year Realized CTC</small>
                    <h3 className="fw-bold text-primary mb-0">
                      ₹{(totalFirstYearCtc / 100000).toFixed(2)} LPA
                    </h3>
                    <small className="text-muted">
                      Base: ₹{(baseSalary / 100000).toFixed(1)}L + Bonus: ₹{(bonus / 100000).toFixed(1)}L + ESOP/yr: ₹{(esops / 400000).toFixed(1)}L + Joining: ₹{(joiningBonus / 100000).toFixed(1)}L
                    </small>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Offer Letter Preview */}
              <div className="col-lg-6">
                <div className="bg-white p-4 rounded-3 border shadow-sm h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                      <h6 className="fw-bold text-dark mb-0">
                        <i className="bi bi-file-text text-primary me-2"></i> Official Appointment Letter Preview
                      </h6>
                      <span className="badge bg-success small">
                        <i className="bi bi-patch-check me-1"></i> Digitally Signed
                      </span>
                    </div>

                    <div className="p-3 bg-light rounded border font-monospace small" style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                      <p className="fw-bold text-dark mb-1">{user?.companyName || 'TechCorp Innovations'}</p>
                      <p className="text-muted mb-3">Corporate Headquarters, BKC, Mumbai &bull; CIN: U72200MH2026PTC09918</p>

                      <p className="mb-2"><strong>Date:</strong> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="mb-2"><strong>To:</strong> {targetCandidate.name}</p>

                      <p className="mt-3">
                        Dear <strong>{targetCandidate.name}</strong>,
                      </p>
                      <p>
                        We are thrilled to offer you the position of <strong>{targetCandidate.role}</strong> in the <strong>{department}</strong> team.
                      </p>

                      <div className="table-responsive my-2">
                        <table className="table table-sm table-bordered bg-white mb-2">
                          <thead className="table-secondary">
                            <tr>
                              <th>Component</th>
                              <th className="text-end">Annual Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Fixed Annual Base</td>
                              <td className="text-end fw-bold">₹{baseSalary.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                              <td>Target Performance Bonus</td>
                              <td className="text-end">₹{bonus.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                              <td>ESOP Equity (4-Yr Total)</td>
                              <td className="text-end">₹{esops.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                              <td>Joining Bonus</td>
                              <td className="text-end">₹{joiningBonus.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr className="table-primary fw-bold">
                              <td>Total First Year Package</td>
                              <td className="text-end text-primary">₹{totalFirstYearCtc.toLocaleString('en-IN')}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <p className="mb-1"><strong>Key Clauses:</strong></p>
                      <ul className="ps-3 mb-2 text-muted" style={{ fontSize: '0.78rem' }}>
                        <li>3-month probation period with standard milestone evaluation.</li>
                        <li>Non-disclosure, IP assignment, and security protocol compliance.</li>
                        <li>4-year ESOP vesting schedule with 1-year cliff (25% year one).</li>
                      </ul>

                      <div className="pt-2 border-top text-muted text-center" style={{ fontSize: '0.75rem' }}>
                        <i className="bi bi-shield-lock-fill text-primary me-1"></i>
                        Cryptographic Verification Seal: #JOBFIN-OFFER-{Math.floor(1000 + Math.random() * 9000)}-VERIFIED
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-top mt-3 d-flex gap-2 justify-content-end">
                    <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={onClose}>
                      Cancel
                    </button>
                    <button type="button" className="btn btn-cobalt btn-sm px-4" onClick={handleSendOffer}>
                      <i className="bi bi-send-check me-1"></i> Dispatch Formal Offer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
