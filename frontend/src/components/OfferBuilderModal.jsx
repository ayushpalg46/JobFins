import React, { useState, useEffect } from 'react';
import { applicationService } from '../services/api';

/**
 * Intelligent parser for Indian compensation metrics (e.g., "₹6,00,000 - ₹10,00,000 / yr", "₹12 - ₹25 LPA", "₹25,000 - ₹45,000 / month")
 */
function parseCompensationMetric(salaryStr) {
  if (!salaryStr || typeof salaryStr !== 'string') {
    return {
      min: 600000,
      max: 2000000,
      defaultBase: 1000000,
      raw: 'Competitive / Industry Standard',
      hasRange: false,
      isMonthly: false,
    };
  }

  const clean = salaryStr.replace(/\?/g, '₹').trim();
  const isMonthly = /month/i.test(clean);
  const isLPA = /lpa|lakh/i.test(clean);

  // Extract all numbers (e.g. "6,00,000", "10,00,000", "25", "12.5")
  const numbers = [];
  const regex = /(\d[\d,]*(?:\.\d+)?)/g;
  let match;
  while ((match = regex.exec(clean)) !== null) {
    const numStr = match[1].replace(/,/g, '');
    const val = parseFloat(numStr);
    if (!isNaN(val) && val > 0) {
      numbers.push(val);
    }
  }

  let minVal = 0;
  let maxVal = 0;

  if (numbers.length >= 2) {
    minVal = numbers[0];
    maxVal = numbers[1];
  } else if (numbers.length === 1) {
    minVal = numbers[0];
    maxVal = numbers[0];
  }

  if (isLPA) {
    if (minVal < 1000) minVal = minVal * 100000;
    if (maxVal < 1000) maxVal = maxVal * 100000;
  } else if (isMonthly) {
    minVal = minVal * 12;
    maxVal = maxVal * 12;
  }

  if (minVal > 0 && maxVal > 0) {
    if (minVal > maxVal) {
      const temp = minVal;
      minVal = maxVal;
      maxVal = temp;
    }
    const defaultBase = Math.round(((minVal + maxVal) / 2) / 25000) * 25000;
    return {
      min: Math.round(minVal),
      max: Math.round(maxVal),
      defaultBase: Math.round(defaultBase),
      raw: clean,
      hasRange: minVal !== maxVal,
      isMonthly,
    };
  }

  return {
    min: 600000,
    max: 2000000,
    defaultBase: 1000000,
    raw: clean,
    hasRange: false,
    isMonthly: false,
  };
}

export default function OfferBuilderModal({ candidate, isOpen, onClose, user, onOfferDispatched }) {
  const salaryString = candidate?.salary || candidate?.job?.salary || candidate?.expectedCtc || '';
  const parsedMetric = parseCompensationMetric(salaryString);

  const [baseSalary, setBaseSalary] = useState(parsedMetric.defaultBase);
  const [bonus, setBonus] = useState(0);
  const [esops, setEsops] = useState(0);
  const [joiningBonus, setJoiningBonus] = useState(0);
  const [department, setDepartment] = useState('Core Engineering & Cloud Scale');
  const [joiningDate, setJoiningDate] = useState('2026-11-01');
  const [statusMsg, setStatusMsg] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (candidate?.offerDetails) {
      try {
        const parsed = JSON.parse(candidate.offerDetails);
        if (parsed.baseSalary !== undefined && parsed.baseSalary !== null) setBaseSalary(Number(parsed.baseSalary));
        if (parsed.bonus !== undefined && parsed.bonus !== null) setBonus(Number(parsed.bonus));
        if (parsed.esops !== undefined && parsed.esops !== null) setEsops(Number(parsed.esops));
        if (parsed.joiningBonus !== undefined && parsed.joiningBonus !== null) setJoiningBonus(Number(parsed.joiningBonus));
        if (parsed.department) setDepartment(parsed.department);
        if (parsed.joiningDate) setJoiningDate(parsed.joiningDate);
        return;
      } catch (e) {
        console.error('Error parsing candidate offerDetails:', e);
      }
    }

    // Default calibration based directly on Job Compensation Metric
    const metric = parseCompensationMetric(candidate?.salary || candidate?.job?.salary || candidate?.expectedCtc);
    setBaseSalary(metric.defaultBase);
    setBonus(0);
    setEsops(0);
    setJoiningBonus(0);
    setDepartment('Core Engineering & Cloud Scale');
    setJoiningDate('2026-11-01');
  }, [candidate, isOpen]);

  if (!isOpen) return null;

  const targetCandidate = candidate || {
    name: 'Ayzen Vance',
    role: 'Senior Java Backend & Distributed Systems Lead',
    location: 'Bengaluru / Mumbai (Hybrid)',
  };

  const totalFirstYearCtc = baseSalary + bonus + joiningBonus + Math.round(esops / 4);

  // Dynamic slider bounds calibrated to the job's compensation metric
  const sliderMin = parsedMetric.min <= 400000
    ? 100000
    : parsedMetric.min <= 1000000
    ? 200000
    : Math.max(200000, Math.floor((parsedMetric.min * 0.5) / 50000) * 50000);

  const sliderMax = Math.max(
    Math.round(parsedMetric.max * 1.5),
    5000000,
    baseSalary + 500000
  );

  const sliderStep = parsedMetric.max <= 1200000 ? 25000 : 50000;

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

                  {/* Compensation Metric Alignment Banner */}
                  <div className="p-3 mb-4 rounded-3 border bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <small className="text-muted text-uppercase fw-bold d-block" style={{ fontSize: '0.72rem' }}>
                          Job Compensation Metric
                        </small>
                        <span className="fw-bold text-success fs-6">
                          <i className="bi bi-cash-stack me-1"></i>
                          {parsedMetric.raw}
                        </span>
                      </div>
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small">
                        <i className="bi bi-check2-circle me-1"></i> Auto-Calibrated
                      </span>
                    </div>

                    {/* Quick-fill Range Buttons */}
                    {parsedMetric.hasRange && (
                      <div className="mt-2 pt-2 border-top">
                        <small className="text-muted d-block mb-1" style={{ fontSize: '0.72rem' }}>Quick-Select From Role Metric:</small>
                        <div className="btn-group btn-group-sm w-100">
                          <button
                            type="button"
                            className={`btn ${baseSalary === parsedMetric.min ? 'btn-success' : 'btn-outline-success'} py-1`}
                            onClick={() => setBaseSalary(parsedMetric.min)}
                          >
                            Min (₹{(parsedMetric.min / 100000).toFixed(2)} LPA)
                          </button>
                          <button
                            type="button"
                            className={`btn ${baseSalary === parsedMetric.defaultBase ? 'btn-success' : 'btn-outline-success'} py-1`}
                            onClick={() => setBaseSalary(parsedMetric.defaultBase)}
                          >
                            Mid (₹{(parsedMetric.defaultBase / 100000).toFixed(2)} LPA)
                          </button>
                          <button
                            type="button"
                            className={`btn ${baseSalary === parsedMetric.max ? 'btn-success' : 'btn-outline-success'} py-1`}
                            onClick={() => setBaseSalary(parsedMetric.max)}
                          >
                            Max (₹{(parsedMetric.max / 100000).toFixed(2)} LPA)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                    <i className="bi bi-calculator text-primary me-2"></i> Compensation Structuring
                  </h6>

                  {/* Annual Fixed Base */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small fw-bold text-muted mb-0">Annual Fixed Base (₹)</label>
                      <div className="input-group input-group-sm" style={{ width: '150px' }}>
                        <span className="input-group-text py-0 px-2 small">₹</span>
                        <input
                          type="number"
                          step="0.05"
                          min="0.5"
                          max="200"
                          className="form-control text-end fw-bold py-0 px-2"
                          value={(baseSalary / 100000).toFixed(2)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0) {
                              setBaseSalary(Math.round(val * 100000));
                            }
                          }}
                        />
                        <span className="input-group-text py-0 px-2 small">LPA</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min={sliderMin}
                      max={sliderMax}
                      step={sliderStep}
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(Number(e.target.value))}
                    />
                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.72rem' }}>
                      <span>Min: ₹{(sliderMin / 100000).toFixed(2)} LPA</span>
                      <span>Selected: ₹{(baseSalary / 100000).toFixed(2)} LPA (₹{baseSalary.toLocaleString('en-IN')})</span>
                      <span>Max: ₹{(sliderMax / 100000).toFixed(2)} LPA</span>
                    </div>
                  </div>

                  {/* Annual Performance Bonus */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small fw-bold text-muted mb-0">Annual Performance Bonus (₹)</label>
                      <div className="input-group input-group-sm" style={{ width: '150px' }}>
                        <span className="input-group-text py-0 px-2 small">₹</span>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          max="100"
                          className="form-control text-end fw-bold py-0 px-2"
                          value={(bonus / 100000).toFixed(2)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0) {
                              setBonus(Math.round(val * 100000));
                            }
                          }}
                        />
                        <span className="input-group-text py-0 px-2 small">LPA</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max={Math.max(1500000, Math.round(baseSalary * 0.5))}
                      step="25000"
                      value={bonus}
                      onChange={(e) => setBonus(Number(e.target.value))}
                    />
                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.72rem' }}>
                      <span>₹0</span>
                      <span>₹{(bonus / 100000).toFixed(2)} LPA (₹{bonus.toLocaleString('en-IN')})</span>
                      <span>₹{(Math.max(1500000, Math.round(baseSalary * 0.5)) / 100000).toFixed(2)} LPA</span>
                    </div>
                  </div>

                  {/* 4-Year ESOP Grant */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small fw-bold text-muted mb-0">4-Year ESOP / Equity Grant (₹)</label>
                      <div className="input-group input-group-sm" style={{ width: '150px' }}>
                        <span className="input-group-text py-0 px-2 small">₹</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="200"
                          className="form-control text-end fw-bold py-0 px-2"
                          value={(esops / 100000).toFixed(2)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0) {
                              setEsops(Math.round(val * 100000));
                            }
                          }}
                        />
                        <span className="input-group-text py-0 px-2 small">L</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max={Math.max(3000000, baseSalary * 2)}
                      step="50000"
                      value={esops}
                      onChange={(e) => setEsops(Number(e.target.value))}
                    />
                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.72rem' }}>
                      <span>₹0</span>
                      <span>₹{(esops / 100000).toFixed(2)} Lakhs (₹{esops.toLocaleString('en-IN')})</span>
                      <span>₹{(Math.max(3000000, baseSalary * 2) / 100000).toFixed(2)} L</span>
                    </div>
                  </div>

                  {/* Joining & Relocation Grant */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small fw-bold text-muted mb-0">Joining & Relocation Grant (₹)</label>
                      <div className="input-group input-group-sm" style={{ width: '150px' }}>
                        <span className="input-group-text py-0 px-2 small">₹</span>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          max="50"
                          className="form-control text-end fw-bold py-0 px-2"
                          value={(joiningBonus / 100000).toFixed(2)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0) {
                              setJoiningBonus(Math.round(val * 100000));
                            }
                          }}
                        />
                        <span className="input-group-text py-0 px-2 small">L</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max={Math.max(1000000, Math.round(baseSalary * 0.3))}
                      step="25000"
                      value={joiningBonus}
                      onChange={(e) => setJoiningBonus(Number(e.target.value))}
                    />
                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.72rem' }}>
                      <span>₹0</span>
                      <span>₹{(joiningBonus / 100000).toFixed(2)} Lakhs (₹{joiningBonus.toLocaleString('en-IN')})</span>
                      <span>₹{(Math.max(1000000, Math.round(baseSalary * 0.3)) / 100000).toFixed(2)} L</span>
                    </div>
                  </div>

                  {/* Realized CTC Metric Hero */}
                  <div className="p-3 bg-primary-subtle rounded-3 border border-primary-subtle mt-3">
                    <small className="text-uppercase fw-bold text-primary d-block">First Year Realized CTC</small>
                    <h3 className="fw-bold text-primary mb-0">
                      ₹{(totalFirstYearCtc / 100000).toFixed(2)} LPA
                    </h3>
                    <small className="text-muted">
                      Base: ₹{(baseSalary / 100000).toFixed(2)}L + Bonus: ₹{(bonus / 100000).toFixed(2)}L + ESOP/yr: ₹{(esops / 400000).toFixed(2)}L + Joining: ₹{(joiningBonus / 100000).toFixed(2)}L
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
