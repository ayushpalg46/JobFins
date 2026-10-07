import React, { useState } from 'react';

const mockCandidates = [
  {
    id: 1,
    name: 'Ayzen Vance',
    role: 'Senior Java Backend & Distributed Systems Lead',
    exp: '7.5 Yrs (Ex-QuantFunds, Stripe)',
    match: 98,
    transit: 'Western Line: Andheri / BKC',
    location: 'Mumbai (Western Line / BKC Hybrid)',
    expectedCtc: '₹32 - ₹38 LPA',
    notice: 'Immediate (<15 Days)',
    github: 'https://github.com/ayzen-vance',
    demo: 'https://quant-microservices.demo.app',
    skills: ['Spring Boot', 'Java', 'Kafka', 'Redis', 'Docker', 'PostgreSQL'],
    bio: 'Specializes in high-throughput transactional backends, Spring Boot microservice decomposition, and low-latency financial systems.',
  },
  {
    id: 2,
    name: 'Maya Chen',
    role: 'Staff Distributed Systems Architect',
    exp: '6.5 Yrs (Ex-Stripe, Amazon)',
    match: 96,
    transit: 'Western Line: Bandra / Churchgate',
    location: 'Mumbai (Western Line Hybrid)',
    expectedCtc: '₹45 - ₹55 LPA',
    notice: '30 Days Notice',
    github: 'https://github.com/mayachen-dev',
    demo: 'https://dist-ledger.vercel.app',
    skills: ['FastAPI', 'Python', 'Go', 'Docker', 'Kubernetes', 'PostgreSQL'],
    bio: 'Lead architect for scalable microservice platforms handling 100k+ TPS with 99.999% availability SLAs.',
  },
  {
    id: 3,
    name: 'Elena Rostova',
    role: 'Senior Cloud & DevOps SRE Engineer',
    exp: '5.0 Yrs (Nutanix, FinOS)',
    match: 94,
    transit: '100% Remote',
    location: 'Remote Pan-India',
    expectedCtc: '₹28 - ₹35 LPA',
    notice: 'Immediate (<15 Days)',
    github: 'https://github.com/elena-sre',
    demo: 'https://cloud-infra-monitor.io',
    skills: ['Docker', 'Kubernetes', 'Terraform', 'Rust', 'Linux'],
    bio: 'DevOps & SRE specialist with extensive experience in automated multi-cloud provisioning and zero-downtime rollouts.',
  },
  {
    id: 4,
    name: 'Marcus Thorne',
    role: 'Lead Full Stack Engineer (React/Java)',
    exp: '8.0 Yrs (Shopify, Twilio)',
    match: 92,
    transit: 'Bangalore: Outer Ring Road / HSR',
    location: 'Bangalore (ORR Hybrid)',
    expectedCtc: '₹35 - ₹42 LPA',
    notice: '30 Days Notice',
    github: 'https://github.com/mthorne-dev',
    demo: 'https://enterprise-saas-suite.dev',
    skills: ['React', 'Spring Boot', 'Next.js', 'PostgreSQL', 'Docker'],
    bio: 'Full stack practitioner creating modern enterprise dashboards and high-performance Spring Boot REST APIs.',
  },
  {
    id: 5,
    name: 'Rahul Sharma',
    role: 'Backend Software Engineer II',
    exp: '3.5 Yrs (TechCorp India, Razorpay)',
    match: 90,
    transit: 'Central Line: Thane / Powai',
    location: 'Mumbai (Central Line Hybrid)',
    expectedCtc: '₹18 - ₹24 LPA',
    notice: 'Immediate (<15 Days)',
    github: 'https://github.com/rahul-sharma-eng',
    demo: 'https://finpay-gateway.demo.io',
    skills: ['Spring Boot', 'Java', 'MySQL', 'Docker', 'FastAPI'],
    bio: 'Experienced backend developer proficient in Java microservices, database tuning, and API security.',
  },
  {
    id: 6,
    name: 'Sneha Kapoor',
    role: 'Mobile & Frontend Engineer',
    exp: '4.0 Yrs (Flipkart, PhonePe)',
    match: 89,
    transit: 'Bangalore: Whitefield',
    location: 'Bangalore (Whitefield Hybrid)',
    expectedCtc: '₹22 - ₹28 LPA',
    notice: '15 Days Notice',
    github: 'https://github.com/sneha-flutter',
    demo: 'https://fin-tracker-app.web.app',
    skills: ['Flutter', 'React', 'Next.js', 'Node.js', 'PostgreSQL'],
    bio: 'Mobile & frontend specialist building buttery smooth cross-platform applications in Flutter and React.',
  },
];

export default function TalentSourcing({ onExtendOffer }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedTransit, setSelectedTransit] = useState('all');
  const [selectedExp, setSelectedExp] = useState('all');
  const [invitedList, setInvitedList] = useState([]);
  const [message, setMessage] = useState(null);

  const frameworksList = ['Spring Boot', 'FastAPI', 'React', 'Flutter', 'Rust', 'Docker', 'PostgreSQL'];

  const handleInvite = (candidate) => {
    setInvitedList((prev) => [...prev, candidate.id]);
    setMessage({ type: 'success', text: `Invitation to apply sent successfully to ${candidate.name}!` });
    setTimeout(() => setMessage(null), 3500);
  };

  const filteredCandidates = mockCandidates.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.skills.some((s) => s.toLowerCase().includes(q)) ||
      c.transit.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q);

    const matchFw =
      selectedFramework === 'all' ||
      c.skills.some((s) => s.toLowerCase() === selectedFramework.toLowerCase());

    const matchTransit =
      selectedTransit === 'all' ||
      c.transit.toLowerCase().includes(selectedTransit.toLowerCase()) ||
      c.location.toLowerCase().includes(selectedTransit.toLowerCase());

    const matchExp =
      selectedExp === 'all' ||
      (selectedExp === 'senior' && parseFloat(c.exp) >= 5) ||
      (selectedExp === 'mid' && parseFloat(c.exp) >= 3 && parseFloat(c.exp) < 5) ||
      (selectedExp === 'junior' && parseFloat(c.exp) < 3);

    return matchQuery && matchFw && matchTransit && matchExp;
  });

  return (
    <div className="container py-4">
      {/* Subheader / Breadcrumb */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-4 bg-white rounded-3 border shadow-sm">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white">Recruiter Talent Sourcing</span>
            <span className="response-sla-badge">
              <i className="bi bi-shield-check text-success"></i> 100% Code Verified Profiles
            </span>
          </div>
          <h2 className="h4 mb-0 fw-bold text-dark">Proof-Over-Paper Candidate Discovery</h2>
          <small className="text-muted">Source engineers by exact tech stack and daily transit corridor</small>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 d-flex align-items-center fw-bold">
            <i className="bi bi-patch-check-fill me-1"></i> 1,248 Verified Engineers
          </span>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type} py-2 small alert-dismissible fade show`} role="alert">
          {message.text}
        </div>
      )}

      <div className="row g-4">
        {/* Left Filter Sidebar */}
        <div className="col-lg-3">
          <div className="bg-white p-3 rounded-3 border shadow-sm sticky-top" style={{ top: '90px' }}>
            <h6 className="fw-bold text-dark mb-3">
              <i className="bi bi-funnel me-1 text-primary"></i> Sourcing Filters
            </h6>

            {/* Keyword */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Search by Framework / Keyword</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. Spring Boot, FastAPI, React..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Framework Select */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Required Framework</label>
              <select
                className="form-select form-select-sm"
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
              >
                <option value="all">All Frameworks</option>
                {frameworksList.map((fw) => (
                  <option key={fw} value={fw}>{fw}</option>
                ))}
              </select>
            </div>

            {/* Hyper-Local Transit Corridor */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Transit & Commute Line</label>
              <select
                className="form-select form-select-sm"
                value={selectedTransit}
                onChange={(e) => setSelectedTransit(e.target.value)}
              >
                <option value="all">All Transit Corridors</option>
                <option value="Western">Western Line (Virar ↔ Churchgate)</option>
                <option value="Central">Central Line (Kalyan ↔ CSMT)</option>
                <option value="Bangalore">Bangalore (ORR / Whitefield)</option>
                <option value="Remote">100% Remote</option>
              </select>
            </div>

            {/* Experience */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Experience Level</label>
              <select
                className="form-select form-select-sm"
                value={selectedExp}
                onChange={(e) => setSelectedExp(e.target.value)}
              >
                <option value="all">All Experience Levels</option>
                <option value="senior">Senior / Lead (5+ Yrs)</option>
                <option value="mid">Mid-Level (3-5 Yrs)</option>
                <option value="junior">Entry / Junior (0-2 Yrs)</option>
              </select>
            </div>

            <button
              className="btn btn-outline-secondary btn-sm w-100 mt-2"
              onClick={() => {
                setSearchQuery('');
                setSelectedFramework('all');
                setSelectedTransit('all');
                setSelectedExp('all');
              }}
            >
              <i className="bi bi-arrow-clockwise me-1"></i> Reset Filters
            </button>
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="small text-muted">
              Showing <strong>{filteredCandidates.length}</strong> engineers matching tech stack & transit criteria
            </span>
          </div>

          <div className="row g-3">
            {filteredCandidates.map((candidate) => (
              <div className="col-12" key={candidate.id}>
                <div className="card border shadow-sm h-100 p-3 hover-lift">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h5 className="mb-0 fw-bold text-dark">{candidate.name}</h5>
                        <span className="badge bg-success-subtle text-success border border-success-subtle small">
                          <i className="bi bi-shield-check me-1"></i> Code Verified
                        </span>
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle small">
                          {candidate.match}% Stack Match
                        </span>
                      </div>
                      <p className="text-primary fw-semibold mb-1 small">{candidate.role}</p>
                      <p className="text-muted small mb-2">{candidate.exp}</p>
                    </div>

                    <div className="text-end">
                      <span className="d-block text-success fw-bold">{candidate.expectedCtc}</span>
                      <small className="badge bg-light text-dark border">{candidate.notice}</small>
                    </div>
                  </div>

                  {/* Proof-of-Work Links */}
                  <div className="d-flex flex-wrap gap-2 mb-2 p-2 bg-light rounded border">
                    <a
                      href={candidate.github}
                      target="_blank"
                      rel="noreferrer"
                      className="tech-tag-cyber text-decoration-none py-1 px-2"
                      title="Inspect Candidate GitHub Code"
                    >
                      <i className="bi bi-github"></i> GitHub Codebase
                    </a>
                    <a
                      href={candidate.demo}
                      target="_blank"
                      rel="noreferrer"
                      className="badge bg-primary text-white text-decoration-none py-1 px-2"
                      style={{ fontSize: '0.72rem' }}
                      title="Test Live Deployed System"
                    >
                      <i className="bi bi-box-arrow-up-right me-1"></i> Live Production Demo
                    </a>
                    <span className="transit-badge">
                      <i className="bi bi-train-front-fill"></i> {candidate.transit}
                    </span>
                  </div>

                  <p className="small text-muted mb-2">{candidate.bio}</p>

                  {/* Skills tags */}
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {candidate.skills.map((skill, idx) => (
                      <span key={idx} className="tech-tag-cyber">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Footer CTAs */}
                  <div className="d-flex flex-wrap justify-content-between align-items-center pt-2 border-top">
                    <small className="text-muted">
                      <i className="bi bi-geo-alt me-1"></i> {candidate.location}
                    </small>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm px-3"
                        onClick={() => handleInvite(candidate)}
                        disabled={invitedList.includes(candidate.id)}
                      >
                        <i className={`bi ${invitedList.includes(candidate.id) ? 'bi-check-circle-fill text-success' : 'bi-send'} me-1`}></i>
                        {invitedList.includes(candidate.id) ? 'Invited' : 'Invite to Apply'}
                      </button>

                      <button
                        className="btn btn-cobalt btn-sm px-3 shadow-sm fw-bold"
                        onClick={() => onExtendOffer && onExtendOffer(candidate)}
                      >
                        <i className="bi bi-file-earmark-text me-1"></i> Extend Offer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

