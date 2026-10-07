import React, { useState, useEffect } from 'react';
import { applicationService } from '../services/api';
import SeekerOfferLetterModal from './SeekerOfferLetterModal';

export default function SeekerDashboard({ user, onFindJobs, syncTrigger, onSyncTrigger }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOfferApp, setSelectedOfferApp] = useState(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);

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

  useEffect(() => {
    fetchMyApplications(applications.length > 0);

    // Auto-sync polling every 4 seconds in background
    const syncTimer = setInterval(() => {
      fetchMyApplications(true);
    }, 4000);

    const handleFocus = () => fetchMyApplications(true);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(syncTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [syncTrigger]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i> Offer Extended</span>;
      case 'SHORTLISTED':
        return <span className="badge bg-primary"><i className="bi bi-star me-1"></i> Shortlisted</span>;
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
          {user?.bioOrSkills && (
            <div className="mt-2 small text-primary fw-semibold">
              <i className="bi bi-code-slash me-1"></i> Skills: {user.bioOrSkills}
            </div>
          )}
        </div>
        <button className="btn btn-cobalt btn-sm px-3" onClick={onFindJobs}>
          <i className="bi bi-search me-1"></i> Browse More Jobs
        </button>
      </div>

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
                        {(app.status === 'ACCEPTED' || app.offerDetails) ? (
                          <button
                            className="btn btn-success btn-sm py-1 px-3 fw-bold shadow-sm"
                            onClick={() => {
                              setSelectedOfferApp(app);
                              setOfferModalOpen(true);
                            }}
                          >
                            <i className="bi bi-file-earmark-check-fill me-1"></i> View Offer Letter
                          </button>
                        ) : (
                          <span className="text-muted small italic">Awaiting Recruiter Review</span>
                        )}
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
      />
    </div>
  );
}
