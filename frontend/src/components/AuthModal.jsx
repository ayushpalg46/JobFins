import React, { useState } from 'react';

export default function AuthModal({ isOpen, mode, onClose, onLogin, onRegister, onSwitchMode }) {
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_SEEKER');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        await onLogin(email, password);
        onClose();
      } else {
        await onRegister({
          name: email.split('@')[0],
          email,
          password,
          role,
        });
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(10,25,47,0.6)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header align-items-center">
            <div className="d-flex align-items-center gap-2">
              <img src="/logo.svg" alt="JobFins Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
              <h5 className="modal-title fw-bold text-dark mb-0">
                {mode === 'login' ? 'Sign In to JobFins' : 'Create an Account'}
              </h5>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            {successMsg && <div className="alert alert-success py-2 small">{successMsg}</div>}

            <form onSubmit={handleAuthSubmit}>
              {mode === 'register' && (
                <div className="mb-3">
                  <label className="form-label small fw-bold">I am a:</label>
                  <select
                    className="form-select form-select-sm"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="ROLE_SEEKER">Job Seeker (Applying for jobs)</option>
                    <option value="ROLE_RECRUITER">Job Recruiter (Hiring talent)</option>
                  </select>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small fw-bold">Email Address</label>
                <input
                  type="email"
                  className="form-control form-control-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Password</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <button type="submit" className="btn btn-cobalt w-100 py-2 btn-sm fw-bold" disabled={loading}>
                {loading ? 'Processing...' : mode === 'login' ? 'Sign In with JWT' : 'Create Account'}
              </button>
            </form>

            <div className="text-center mt-3 pt-2 border-top">
              {mode === 'login' ? (
                <small className="text-muted">
                  Don't have an account?{' '}
                  <a className="text-primary fw-bold cursor-pointer" onClick={() => onSwitchMode('register')}>
                    Register here
                  </a>
                </small>
              ) : (
                <small className="text-muted">
                  Already have an account?{' '}
                  <a className="text-primary fw-bold cursor-pointer" onClick={() => onSwitchMode('login')}>
                    Sign In
                  </a>
                </small>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
