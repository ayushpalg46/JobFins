import React from 'react';

export default function Navbar({
  user,
  onLogout,
  currentView,
  setCurrentView,
  onOpenLogin,
  onOpenRegister,
  onOpenPostJob,
}) {
  return (
    <nav className="navbar navbar-expand-lg navbar-custom fixed-top">
      <div className="container-fluid px-lg-5">
        {/* Top Brand Logo */}
        <a
          className="navbar-brand d-flex align-items-center gap-2 cursor-pointer"
          onClick={() => setCurrentView(user?.role === 'ROLE_RECRUITER' ? 'recruiter-dashboard' : 'home')}
        >
          <img src="/logo.svg" alt="JobFins Logo" style={{ maxHeight: '36px', width: 'auto', objectFit: 'contain' }} />
          <span className="brand-title fs-4 mb-0">
            <span className="brand-job">Job</span><span className="brand-fins">Fins</span>
          </span>
        </a>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#reactNavbarContent"
          aria-controls="reactNavbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Horizontal Navigation Links - Centered */}
        <div className="collapse navbar-collapse" id="reactNavbarContent">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 d-flex align-items-center justify-content-center">
            {/* Show 'Jobs' tab only for Job Seekers or unauthenticated visitors */}
            {(!user || user.role !== 'ROLE_RECRUITER') && (
              <li className="nav-item">
                <a
                  className={`nav-link nav-link-custom ${currentView === 'home' ? 'active' : ''}`}
                  onClick={() => setCurrentView('home')}
                >
                  <i className="bi bi-briefcase me-1"></i> Jobs
                </a>
              </li>
            )}

            {/* Recruiter-only dedicated Navigation Links */}
            {user && user.role === 'ROLE_RECRUITER' && (
              <>
                <li className="nav-item">
                  <a
                    className={`nav-link nav-link-custom ${currentView === 'recruiter-dashboard' ? 'active' : ''}`}
                    onClick={() => setCurrentView('recruiter-dashboard')}
                  >
                    <i className="bi bi-kanban me-1"></i> Recruiter ATS
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link nav-link-custom ${currentView === 'talent-sourcing' ? 'active' : ''}`}
                    onClick={() => setCurrentView('talent-sourcing')}
                  >
                    <i className="bi bi-person-search me-1"></i> Talent Sourcing
                  </a>
                </li>
              </>
            )}

            {/* Job Seeker dedicated Navigation Links */}
            {user && user.role === 'ROLE_SEEKER' && (
              <li className="nav-item">
                <a
                  className={`nav-link nav-link-custom ${currentView === 'seeker-dashboard' ? 'active' : ''}`}
                  onClick={() => setCurrentView('seeker-dashboard')}
                >
                  <i className="bi bi-journal-check me-1"></i> My Applications
                </a>
              </li>
            )}

            <li className="nav-item">
              <a
                className={`nav-link nav-link-custom ${currentView === 'salary-guide' ? 'active' : ''}`}
                onClick={() => setCurrentView('salary-guide')}
              >
                <i className="bi bi-cash-coin me-1"></i> Salary Guides
              </a>
            </li>

            {/* Show 'Companies' tab only for Job Seekers or unauthenticated visitors */}
            {(!user || user.role !== 'ROLE_RECRUITER') && (
              <li className="nav-item">
                <a
                  className={`nav-link nav-link-custom ${currentView === 'companies' ? 'active' : ''}`}
                  onClick={() => setCurrentView('companies')}
                >
                  <i className="bi bi-buildings me-1"></i> Companies
                </a>
              </li>
            )}

            {/* Career Tips accessible to both Candidate & Recruiter */}
            <li className="nav-item">
              <a
                className={`nav-link nav-link-custom ${currentView === 'career-tips' ? 'active' : ''}`}
                onClick={() => setCurrentView('career-tips')}
              >
                <i className="bi bi-lightbulb me-1"></i> Career Tips
              </a>
            </li>

            {user && (
              <li className="nav-item">
                <a
                  className={`nav-link nav-link-custom ${currentView === 'profile' ? 'active' : ''}`}
                  onClick={() => setCurrentView('profile')}
                >
                  <i className="bi bi-person-badge me-1"></i> My Profile
                </a>
              </li>
            )}
          </ul>

          {/* Right Action Bar */}
          <div className="d-flex align-items-center gap-2">
            {!user ? (
              <>
                <button className="btn btn-outline-custom btn-sm px-3" onClick={onOpenLogin}>
                  <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                </button>
                <button className="btn btn-navy btn-sm px-3" onClick={onOpenRegister}>
                  <i className="bi bi-person-plus me-1"></i> Register
                </button>
                <button className="btn btn-cobalt btn-sm px-3" onClick={onOpenPostJob}>
                  <i className="bi bi-plus-circle me-1"></i> Post a Job
                </button>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                {/* Profile Pill */}
                <button
                  className={`btn btn-sm ${currentView === 'profile' ? 'btn-primary' : 'btn-outline-custom'} d-flex align-items-center gap-2 px-3`}
                  onClick={() => setCurrentView('profile')}
                  title="Manage Profile"
                >
                  <i className="bi bi-person-circle"></i>
                  <span className="fw-bold d-none d-sm-inline">{user.name?.split(' ')[0] || 'Profile'}</span>
                </button>

                {user.role === 'ROLE_RECRUITER' && (
                  <button className="btn btn-cobalt btn-sm px-3" onClick={onOpenPostJob}>
                    <i className="bi bi-plus-lg me-1"></i> Post Job
                  </button>
                )}

                <button className="btn btn-outline-danger btn-sm" onClick={onLogout} title="Log Out">
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
