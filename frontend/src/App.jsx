import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSearch from './components/HeroSearch';
import JobCard from './components/JobCard';
import JobDetailsModal from './components/JobDetailsModal';
import AuthModal from './components/AuthModal';
import AuthPage from './components/AuthPage';
import PostJobModal from './components/PostJobModal';
import RecruiterDashboard from './components/RecruiterDashboard';
import SeekerDashboard from './components/SeekerDashboard';
import TalentSourcing from './components/TalentSourcing';
import OfferBuilderModal from './components/OfferBuilderModal';
import SalaryGuide from './components/SalaryGuide';
import CareerTips from './components/CareerTips';
import CompanyDirectory from './components/CompanyDirectory';
import UserProfile from './components/UserProfile';
import Footer from './components/Footer';
import { authService, jobService, applicationService, labService } from './services/api';

export default function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Navigation view state: 'home', 'recruiter-dashboard', 'seeker-dashboard', 'salary-guide', 'companies', 'career-tips', 'profile'
  const [currentView, setCurrentView] = useState('home');

  // Job portal states
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Selected job & Modals
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [postJobModalOpen, setPostJobModalOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerCandidate, setOfferCandidate] = useState(null);

  // Stats & Real-Time Sync
  const [stats, setStats] = useState(null);
  const [syncTrigger, setSyncTrigger] = useState(0);

  const triggerGlobalSync = () => {
    setSyncTrigger((prev) => prev + 1);
    loadJobs(true);
    loadStats();
  };

  useEffect(() => {
    checkSavedAuth();
    loadJobs();
    loadStats();

    // Background auto-refresh polling every 4 seconds to sync database changes automatically
    const syncInterval = setInterval(() => {
      loadJobs(true);
      loadStats();
    }, 4000);

    const handleFocusSync = () => {
      loadJobs(true);
      loadStats();
      setSyncTrigger((prev) => prev + 1);
    };

    window.addEventListener('focus', handleFocusSync);
    document.addEventListener('visibilitychange', handleFocusSync);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocusSync);
      document.removeEventListener('visibilitychange', handleFocusSync);
    };
  }, []);

  // When switching views, immediately trigger a fresh data sync
  useEffect(() => {
    loadJobs(true);
    loadStats();
    setSyncTrigger((prev) => prev + 1);
  }, [currentView]);

  // Filter jobs when search parameters change
  useEffect(() => {
    let result = jobs;
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase().trim();
      result = result.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.company?.toLowerCase().includes(q) ||
          j.description?.toLowerCase().includes(q) ||
          j.requirements?.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q)
      );
    }
    if (locationFilter.trim()) {
      const loc = locationFilter.toLowerCase().trim();
      result = result.filter((j) => j.location?.toLowerCase().includes(loc));
    }
    if (typeFilter !== 'all') {
      result = result.filter((j) => j.jobType === typeFilter);
    }
    setFilteredJobs(result);
  }, [jobs, searchKeyword, locationFilter, typeFilter]);

  const checkSavedAuth = async () => {
    const token = localStorage.getItem('jobfins_token');
    const savedUser = localStorage.getItem('jobfins_user');
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Fetch fresh profile from backend to ensure latest companyName and profile fields are synchronized
        authService
          .getProfile()
          .then((res) => {
            if (res.data) {
              const freshUser = { ...parsed, ...res.data };
              setUser(freshUser);
              localStorage.setItem('jobfins_user', JSON.stringify(freshUser));
            }
          })
          .catch((err) => {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
              console.warn('Stored token is invalid or expired. Resetting session.');
              localStorage.removeItem('jobfins_token');
              localStorage.removeItem('jobfins_user');
              setUser(null);
            }
          });
      } catch (e) {
        localStorage.removeItem('jobfins_token');
        localStorage.removeItem('jobfins_user');
        setUser(null);
      }
    }
  };

  const loadJobs = async (silent = false) => {
    if (!silent && jobs.length === 0) {
      setLoadingJobs(true);
    }
    try {
      const res = await jobService.getAllJobs();
      setJobs(res.data || []);
      setFilteredJobs(res.data || []);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await labService.getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleLogin = async (email, password) => {
    const res = await authService.login(email, password);
    const { token, id, name, role, companyName } = res.data;
    const userData = { id, name, email, role, companyName };
    localStorage.setItem('jobfins_token', token);
    localStorage.setItem('jobfins_user', JSON.stringify(userData));
    setUser(userData);
    triggerGlobalSync();
    if (role === 'ROLE_RECRUITER') {
      setCurrentView('recruiter-dashboard');
    } else {
      setCurrentView('home');
    }
  };

  const handleRegister = async (registerData) => {
    await authService.register(registerData);
    // Immediately log the newly registered user in and route them to complete their full profile details
    const res = await authService.login(registerData.email, registerData.password);
    const { token, id, name, role, companyName } = res.data;
    const userData = { id, name, email: registerData.email, role, companyName, isFirstTimeOnboarding: true };
    localStorage.setItem('jobfins_token', token);
    localStorage.setItem('jobfins_user', JSON.stringify(userData));
    setUser(userData);
    triggerGlobalSync();
    setCurrentView('profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('jobfins_token');
    localStorage.removeItem('jobfins_user');
    setUser(null);
    setCurrentView('home');
  };

  const handleApplySubmit = async (jobId, applicationData) => {
    await applicationService.applyForJob(jobId, applicationData);
    triggerGlobalSync();
  };

  const handleJobCreated = async (jobData) => {
    await jobService.createJob(jobData);
    triggerGlobalSync();
  };

  // If user is not authenticated, enforce the required Auth Gate
  if (!user) {
    return (
      <AuthPage
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Top Horizontal Navigation Bar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenLogin={() => {
          setAuthMode('login');
          setAuthModalOpen(true);
        }}
        onOpenRegister={() => {
          setAuthMode('register');
          setAuthModalOpen(true);
        }}
        onOpenPostJob={() => setPostJobModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow-1" style={{ marginTop: '70px' }}>
        {currentView === 'recruiter-dashboard' && user?.role === 'ROLE_RECRUITER' ? (
          <RecruiterDashboard
            user={user}
            syncTrigger={syncTrigger}
            onSyncTrigger={triggerGlobalSync}
            onOpenPostJob={() => setPostJobModalOpen(true)}
            onExtendOffer={(cand) => {
              setOfferCandidate(cand);
              setOfferModalOpen(true);
            }}
          />
        ) : currentView === 'talent-sourcing' && user?.role === 'ROLE_RECRUITER' ? (
          <TalentSourcing
            onExtendOffer={(cand) => {
              setOfferCandidate(cand);
              setOfferModalOpen(true);
            }}
          />
        ) : currentView === 'seeker-dashboard' && user?.role === 'ROLE_SEEKER' ? (
          <SeekerDashboard
            user={user}
            syncTrigger={syncTrigger}
            onSyncTrigger={triggerGlobalSync}
            onFindJobs={() => setCurrentView('home')}
          />
        ) : currentView === 'profile' ? (
          <UserProfile
            user={user}
            onProfileUpdated={(updatedUser) => {
              setUser(updatedUser);
              triggerGlobalSync();
            }}
            onFindJobs={() => setCurrentView('home')}
            onOpenPostJob={() => setPostJobModalOpen(true)}
          />
        ) : currentView === 'salary-guide' ? (
          <SalaryGuide
            onSearchRole={(roleTerm) => {
              setSearchKeyword(roleTerm);
              setCurrentView('home');
            }}
          />
        ) : currentView === 'companies' ? (
          <CompanyDirectory
            onSelectCompany={(companyName) => {
              setSearchKeyword(companyName);
              setCurrentView('home');
            }}
          />
        ) : currentView === 'career-tips' ? (
          <CareerTips
            user={user}
            onOpenLogin={() => {
              setAuthMode('login');
              setAuthModalOpen(true);
            }}
          />
        ) : (
          /* Home / Jobs View: Hero, Search Matrix, and Job Catalog */
          <>
            <HeroSearch
              searchKeyword={searchKeyword}
              setSearchKeyword={setSearchKeyword}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              onSearch={loadJobs}
              stats={stats}
            />

            <section className="py-5" id="jobs-section">
              <div className="container">
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                  <div>
                    <h2 className="h4 mb-1 text-dark fw-bold">Featured Opportunities</h2>
                    <p className="text-muted small mb-0">
                      Showing {filteredJobs.length} verified developer jobs matching your criteria
                    </p>
                  </div>
                  <button
                    className="btn btn-outline-custom btn-sm"
                    onClick={() => {
                      setSearchKeyword('');
                      setLocationFilter('');
                      setTypeFilter('all');
                    }}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i> Reset Filters
                  </button>
                </div>

                {loadingJobs ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="text-muted mt-2 small">Loading opportunities...</p>
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="text-center py-5 bg-white rounded-3 border shadow-sm">
                    <i className="bi bi-search display-5 text-muted mb-2 d-block"></i>
                    <h6 className="fw-bold text-dark">No matching job listings found</h6>
                    <p className="text-muted small">Try adjusting your search keywords or location filter.</p>
                  </div>
                ) : (
                  <div className="row g-4">
                    {filteredJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onSelectJob={(j) => {
                          setSelectedJob(j);
                          setDetailsModalOpen(true);
                        }}
                        onApplyJob={(j) => {
                          setSelectedJob(j);
                          setDetailsModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Modals */}
      <JobDetailsModal
        job={selectedJob}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onApplySubmit={handleApplySubmit}
        user={user}
      />

      <AuthModal
        isOpen={authModalOpen}
        mode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />

      <PostJobModal
        isOpen={postJobModalOpen}
        onClose={() => setPostJobModalOpen(false)}
        onJobCreated={handleJobCreated}
        user={user}
        onOpenLogin={() => {
          setAuthMode('login');
          setAuthModalOpen(true);
        }}
      />

      <OfferBuilderModal
        candidate={offerCandidate}
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        user={user}
        onOfferDispatched={triggerGlobalSync}
      />

      {/* Footer */}
      <Footer
        onOpenLogin={() => {
          setAuthMode('login');
          setAuthModalOpen(true);
        }}
        onOpenRegister={() => {
          setAuthMode('register');
          setAuthModalOpen(true);
        }}
        onOpenPostJob={() => setPostJobModalOpen(true)}
      />
    </div>
  );
}
