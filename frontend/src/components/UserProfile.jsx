import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';

// Curated industry tech stack catalogue grouped by domain
const TECH_STACK_CATALOGUE = {
  'Core & Full Stack': [
    'Java', 'Spring Boot', 'Spring Security', 'Hibernate/JPA', 'React.js', 'Next.js', 
    'TypeScript', 'JavaScript', 'Node.js', 'Express.js', 'Python', 'Django', 
    'FastAPI', 'Go (Golang)', 'Rust', 'C# / .NET', 'C++', 'GraphQL', 'REST APIs'
  ],
  'Databases & Caching': [
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB', 
    'Cassandra', 'SQLite', 'Firebase', 'Supabase'
  ],
  'Cloud & DevOps': [
    'Docker', 'Kubernetes', 'AWS', 'Google Cloud (GCP)', 'Microsoft Azure', 
    'Terraform', 'CI/CD (GitHub Actions)', 'Linux / Bash', 'Helm', 'Prometheus / Grafana'
  ],
  'Mobile & Systems': [
    'Flutter', 'React Native', 'Swift (iOS)', 'Kotlin (Android)', 'Kafka', 
    'RabbitMQ', 'Microservices Architecture', 'System Design', 'Tailwind CSS'
  ]
};

const FLAT_TECH_LIST = Object.values(TECH_STACK_CATALOGUE).flat();

export default function UserProfile({ user, onProfileUpdated, onFindJobs, onOpenPostJob }) {
  const isRecruiter = user?.role === 'ROLE_RECRUITER';

  // Mode: edit or view
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'edit', 'preview'
  const [showResumeModal, setShowResumeModal] = useState(false);

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [location, setLocation] = useState('');

  // Seeker Specific Fields
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeFileSize, setResumeFileSize] = useState(null);
  const [resumeUploadDate, setResumeUploadDate] = useState('');
  const [resumeBase64, setResumeBase64] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level (3-5 Yrs)');
  
  // Structured Multi-Experience List for Seekers
  const [experiences, setExperiences] = useState([
    {
      id: 'exp-1',
      title: 'Full Stack Engineer',
      company: 'TechCorp Innovations',
      duration: '2023 - Present',
      employmentType: 'Full-time',
      description: 'Engineered high-throughput REST APIs and microservices using Spring Boot & React.'
    }
  ]);

  // Recruiter Specific Fields
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [hiringPreferences, setHiringPreferences] = useState({
    targetRoles: ['Full Stack Java', 'React / Next.js', 'DevOps / Cloud'],
    experienceRange: 'Mid to Senior (3-8 Yrs)',
    workMode: 'Hybrid / Remote Friendly',
    responseSla: 'Within 24-48 Hours',
    interviewProcess: '1. Code Proof Evaluation -> 2. Technical System Design -> 3. Offer Extension'
  });
  const [customRoleInput, setCustomRoleInput] = useState('');

  // Initial Data Population from User / Server
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setContactNumber(user.contactNumber || '');
      setLocation(user.location || (isRecruiter ? 'Bangalore HQ, India' : 'Bengaluru, India / Remote'));
      
      if (isRecruiter) {
        setCompanyName(user.companyName || 'Enterprise Talent Corp');
        setCompanyWebsite(user.companyWebsite || 'https://techcorp.io');
        setCompanyDescription(user.companyDescription || user.bioOrSkills || 'Leading cloud technology and engineering innovation company hiring top software developers.');
        
        // Parse hiring preferences if stored as JSON or string
        if (user.hiringPreferences) {
          try {
            const parsed = typeof user.hiringPreferences === 'string' 
              ? JSON.parse(user.hiringPreferences) 
              : user.hiringPreferences;
            setHiringPreferences((prev) => ({ ...prev, ...parsed }));
          } catch (e) {
            setHiringPreferences((prev) => ({ ...prev, interviewProcess: user.hiringPreferences }));
          }
        }
      } else {
        setBio(user.bioOrSkills ? user.bioOrSkills.split('|')[0].trim() : 'Passionate software engineer building resilient, high-scale web platforms and distributed services.');
        setPortfolioUrl(user.portfolioUrl || `https://github.com/${(user.name || 'developer').toLowerCase().replace(/[^a-z0-9]/g, '')}`);
        setResumeUrl(user.resumeUrl || '');
        setResumeFileName(user.resumeFileName || '');
        setResumeFileSize(user.resumeFileSize || null);
        setResumeUploadDate(user.resumeUploadDate || '');
        setResumeBase64(user.resumeBase64 || '');
        setExperienceLevel(user.experienceLevel || 'Mid-Level (3-5 Yrs)');

        // Extract skills array
        if (user.bioOrSkills) {
          const rawSkills = user.bioOrSkills.includes('|')
            ? user.bioOrSkills.split('|').slice(1).join(',').split(/[,•\n/]/)
            : user.bioOrSkills.split(/[,•\n/]/);
          const parsed = rawSkills.map((s) => s.trim()).filter((s) => s.length > 1);
          setSelectedSkills(parsed.length > 0 ? Array.from(new Set(parsed)) : ['Java', 'Spring Boot', 'React.js', 'PostgreSQL', 'Docker']);
        } else {
          setSelectedSkills(['Java', 'Spring Boot', 'React.js', 'PostgreSQL', 'Docker']);
        }

        // Parse structured experiences if present
        if (user.experienceDetails) {
          try {
            const parsedExp = JSON.parse(user.experienceDetails);
            if (Array.isArray(parsedExp) && parsedExp.length > 0) {
              setExperiences(parsedExp);
            }
          } catch (e) {
            // If raw text
            setExperiences([
              {
                id: 'exp-1',
                title: 'Senior Software Engineer',
                company: 'Current Organization',
                duration: '2 Years',
                employmentType: 'Full-time',
                description: user.experienceDetails
              }
            ]);
          }
        }
      }
    }
  }, [user, isRecruiter]);

  // Skill Management
  const handleAddSkill = (skill) => {
    if (!skill || selectedSkills.includes(skill)) return;
    setSelectedSkills([...selectedSkills, skill]);
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skillToRemove));
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const clean = customSkillInput.trim();
    if (clean && !selectedSkills.includes(clean)) {
      setSelectedSkills([...selectedSkills, clean]);
      setCustomSkillInput('');
    }
  };

  // Structured Experience Management (Seeker)
  const handleAddExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      title: '',
      company: '',
      duration: '',
      employmentType: 'Full-time',
      description: ''
    };
    setExperiences([...experiences, newExp]);
  };

  const handleUpdateExperience = (id, field, value) => {
    setExperiences(
      experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const handleRemoveExperience = (id) => {
    if (experiences.length === 1) {
      setExperiences([{ id: `exp-${Date.now()}`, title: '', company: '', duration: '', employmentType: 'Full-time', description: '' }]);
    } else {
      setExperiences(experiences.filter((exp) => exp.id !== id));
    }
  };

  // Recruiter Hiring Target Roles Management
  const handleAddTargetRole = (e) => {
    e.preventDefault();
    const clean = customRoleInput.trim();
    if (clean && !hiringPreferences.targetRoles.includes(clean)) {
      setHiringPreferences({
        ...hiringPreferences,
        targetRoles: [...hiringPreferences.targetRoles, clean]
      });
      setCustomRoleInput('');
    }
  };

  const handleRemoveTargetRole = (roleToRemove) => {
    setHiringPreferences({
      ...hiringPreferences,
      targetRoles: hiringPreferences.targetRoles.filter((r) => r !== roleToRemove)
    });
  };

  // File Upload Handling
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setFeedback({ type: 'danger', message: 'File size exceeds 8MB limit. Please upload a PDF or document under 8MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      setResumeFileName(file.name);
      setResumeFileSize(file.size);
      setResumeUploadDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
      setResumeBase64(base64Data);
      setFeedback({ type: 'success', message: `Resume "${file.name}" uploaded! Click Save to apply changes.` });
      setTimeout(() => setFeedback(null), 3500);
    };
    reader.onerror = () => {
      setFeedback({ type: 'danger', message: 'Failed to read file. Please try another document.' });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveResume = () => {
    setResumeFileName('');
    setResumeFileSize(null);
    setResumeUploadDate('');
    setResumeBase64('');
    setResumeUrl('');
    setFeedback({ type: 'info', message: 'Resume cleared. Click Save to apply changes.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Save Profile Handler
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      let combinedBioOrSkills = '';
      if (!isRecruiter) {
        combinedBioOrSkills = `${bio.trim()} | ${selectedSkills.join(', ')}`;
      } else {
        combinedBioOrSkills = companyDescription.trim();
      }

      const payload = {
        name: name.trim(),
        contactNumber: contactNumber.trim(),
        location: location.trim(),
        role: user.role,
        bioOrSkills: combinedBioOrSkills,
        companyName: isRecruiter ? companyName.trim() : null,
        companyWebsite: isRecruiter ? companyWebsite.trim() : null,
        companyDescription: isRecruiter ? companyDescription.trim() : null,
        hiringPreferences: isRecruiter ? JSON.stringify(hiringPreferences) : null,
        portfolioUrl: !isRecruiter ? portfolioUrl.trim() : null,
        resumeUrl: !isRecruiter ? resumeUrl.trim() : null,
        resumeFileName: !isRecruiter ? resumeFileName : null,
        resumeFileSize: !isRecruiter ? resumeFileSize : null,
        resumeUploadDate: !isRecruiter ? resumeUploadDate : null,
        resumeBase64: !isRecruiter ? resumeBase64 : null,
        experienceLevel: !isRecruiter ? experienceLevel : null,
        experienceDetails: !isRecruiter ? JSON.stringify(experiences.filter((exp) => exp.title || exp.company)) : null,
      };

      const res = await userService.updateProfile(payload);
      const updatedUser = {
        ...user,
        ...res.data,
        ...payload,
        isFirstTimeOnboarding: false,
      };

      localStorage.setItem('jobfins_user', JSON.stringify(updatedUser));
      onProfileUpdated(updatedUser);
      setEditing(false);
      setFeedback({ type: 'success', message: 'Profile updated and synced successfully!' });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      console.error('Failed to update profile:', err);
      // Fallback local save
      const fallbackUser = {
        ...user,
        name: name.trim(),
        contactNumber: contactNumber.trim(),
        location: location.trim(),
        companyName: isRecruiter ? companyName.trim() : null,
        companyWebsite: isRecruiter ? companyWebsite.trim() : null,
        companyDescription: isRecruiter ? companyDescription.trim() : null,
        hiringPreferences: isRecruiter ? JSON.stringify(hiringPreferences) : null,
        portfolioUrl: !isRecruiter ? portfolioUrl.trim() : null,
        resumeUrl: !isRecruiter ? resumeUrl.trim() : null,
        resumeFileName: !isRecruiter ? resumeFileName : null,
        resumeFileSize: !isRecruiter ? resumeFileSize : null,
        resumeUploadDate: !isRecruiter ? resumeUploadDate : null,
        resumeBase64: !isRecruiter ? resumeBase64 : null,
        experienceLevel: !isRecruiter ? experienceLevel : null,
        experienceDetails: !isRecruiter ? JSON.stringify(experiences) : null,
        isFirstTimeOnboarding: false,
      };
      localStorage.setItem('jobfins_user', JSON.stringify(fallbackUser));
      onProfileUpdated(fallbackUser);
      setEditing(false);
      setFeedback({ type: 'success', message: 'Profile details saved locally.' });
      setTimeout(() => setFeedback(null), 3500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Onboarding Welcome Alert if fresh account */}
      {user?.isFirstTimeOnboarding && (
        <div className="alert alert-primary shadow-sm border-0 rounded-4 p-4 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3" style={{ background: 'linear-gradient(135deg, #E0E7FF 0%, #EFF6FF 100%)' }}>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary text-white p-3 rounded-circle fs-4 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
              <i className="bi bi-sparkles"></i>
            </div>
            <div>
              <h5 className="fw-bold text-dark mb-1">Welcome to JobFins, {name || 'Professional'}! 🎉</h5>
              <p className="mb-0 text-muted small">
                {isRecruiter 
                  ? 'Complete your company hiring profile to publish jobs, review candidate proof, and extend official offer letters.' 
                  : 'Complete your candidate profile & tech stack below to start applying and get discovered in Talent Sourcing.'}
              </p>
            </div>
          </div>
          <span className="badge bg-primary px-3 py-2 fw-bold text-uppercase">Account Initialized</span>
        </div>
      )}

      {/* Profile Header Hero Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
        <div className="p-4 p-md-5" style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1E3A8A 100%)', color: '#FFFFFF' }}>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-4">
            {/* Left User Identity */}
            <div className="d-flex align-items-center gap-4">
              <div
                className="rounded-circle bg-white text-primary fw-bold d-flex align-items-center justify-content-center shadow-lg overflow-hidden border border-3 border-white-50"
                style={{ width: '88px', height: '88px', fontSize: '2.2rem' }}
              >
                {name?.charAt(0)?.toUpperCase() || (isRecruiter ? 'R' : 'S')}
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                  <span className={`badge ${isRecruiter ? 'bg-primary' : 'bg-success'} text-white fw-bold px-3 py-1`}>
                    <i className={`bi ${isRecruiter ? 'bi-building-check' : 'bi-patch-check-fill'} me-1`}></i>
                    {isRecruiter ? 'Enterprise Recruiter' : 'Verified Candidate'}
                  </span>
                  <span className="badge bg-white text-dark bg-opacity-75">
                    <i className="bi bi-shield-lock-fill text-success me-1"></i> JWT Authenticated
                  </span>
                </div>
                <h2 className="h3 fw-bold text-white mb-1">{isRecruiter ? (companyName || name) : name}</h2>
                <div className="d-flex flex-wrap gap-3 small text-white-50">
                  <span><i className="bi bi-envelope-fill me-1 text-info"></i>{email}</span>
                  <span><i className="bi bi-telephone-fill me-1 text-info"></i>{contactNumber || 'No phone added'}</span>
                  <span><i className="bi bi-geo-alt-fill me-1 text-info"></i>{location || 'India'}</span>
                </div>
              </div>
            </div>

            {/* Right Action */}
            <div className="d-flex flex-column align-items-md-end gap-2">
              <div className="d-flex gap-2">
                {!editing ? (
                  <button
                    type="button"
                    className="btn btn-light btn-sm fw-bold px-4 py-2 shadow-sm rounded-pill"
                    onClick={() => setEditing(true)}
                  >
                    <i className="bi bi-pencil-square me-1 text-primary"></i> Edit Profile
                  </button>
                ) : (
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-light btn-sm fw-bold px-3 py-2 rounded-pill"
                      onClick={() => setEditing(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-success btn-sm fw-bold px-4 py-2 rounded-pill shadow"
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-check2-circle me-1"></i>}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {feedback && (
          <div className={`alert alert-${feedback.type} m-3 mb-0 py-2 px-3 small rounded-3 d-flex align-items-center gap-2`}>
            <i className={`bi ${feedback.type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-info-circle-fill text-primary'}`}></i>
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-bottom bg-light px-4 d-flex justify-content-between align-items-center flex-wrap">
          <ul className="nav nav-tabs border-0 gap-2 pt-2">
            <li className="nav-item">
              <button
                className={`nav-link border-0 fw-bold px-4 py-2 ${!editing ? 'active text-primary bg-white rounded-top' : 'text-muted'}`}
                onClick={() => setEditing(false)}
              >
                <i className="bi bi-person-lines-fill me-2"></i> Profile Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link border-0 fw-bold px-4 py-2 ${editing ? 'active text-primary bg-white rounded-top' : 'text-muted'}`}
                onClick={() => setEditing(true)}
              >
                <i className="bi bi-gear-fill me-2"></i> Edit Details
              </button>
            </li>
          </ul>

          <div className="py-2">
            {isRecruiter ? (
              <button className="btn btn-outline-primary btn-sm fw-bold rounded-pill" onClick={onOpenPostJob}>
                <i className="bi bi-plus-circle me-1"></i> Post New Job
              </button>
            ) : (
              <button className="btn btn-outline-primary btn-sm fw-bold rounded-pill" onClick={onFindJobs}>
                <i className="bi bi-search me-1"></i> Explore Jobs
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area: Edit View vs Read View */}
      {editing ? (
        /* ======================== EDIT MODE ======================== */
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="row g-4">
            
            {/* Left Column: Basic Info & Primary Details */}
            <div className="col-lg-6">
              <div className="card border shadow-sm rounded-4 h-100 p-4 bg-white">
                <h5 className="fw-bold text-dark mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
                  <i className="bi bi-person-badge text-primary"></i>
                  {isRecruiter ? 'Company & Account Information' : 'Personal & Contact Details'}
                </h5>

                <div className="row g-3">
                  {/* Name */}
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                      {isRecruiter ? 'Authorized Recruiter Name *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ayush Pal"
                      required
                    />
                  </div>

                  {/* Email (Readonly) */}
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                      {isRecruiter ? 'Company Work Email' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-sm bg-light text-muted"
                      value={email}
                      disabled
                    />
                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>Linked with your credentials</small>
                  </div>

                  {/* Phone */}
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                      {isRecruiter ? 'Company Phone Number *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>

                  {/* Address / Location Only */}
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                      {isRecruiter ? 'Company Address / Location Only *' : 'Address / Location Only *'}
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={isRecruiter ? "e.g. Bangalore HQ, Karnataka, India" : "e.g. Bengaluru, India / Remote"}
                      required
                    />
                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>City, State, Country or Preferred Work Setup</small>
                  </div>

                  {/* Recruiter Specific: Company Name & Website Only */}
                  {isRecruiter && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                          Company Name *
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. TechCorp Innovations"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                          Company Website Only *
                        </label>
                        <input
                          type="url"
                          className="form-control form-control-sm"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          placeholder="https://company.com"
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Seeker Specific: Experience Level & Portfolio */}
                  {!isRecruiter && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                          Experience Level *
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                        >
                          <option value="Entry-Level (0-2 Yrs)">Entry-Level (0-2 Yrs)</option>
                          <option value="Mid-Level (3-5 Yrs)">Mid-Level (3-5 Yrs)</option>
                          <option value="Senior (6-9 Yrs)">Senior (6-9 Yrs)</option>
                          <option value="Lead / Architect (10+ Yrs)">Lead / Architect (10+ Yrs)</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                          Portfolio Link / GitHub *
                        </label>
                        <input
                          type="url"
                          className="form-control form-control-sm"
                          value={portfolioUrl}
                          onChange={(e) => setPortfolioUrl(e.target.value)}
                          placeholder="https://myportfolio.dev or https://github.com/username"
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                          Professional Bio & Elevator Pitch
                        </label>
                        <textarea
                          className="form-control form-control-sm"
                          rows="3"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Write a concise overview of your technical background and career goals..."
                        ></textarea>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Skills / Experience (Seeker) OR Description & Hiring Preferences (Recruiter) */}
            <div className="col-lg-6">
              {isRecruiter ? (
                /* RECRUITER RIGHT COLUMN: Company Description & Hiring Preferences */
                <div className="card border shadow-sm rounded-4 h-100 p-4 bg-white">
                  <h5 className="fw-bold text-dark mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
                    <i className="bi bi-briefcase-fill text-primary"></i>
                    Company Overview & Hiring Preferences
                  </h5>

                  {/* Company Description */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                      Company Description *
                    </label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="4"
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      placeholder="Describe your company's core mission, products, team culture, and industry domain..."
                      required
                    ></textarea>
                  </div>

                  {/* Hiring Preferences Section */}
                  <div className="p-3 bg-light rounded-3 border">
                    <h6 className="fw-bold text-dark mb-2 text-sm">
                      <i className="bi bi-sliders me-1 text-primary"></i> Hiring Preferences of Company
                    </h6>

                    {/* Target Roles Tag Builder */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted" style={{ fontSize: '0.75rem' }}>
                        Key Roles Hiring For
                      </label>
                      <div className="d-flex flex-wrap gap-1 mb-2">
                        {hiringPreferences.targetRoles.map((role) => (
                          <span key={role} className="badge bg-primary text-white d-flex align-items-center gap-1 py-1 px-2">
                            {role}
                            <button
                              type="button"
                              className="btn-close btn-close-white"
                              style={{ width: '0.45rem', height: '0.45rem' }}
                              onClick={() => handleRemoveTargetRole(role)}
                            ></button>
                          </span>
                        ))}
                      </div>
                      <div className="input-group input-group-sm">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Backend Java, DevOps SRE"
                          value={customRoleInput}
                          onChange={(e) => setCustomRoleInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTargetRole(e);
                            }
                          }}
                        />
                        <button className="btn btn-outline-primary fw-bold" type="button" onClick={handleAddTargetRole}>
                          + Add Role
                        </button>
                      </div>
                    </div>

                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted" style={{ fontSize: '0.72rem' }}>Work Mode</label>
                        <select
                          className="form-select form-select-sm"
                          value={hiringPreferences.workMode}
                          onChange={(e) => setHiringPreferences({ ...hiringPreferences, workMode: e.target.value })}
                        >
                          <option value="Remote First">Remote First</option>
                          <option value="Hybrid / Remote Friendly">Hybrid / Remote Friendly</option>
                          <option value="Onsite HQ Only">Onsite HQ Only</option>
                          <option value="Flexible Setup">Flexible Setup</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted" style={{ fontSize: '0.72rem' }}>Response SLA</label>
                        <select
                          className="form-select form-select-sm"
                          value={hiringPreferences.responseSla}
                          onChange={(e) => setHiringPreferences({ ...hiringPreferences, responseSla: e.target.value })}
                        >
                          <option value="Within 24 Hours">Within 24 Hours</option>
                          <option value="Within 24-48 Hours">Within 24-48 Hours</option>
                          <option value="Under 3-5 Days">Under 3-5 Days</option>
                        </select>
                      </div>

                      <div className="col-12 mt-2">
                        <label className="form-label small fw-bold text-muted" style={{ fontSize: '0.72rem' }}>Interview & Proof Evaluation Process</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={hiringPreferences.interviewProcess}
                          onChange={(e) => setHiringPreferences({ ...hiringPreferences, interviewProcess: e.target.value })}
                          placeholder="e.g. 1. Live demo review -> 2. Technical round -> 3. Offer Letter"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* SEEKER RIGHT COLUMN: Skills & Technical Stack Dropdown & Resume */
                <div className="card border shadow-sm rounded-4 h-100 p-4 bg-white">
                  <h5 className="fw-bold text-dark mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
                    <i className="bi bi-tools text-primary"></i>
                    Skills, Technical Stack & Resume
                  </h5>

                  {/* Skills & Technical Stack with Category Dropdown */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small fw-bold text-muted text-uppercase mb-0" style={{ fontSize: '0.72rem' }}>
                        Skills & Technical Stack *
                      </label>
                      <span className="badge bg-light text-dark border small">{selectedSkills.length} Selected</span>
                    </div>

                    {/* Active Selected Skill Badges */}
                    <div className="d-flex flex-wrap gap-1 p-2 bg-light rounded-3 border mb-2 min-h-40" style={{ minHeight: '48px' }}>
                      {selectedSkills.length === 0 ? (
                        <span className="text-muted small p-1">No skills added yet. Select from the dropdown below.</span>
                      ) : (
                        selectedSkills.map((skill) => (
                          <span key={skill} className="badge bg-primary text-white d-flex align-items-center gap-1 py-1 px-2">
                            {skill}
                            <button
                              type="button"
                              className="btn-close btn-close-white"
                              style={{ width: '0.45rem', height: '0.45rem' }}
                              onClick={() => handleRemoveSkill(skill)}
                            ></button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Tech Stack Dropdown Picker */}
                    <div className="row g-2 mb-2">
                      <div className="col-12">
                        <select
                          className="form-select form-select-sm"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddSkill(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>⚡ Choose from Standard Company Tech Stacks...</option>
                          {Object.entries(TECH_STACK_CATALOGUE).map(([groupName, groupSkills]) => (
                            <optgroup key={groupName} label={groupName}>
                              {groupSkills.map((sk) => (
                                <option key={sk} value={sk} disabled={selectedSkills.includes(sk)}>
                                  {sk} {selectedSkills.includes(sk) ? '(Added)' : ''}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Custom Skill Input */}
                    <div className="input-group input-group-sm">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type custom framework / tool & press Enter..."
                        value={customSkillInput}
                        onChange={(e) => setCustomSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomSkill(e);
                          }
                        }}
                      />
                      <button className="btn btn-outline-primary fw-bold" type="button" onClick={handleAddCustomSkill}>
                        + Add Custom
                      </button>
                    </div>
                  </div>

                  {/* Candidate Resume Section */}
                  <div className="p-3 bg-light rounded-3 border">
                    <h6 className="fw-bold text-dark mb-2 text-sm d-flex align-items-center justify-content-between">
                      <span><i className="bi bi-file-earmark-pdf-fill text-danger me-1"></i> Candidate Resume</span>
                      {resumeFileName && <span className="badge bg-success-subtle text-success border border-success-subtle">Active PDF</span>}
                    </h6>

                    {resumeFileName ? (
                      <div className="d-flex align-items-center justify-content-between bg-white p-2 px-3 rounded-2 border mb-2">
                        <div className="d-flex align-items-center gap-2 text-truncate">
                          <i className="bi bi-file-pdf text-danger fs-5"></i>
                          <div className="text-truncate">
                            <strong className="text-sm d-block text-truncate">{resumeFileName}</strong>
                            <span className="text-muted text-xs">
                              {resumeFileSize ? `${(resumeFileSize / (1024 * 1024)).toFixed(2)} MB` : 'PDF Document'} • Uploaded {resumeUploadDate || 'Recently'}
                            </span>
                          </div>
                        </div>
                        <div className="d-flex gap-1">
                          {resumeBase64 && (
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm px-2 py-0 text-xs"
                              onClick={() => setShowResumeModal(true)}
                            >
                              View
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm px-2 py-0 text-xs"
                            onClick={handleRemoveResume}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-2">
                        <label className="btn btn-outline-primary btn-sm w-100 py-2 border-dashed fw-bold">
                          <i className="bi bi-cloud-arrow-up-fill me-1"></i> Upload Resume PDF (Max 8MB)
                          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="d-none" />
                        </label>
                      </div>
                    )}

                    {/* Or Direct Resume Link */}
                    <div className="mt-2">
                      <label className="form-label small fw-bold text-muted" style={{ fontSize: '0.72rem' }}>
                        Or Direct Resume Link / Google Drive
                      </label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="https://drive.google.com/your-resume-link"
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Full-Width Section for Seekers: Experience & Background Sections */}
            {!isRecruiter && (
              <div className="col-12">
                <div className="card border shadow-sm rounded-4 p-4 bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2 flex-wrap gap-2">
                    <div>
                      <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        <i className="bi bi-journal-bookmark-fill text-primary"></i>
                        Experience & Background
                      </h5>
                      <small className="text-muted">Add your past work experiences, internships, or key engineering roles</small>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm fw-bold rounded-pill"
                      onClick={handleAddExperience}
                    >
                      <i className="bi bi-plus-circle-fill me-1"></i> + Add Another Experience
                    </button>
                  </div>

                  <div className="row g-3">
                    {experiences.map((exp, index) => (
                      <div key={exp.id || index} className="col-12">
                        <div className="p-3 bg-light rounded-3 border position-relative">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold">
                              Experience #{index + 1}
                            </span>
                            {experiences.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm py-0 px-2 text-xs"
                                onClick={() => handleRemoveExperience(exp.id)}
                              >
                                <i className="bi bi-trash me-1"></i> Remove
                              </button>
                            )}
                          </div>

                          <div className="row g-2">
                            <div className="col-md-4">
                              <label className="form-label small fw-bold text-muted" style={{ fontSize: '0.72rem' }}>Role Title *</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="e.g. Senior Java Backend Engineer"
                                value={exp.title}
                                onChange={(e) => handleUpdateExperience(exp.id, 'title', e.target.value)}
                                required
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold text-muted" style={{ fontSize: '0.72rem' }}>Company / Organization *</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="e.g. FinTech Labs Inc."
                                value={exp.company}
                                onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                                required
                              />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label small fw-bold text-muted" style={{ fontSize: '0.72rem' }}>Duration</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="e.g. 2022 - Present"
                                value={exp.duration}
                                onChange={(e) => handleUpdateExperience(exp.id, 'duration', e.target.value)}
                              />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label small fw-bold text-muted" style={{ fontSize: '0.72rem' }}>Type</label>
                              <select
                                className="form-select form-select-sm"
                                value={exp.employmentType || 'Full-time'}
                                onChange={(e) => handleUpdateExperience(exp.id, 'employmentType', e.target.value)}
                              >
                                <option value="Full-time">Full-time</option>
                                <option value="Internship">Internship</option>
                                <option value="Contract">Contract</option>
                                <option value="Freelance">Freelance</option>
                              </select>
                            </div>
                            <div className="col-12 mt-2">
                              <label className="form-label small fw-bold text-muted" style={{ fontSize: '0.72rem' }}>Key Projects & Responsibilities</label>
                              <textarea
                                className="form-control form-control-sm"
                                rows="2"
                                placeholder="Engineered microservices using Spring Boot, optimized PostgreSQL database queries, and delivered customer features."
                                value={exp.description}
                                onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Floating Save Action Bar */}
            <div className="col-12">
              <div className="p-3 bg-white rounded-4 border shadow-sm d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span className="small text-muted">
                  <i className="bi bi-info-circle text-primary me-1"></i> Changes will be saved to your JobFins account and verified profile.
                </span>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm px-4 fw-bold rounded-pill"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-5 fw-bold rounded-pill shadow"
                    disabled={loading}
                  >
                    {loading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-check2-circle me-1"></i>}
                    Save Profile
                  </button>
                </div>
              </div>
            </div>

          </div>
        </form>
      ) : (
        /* ======================== VIEW / OVERVIEW MODE ======================== */
        <div className="row g-4">
          
          {/* Left Column: Profile Card */}
          <div className="col-lg-4">
            <div className="card border shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: '90px' }}>
              <div className="text-center pb-3 border-bottom mb-3">
                <div
                  className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center mx-auto mb-3 shadow"
                  style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                >
                  {name?.charAt(0)?.toUpperCase() || (isRecruiter ? 'R' : 'S')}
                </div>
                <h4 className="fw-bold text-dark mb-1">{isRecruiter ? (companyName || name) : name}</h4>
                <p className="text-muted small mb-2">{isRecruiter ? 'Hiring Organization' : experienceLevel}</p>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 fw-bold">
                  <i className="bi bi-shield-check me-1"></i> Verified Account
                </span>
              </div>

              <div className="space-y-3">
                <div className="d-flex align-items-center gap-3 py-1">
                  <i className="bi bi-envelope text-primary fs-5"></i>
                  <div className="text-truncate">
                    <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Email</small>
                    <span className="small fw-semibold text-dark text-truncate">{email}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3 py-1">
                  <i className="bi bi-telephone text-primary fs-5"></i>
                  <div>
                    <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Phone</small>
                    <span className="small fw-semibold text-dark">{contactNumber || 'Not provided'}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3 py-1">
                  <i className="bi bi-geo-alt text-primary fs-5"></i>
                  <div>
                    <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Address / Location</small>
                    <span className="small fw-semibold text-dark">{location || 'India'}</span>
                  </div>
                </div>

                {isRecruiter && companyWebsite && (
                  <div className="d-flex align-items-center gap-3 py-1">
                    <i className="bi bi-globe text-primary fs-5"></i>
                    <div className="text-truncate">
                      <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Company Website</small>
                      <a href={companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`} target="_blank" rel="noreferrer" className="small fw-semibold text-primary text-truncate d-block">
                        {companyWebsite} <i className="bi bi-box-arrow-up-right text-xs"></i>
                      </a>
                    </div>
                  </div>
                )}

                {!isRecruiter && portfolioUrl && (
                  <div className="d-flex align-items-center gap-3 py-1">
                    <i className="bi bi-link-45deg text-primary fs-5"></i>
                    <div className="text-truncate">
                      <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Portfolio / GitHub</small>
                      <a href={portfolioUrl.startsWith('http') ? portfolioUrl : `https://${portfolioUrl}`} target="_blank" rel="noreferrer" className="small fw-semibold text-primary text-truncate d-block">
                        {portfolioUrl} <i className="bi bi-box-arrow-up-right text-xs"></i>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-top mt-3">
                <button className="btn btn-outline-primary btn-sm w-100 fw-bold rounded-pill" onClick={() => setEditing(true)}>
                  <i className="bi bi-pencil-square me-1"></i> Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Sections */}
          <div className="col-lg-8">
            {isRecruiter ? (
              /* RECRUITER VIEW */
              <div className="space-y-4">
                {/* Company Description */}
                <div className="card border shadow-sm rounded-4 p-4 bg-white mb-4">
                  <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
                    <i className="bi bi-building text-primary"></i>
                    Company Overview & Culture
                  </h5>
                  <p className="text-dark leading-relaxed mb-0" style={{ whiteSpace: 'pre-line' }}>
                    {companyDescription || 'No company overview added yet. Click Edit Profile to add company details.'}
                  </p>
                </div>

                {/* Hiring Preferences */}
                <div className="card border shadow-sm rounded-4 p-4 bg-white mb-4">
                  <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
                    <i className="bi bi-sliders text-primary"></i>
                    Hiring Preferences & Target Stacks
                  </h5>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="text-muted small fw-bold d-block mb-1">Target Roles Currently Hiring</label>
                      <div className="d-flex flex-wrap gap-1">
                        {hiringPreferences.targetRoles && hiringPreferences.targetRoles.length > 0 ? (
                          hiringPreferences.targetRoles.map((role) => (
                            <span key={role} className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fw-bold">
                              <i className="bi bi-check2 me-1"></i> {role}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted small">All engineering positions</span>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3 border">
                        <small className="text-muted d-block fw-bold">Work Arrangement</small>
                        <span className="fw-bold text-dark">{hiringPreferences.workMode || 'Remote / Hybrid'}</span>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3 border">
                        <small className="text-muted d-block fw-bold">Response SLA</small>
                        <span className="fw-bold text-dark">{hiringPreferences.responseSla || 'Within 24-48 Hours'}</span>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="p-3 bg-light rounded-3 border">
                        <small className="text-muted d-block fw-bold">Evaluation & Offer Process</small>
                        <span className="fw-semibold text-dark">{hiringPreferences.interviewProcess || 'Direct proof evaluation & fast offer turnaround'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SEEKER VIEW */
              <div className="space-y-4">
                {/* About & Bio */}
                <div className="card border shadow-sm rounded-4 p-4 bg-white mb-4">
                  <h5 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                    <i className="bi bi-person-lines-fill text-primary"></i>
                    Professional Summary
                  </h5>
                  <p className="text-dark leading-relaxed mb-0">
                    {bio || 'Software engineer with hands-on experience building modern, responsive web applications.'}
                  </p>
                </div>

                {/* Skills & Technical Stack */}
                <div className="card border shadow-sm rounded-4 p-4 bg-white mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <i className="bi bi-cpu text-primary"></i>
                      Skills & Technical Stack
                    </h5>
                    <span className="badge bg-primary text-white">{selectedSkills.length} Technologies</span>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <span key={skill} className="badge bg-light text-dark border px-3 py-2 fw-bold d-flex align-items-center gap-1 shadow-sm">
                        <i className="bi bi-check-circle-fill text-primary text-xs"></i>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience & Background Sections */}
                <div className="card border shadow-sm rounded-4 p-4 bg-white mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <i className="bi bi-briefcase text-primary"></i>
                      Experience & Career Background
                    </h5>
                    <span className="badge bg-secondary-subtle text-secondary">{experiences.length} Positions</span>
                  </div>

                  <div className="timeline space-y-3">
                    {experiences.map((exp, idx) => (
                      <div key={exp.id || idx} className="p-3 bg-light rounded-3 border mb-3">
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-1">
                          <div>
                            <h6 className="fw-bold text-dark mb-0">{exp.title || 'Software Developer'}</h6>
                            <span className="text-primary fw-semibold small">{exp.company || 'Organization'}</span>
                          </div>
                          <div className="text-end">
                            <span className="badge bg-white text-muted border small">{exp.duration || '2023 - Present'}</span>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle ms-1 small">{exp.employmentType || 'Full-time'}</span>
                          </div>
                        </div>
                        {exp.description && (
                          <p className="text-dark small mb-0 mt-2 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Candidate Resume & Proof */}
                <div className="card border shadow-sm rounded-4 p-4 bg-white mb-4">
                  <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
                    <i className="bi bi-file-earmark-check-fill text-danger"></i>
                    Resume & Portfolio Links
                  </h5>

                  <div className="row g-3">
                    {/* Resume Card */}
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3 border h-100 d-flex flex-column justify-content-between">
                        <div>
                          <span className="text-muted small fw-bold d-block mb-1">Candidate Resume</span>
                          {resumeFileName ? (
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-file-pdf text-danger fs-3"></i>
                              <div className="text-truncate">
                                <strong className="text-sm d-block text-truncate">{resumeFileName}</strong>
                                <span className="text-muted text-xs">{resumeUploadDate ? `Uploaded ${resumeUploadDate}` : 'Ready for review'}</span>
                              </div>
                            </div>
                          ) : resumeUrl ? (
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-link-45deg text-primary fs-3"></i>
                              <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-sm fw-bold text-primary text-truncate d-block">
                                View Cloud Resume <i className="bi bi-box-arrow-up-right text-xs"></i>
                              </a>
                            </div>
                          ) : (
                            <span className="text-muted small">No resume uploaded yet.</span>
                          )}
                        </div>

                        <div className="mt-3">
                          {resumeBase64 ? (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm w-100 fw-bold"
                              onClick={() => setShowResumeModal(true)}
                            >
                              <i className="bi bi-eye-fill me-1"></i> Preview Resume
                            </button>
                          ) : resumeUrl ? (
                            <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm w-100 fw-bold">
                              <i className="bi bi-box-arrow-up-right me-1"></i> Open Resume Link
                            </a>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm w-100 fw-bold"
                              onClick={() => setEditing(true)}
                            >
                              + Upload Resume
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Portfolio Card */}
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3 border h-100 d-flex flex-column justify-content-between">
                        <div>
                          <span className="text-muted small fw-bold d-block mb-1">Live Portfolio / GitHub</span>
                          {portfolioUrl ? (
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-globe text-success fs-3"></i>
                              <div className="text-truncate">
                                <strong className="text-sm d-block text-truncate">{portfolioUrl}</strong>
                                <span className="text-muted text-xs">Verified Project Showcase</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted small">No portfolio link added.</span>
                          )}
                        </div>

                        <div className="mt-3">
                          {portfolioUrl ? (
                            <a
                              href={portfolioUrl.startsWith('http') ? portfolioUrl : `https://${portfolioUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline-success btn-sm w-100 fw-bold"
                            >
                              <i className="bi bi-box-arrow-up-right me-1"></i> Visit Portfolio
                            </a>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm w-100 fw-bold"
                              onClick={() => setEditing(true)}
                            >
                              + Add Portfolio Link
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resume Preview Modal */}
      {showResumeModal && resumeBase64 && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(10,25,47,0.7)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-file-earmark-pdf-fill text-danger me-2"></i>
                  {resumeFileName || 'Candidate Resume'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowResumeModal(false)}></button>
              </div>
              <div className="modal-body p-0" style={{ height: '75vh' }}>
                <iframe
                  src={resumeBase64}
                  title="Resume Preview"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                ></iframe>
              </div>
              <div className="modal-footer bg-light">
                <a href={resumeBase64} download={resumeFileName || 'Resume.pdf'} className="btn btn-success btn-sm fw-bold">
                  <i className="bi bi-download me-1"></i> Download PDF
                </a>
                <button type="button" className="btn btn-secondary btn-sm fw-bold" onClick={() => setShowResumeModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
