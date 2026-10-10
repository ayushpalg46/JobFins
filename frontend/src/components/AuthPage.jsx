import React, { useState } from 'react';

export default function AuthPage({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('ROLE_SEEKER'); // 'ROLE_SEEKER' or 'ROLE_RECRUITER'
  const [companyName, setCompanyName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [bioOrSkills, setBioOrSkills] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please provide both email and password.');
        }
        await onLogin(email.trim(), password.trim());
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please provide both email and password.');
        }
        await onRegister({
          name: email.trim().split('@')[0],
          email: email.trim(),
          password: password.trim(),
          role,
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-gateway-wrapper d-flex align-items-center justify-content-center py-5 px-3">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-7 col-xl-6">
            
            {/* Main Auth Card */}
            <div className="auth-glass-card shadow-lg rounded-4 overflow-hidden">
              
              {/* Brand Top Header */}
              <div className="auth-card-header text-center p-4 pb-3 border-bottom">
                <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                  <img src="/logo.svg" alt="JobFins Logo" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
                  <span className="brand-title fs-3 mb-0">
                    <span className="brand-job">Job</span><span className="brand-fins">Fins</span>
                  </span>
                </div>
                <h4 className="fw-bold text-dark mb-1">
                  {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
                </h4>
                <p className="text-muted small mb-0">
                  {mode === 'login' 
                    ? 'Please sign in to access verified career opportunities and talent ATS' 
                    : 'Create your account to start applying or hiring top candidates'}
                </p>
              </div>

              {/* Mode Toggle Pills */}
              <div className="px-4 pt-3">
                <div className="auth-tab-switch p-1 rounded-3 d-flex bg-light border">
                  <button
                    type="button"
                    className={`btn flex-fill py-2 fw-bold text-sm ${mode === 'login' ? 'btn-cobalt shadow-sm' : 'text-muted'}`}
                    onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                  </button>
                  <button
                    type="button"
                    className={`btn flex-fill py-2 fw-bold text-sm ${mode === 'register' ? 'btn-cobalt shadow-sm' : 'text-muted'}`}
                    onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
                  >
                    <i className="bi bi-person-plus me-1"></i> Create Account
                  </button>
                </div>
              </div>

              {/* Alerts */}
              <div className="px-4 pt-3">
                {error && (
                  <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-0">
                    <i className="bi bi-exclamation-circle-fill"></i>
                    <div>{error}</div>
                  </div>
                )}
                {successMsg && (
                  <div className="alert alert-success py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-0">
                    <i className="bi bi-check-circle-fill"></i>
                    <div>{successMsg}</div>
                  </div>
                )}
              </div>

              {/* Main Auth Form */}
              <form onSubmit={handleSubmit} className="p-4 pt-3">
                {mode === 'register' && (
                  /* Role Selection Segment */
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark text-uppercase" style={{ fontSize: '0.72rem' }}>
                      Choose Account Role
                    </label>
                    <div className="row g-2">
                      <div className="col-6">
                        <div
                          className={`role-select-card p-2 rounded-3 border text-center cursor-pointer ${role === 'ROLE_SEEKER' ? 'active-role' : ''}`}
                          onClick={() => setRole('ROLE_SEEKER')}
                        >
                          <i className="bi bi-person-badge display-6 text-primary d-block mb-1"></i>
                          <div className="fw-bold small text-dark">Job Seeker</div>
                          <small className="text-muted" style={{ fontSize: '0.68rem' }}>Find & Apply to Jobs</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div
                          className={`role-select-card p-2 rounded-3 border text-center cursor-pointer ${role === 'ROLE_RECRUITER' ? 'active-role' : ''}`}
                          onClick={() => setRole('ROLE_RECRUITER')}
                        >
                          <i className="bi bi-building display-6 text-indigo d-block mb-1"></i>
                          <div className="fw-bold small text-dark">Recruiter</div>
                          <small className="text-muted" style={{ fontSize: '0.68rem' }}>Post & Hire Talent</small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                    Email Address *
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope text-muted"></i></span>
                    <input
                      type="email"
                      className="form-control border-start-0"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                      Password *
                    </label>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock text-muted"></i></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control border-start-0 border-end-0"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="input-group-text bg-light border-start-0 text-muted"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-cobalt w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <i className={`bi ${mode === 'login' ? 'bi-box-arrow-in-right' : 'bi-check2-circle'}`}></i>
                      <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Card Footer */}
              <div className="auth-card-footer p-3 bg-light text-center border-top">
                <small className="text-muted d-block mb-1">
                  {mode === 'login' ? "Don't have an account yet?" : "Already have an account?"}{' '}
                  <a
                    className="fw-bold text-primary cursor-pointer text-decoration-none"
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                  >
                    {mode === 'login' ? 'Register Now' : 'Sign In'}
                  </a>
                </small>
                <div className="text-muted" style={{ fontSize: '0.68rem' }}>
                  <i className="bi bi-shield-lock-fill text-success me-1"></i>
                  Protected with Secure HMAC-SHA256 JWT Authentication
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
