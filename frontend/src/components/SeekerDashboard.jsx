import React, { useState } from 'react';
import { applicationService } from '../services/api';
import SeekerOfferLetterModal from './SeekerOfferLetterModal';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

export default function SeekerDashboard({ user, onFindJobs, syncTrigger, onSyncTrigger }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOfferApp, setSelectedOfferApp] = useState(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchMyApplications = async (silent = false) => {
    if (!silent && applications.length === 0) {
      setLoading(true);
    }
    try {
      const res = await applicationService.getMyApplications();
      setApplications(res.data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(fetchMyApplications, 3000, [syncTrigger]);

  const handleWithdrawApplication = async (app) => {
    const isAccepted = app.status === 'ACCEPTED';
    const confirmMsg = isAccepted
      ? `The recruiter has extended an offer for "${app.job?.title}". Are you sure you want to withdraw your application and decline the position?`
      : `Are you sure you want to withdraw your application for "${app.job?.title}" at ${app.job?.company || 'this company'}?`;

    if (!window.confirm(confirmMsg)) return;

    setWithdrawingId(app.id);
    try {
      await applicationService.withdrawApplication(app.id);
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: 'WITHDRAWN' } : a))
      );
      setMessage({
        type: 'warning',
        text: `Application for "${app.job?.title}" has been successfully withdrawn.`,
      });
      setTimeout(() => setMessage(null), 4000);
      if (onSyncTrigger) onSyncTrigger();
    } catch (err) {
      console.error('Failed to withdraw application:', err);
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to withdraw application. Please try again.',
      });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OFFER_ACCEPTED':
        return <span className="badge bg-success text-white py-1 px-2 shadow-sm"><i className="bi bi-award-fill me-1"></i> Offer Accepted & Signed</span>;
      case 'ACCEPTED':
        return <span className="badge bg-primary-subtle text-primary border border-primary-subtle py-1 px-2"><i className="bi bi-gift-fill me-1"></i> Offer Extended (Action Required)</span>;
      case 'SHORTLISTED':
        return <span className="badge bg-primary"><i className="bi bi-star me-1"></i> Shortlisted</span>;
      case 'WITHDRAWN':
        return <span className="badge bg-secondary"><i className="bi bi-dash-circle me-1"></i> Withdrawn</span>;
      case 'REJECTED':
        return <span className="badge bg-danger"><i className="bi bi-x-circle me-1"></i> Not Selected</span>;
      default:
        return <span className="badge bg-warning text-dark"><i className="bi bi-clock-history me-1"></i> In Review</span>;
    }
  };

  return (
    <div className="container py-4">
      {/* Seeker Profile Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-4 bg-white rounded-3 border shadow-sm">
        <div>
          <span className="badge bg-success text-white mb-1">Candidate Profile</span>
          <h2 className="h4 mb-0 text-dark fw-bold">{user?.name}</h2>
          <small className="text-muted"><i className="bi bi-envelope me-1"></i> {user?.email} &bull; <i className="bi bi-phone me-1"></i> {user?.contactNumber || 'Not provided'}</small>
        </div>
        <button className="btn btn-cobalt btn-sm px-3" onClick={onFindJobs}>
          <i className="bi bi-search me-1"></i> Browse More Jobs
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.type} py-2 small alert-dismissible fade show`} role="alert">
          {message.text}
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-journal-text me-2 text-primary"></i> My Applied Jobs ({applications.length})</h5>
          <button className="btn btn-outline-secondary btn-sm py-1 px-2" onClick={fetchMyApplications}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted mt-2 small">Loading your applications from MySQL...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Job Title & Company</th>
                  <th>Location</th>
                  <th>Job Type</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th className="text-end">Action & Documents</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      You have not applied for any jobs yet. Browse available jobs and apply!
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <strong className="text-dark">{app.job?.title}</strong>
                        <small className="text-muted d-block">{app.job?.company}</small>
                      </td>
                      <td><i className="bi bi-geo-alt text-muted me-1"></i>{app.job?.location}</td>
                      <td><span className="badge bg-light text-primary border">{app.job?.jobType}</span></td>
                      <td className="small text-muted">{app.appliedDate?.substring(0, 10)}</td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end gap-2 flex-wrap">
                          {(app.status === 'ACCEPTED' || app.status === 'OFFER_ACCEPTED' || app.offerDetails) && (
                            <button
                              className={`btn ${app.status === 'OFFER_ACCEPTED' ? 'btn-outline-success' : 'btn-success'} btn-sm py-1 px-3 fw-bold shadow-sm`}
                              onClick={() => {
                                setSelectedOfferApp(app);
                                setOfferModalOpen(true);
                              }}
                            >
                              <i className="bi bi-file-earmark-check-fill me-1"></i>
                              {app.status === 'OFFER_ACCEPTED' ? 'View Signed Offer' : 'Review & Accept Offer'}
                            </button>
                          )}

                          {app.status === 'WITHDRAWN' ? (
                            <span className="badge bg-light text-secondary border py-1 px-2" style={{ fontSize: '0.75rem' }}>
                              <i className="bi bi-slash-circle me-1"></i> Application Withdrawn
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm py-1 px-2 fw-semibold"
                              style={{ fontSize: '0.75rem' }}
                              disabled={withdrawingId === app.id}
                              onClick={() => handleWithdrawApplication(app)}
                              title="Withdraw your application for this position"
                            >
                              {withdrawingId === app.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                  Withdrawing...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-dash-circle me-1"></i> Withdraw
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidate Offer Letter Viewer Modal */}
      <SeekerOfferLetterModal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        application={selectedOfferApp}
        onOfferAccepted={() => {
          fetchMyApplications();
          if (onSyncTrigger) onSyncTrigger();
          if (selectedOfferApp) {
            setSelectedOfferApp({ ...selectedOfferApp, status: 'OFFER_ACCEPTED' });
          }
        }}
      />
    </div>
  );
}
