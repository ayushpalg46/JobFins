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
  const [transitFilter, setTransitFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Selected job & Modals
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [postJobModalOpen, setPostJobModalOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerCandidate, setOfferCandidate] = useState(null);

  // Stats
  const [stats, setStats] = useState(null);

  useEffect(() => {
    checkSavedAuth();
    loadJobs();
    loadStats();
  }, []);

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
    if (transitFilter.trim()) {
      const tf = transitFilter.toLowerCase();
      result = result.filter((j) => {
        const loc = (j.location || '').toLowerCase();
        const type = (j.jobType || '').toLowerCase();
        if (tf.includes('western')) {
          return loc.includes('mumbai') || loc.includes('western') || loc.includes('andheri') || loc.includes('bandra') || loc.includes('borivali') || loc.includes('malad') || loc.includes('goregaon') || loc.includes('churchgate') || loc.includes('dadar');
        } else if (tf.includes('central')) {
          return loc.includes('mumbai') || loc.includes('central') || loc.includes('thane') || loc.includes('kurla') || loc.includes('ghatkopar') || loc.includes('kalyan') || loc.includes('csmt');
        } else if (tf.includes('harbour')) {
          return loc.includes('navi mumbai') || loc.includes('vashi') || loc.includes('belapur') || loc.includes('panvel') || loc.includes('harbour');
        } else if (tf.includes('metro')) {
          return loc.includes('metro') || loc.includes('andheri') || loc.includes('ghatkopar') || loc.includes('mumbai');
        } else if (tf.includes('bangalore')) {
          return loc.includes('bangalore') || loc.includes('bengaluru') || loc.includes('whitefield') || loc.includes('electronic city') || loc.includes('orr') || loc.includes('koramangala');
        } else if (tf.includes('pune')) {
          return loc.includes('pune') || loc.includes('hinjewadi') || loc.includes('magarpatta') || loc.includes('baner');
        } else if (tf.includes('remote')) {
          return loc.includes('remote') || type.includes('remote');
        }
        return loc.includes(tf);
      });
    }
    if (typeFilter !== 'all') {
      result = result.filter((j) => j.jobType === typeFilter);
    }
    setFilteredJobs(result);
  }, [jobs, searchKeyword, locationFilter, transitFilter, typeFilter]);


  const checkSavedAuth = async () => {
    const token = localStorage.getItem('jobfins_token');
    const savedUser = localStorage.getItem('jobfins_user');
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('jobfins_token');
        localStorage.removeItem('jobfins_user');
      }
    }
  };

  const loadJobs = async () => {
    setLoadingJobs(true);
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
    if (role === 'ROLE_RECRUITER') {
      setCurrentView('recruiter-dashboard');
    } else {
      setCurrentView('home');
    }
  };

  const handleRegister = async (registerData) => {
    await authService.register(registerData);
  };

  const handleLogout = () => {
    localStorage.removeItem('jobfins_token');
    localStorage.removeItem('jobfins_user');
    setUser(null);
    setCurrentView('home');
  };

  const handleApplySubmit = async (jobId, applicationData) => {
    await applicationService.applyForJob(jobId, applicationData);
    loadStats();
  };

  const handleJobCreated = async (jobData) => {
    await jobService.createJob(jobData);
    loadJobs();
    loadStats();
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
            onFindJobs={() => setCurrentView('home')}
          />
        ) : currentView === 'profile' ? (
          <UserProfile
            user={user}
            onProfileUpdated={(updatedUser) => setUser(updatedUser)}
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
          <CareerTips />
        ) : (
          /* Home / Jobs View: Hero, Search Matrix, and Job Catalog */
          <>
            <HeroSearch
              searchKeyword={searchKeyword}
              setSearchKeyword={setSearchKeyword}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              transitFilter={transitFilter}
              setTransitFilter={setTransitFilter}
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
                      setTransitFilter('');
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
