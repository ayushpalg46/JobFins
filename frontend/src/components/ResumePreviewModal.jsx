import React, { useEffect, useState } from 'react';
import { detectResumeType, createResumeBlobUrl, downloadResumeDocument } from '../utils/documentViewer';

export default function ResumePreviewModal({ show, onClose, resumeLink, candidateName = 'Candidate', jobTitle = '' }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const docInfo = detectResumeType(resumeLink);

  useEffect(() => {
    if (show && resumeLink && docInfo.isPdf && docInfo.isDataUrl) {
      const url = createResumeBlobUrl(resumeLink, 'application/pdf');
      setBlobUrl(url);
      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    } else {
      setBlobUrl(null);
    }
  }, [show, resumeLink, docInfo.isPdf, docInfo.isDataUrl]);

  if (!show || !resumeLink) return null;

  const handleDownload = () => {
    downloadResumeDocument(resumeLink, candidateName);
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(10,25,47,0.75)', zIndex: 1060 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content rounded-4 shadow-lg overflow-hidden border-0">
          {/* Header */}
          <div className="modal-header bg-dark text-white py-3 px-4 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="modal-title fw-bold mb-0 d-flex align-items-center gap-2">
                <i className={`bi ${docInfo.icon} fs-4`}></i>
                <span>{candidateName}'s Resume</span>
                <span className={`badge ${docInfo.badgeClass} ms-2 fs-6 py-1 px-2 border`}>
                  {docInfo.label}
                </span>
              </h5>
              {jobTitle && (
                <small className="text-secondary" style={{ fontSize: '0.8rem' }}>
                  Applied for: <span className="text-info fw-semibold">{jobTitle}</span>
                </small>
              )}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-0 bg-light" style={{ minHeight: '68vh', maxHeight: '78vh' }}>
            {docInfo.isPdf && (
              <div className="w-100 h-100" style={{ height: '72vh' }}>
                {blobUrl ? (
                  <iframe
                    src={`${blobUrl}#toolbar=1&navpanes=0`}
                    title="PDF Resume Preview"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  ></iframe>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-muted">Loading PDF preview...</p>
                  </div>
                )}
              </div>
            )}

            {(docInfo.isDocx || docInfo.isDoc) && (
              <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center" style={{ minHeight: '60vh' }}>
                <div className="bg-primary-subtle p-4 rounded-circle mb-3 shadow-sm" style={{ width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-file-earmark-word-fill text-primary" style={{ fontSize: '3rem' }}></i>
                </div>
                <h4 className="fw-bold text-dark mb-1">Microsoft Word Document (.docx)</h4>
                <p className="text-muted mb-3" style={{ maxWidth: '520px', fontSize: '0.9rem' }}>
                  <strong>{candidateName}</strong> uploaded a native Microsoft Word resume file. 
                  Web browsers do not render Word files inside PDF viewers, which causes the <em>"Failed to load PDF document"</em> error when saved with a PDF extension.
                </p>
                <div className="p-3 bg-white rounded-3 border shadow-sm mb-4" style={{ maxWidth: '480px', width: '100%' }}>
                  <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                    <span className="small text-muted">File Format:</span>
                    <span className="badge bg-primary-subtle text-primary border">Microsoft Word (.docx)</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="small text-muted">Applicant:</span>
                    <span className="fw-bold small text-dark">{candidateName}</span>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="btn btn-primary px-4 py-2 fw-bold shadow-sm"
                  >
                    <i className="bi bi-download me-2"></i> Download as Word Document (.docx)
                  </button>
                </div>
              </div>
            )}

            {!docInfo.isPdf && !docInfo.isDocx && !docInfo.isDoc && (
              <div className="p-5 text-center">
                <i className="bi bi-box-arrow-up-right text-muted" style={{ fontSize: '3rem' }}></i>
                <h5 className="fw-bold mt-3">External Resume Document</h5>
                <p className="text-muted small mb-4">This resume is hosted on an external link or service.</p>
                <a
                  href={resumeLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary px-4 py-2 fw-bold"
                >
                  <i className="bi bi-box-arrow-up-right me-2"></i> Open Resume in New Tab
                </a>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-white d-flex justify-content-between py-2 px-4 border-top">
            <span className="small text-muted">
              {docInfo.isPdf ? 'Rendered via native zero-loss PDF viewer.' : 'Proper document extension automatically applied.'}
            </span>
            <div className="d-flex gap-2">
              {docInfo.isPdf && blobUrl && (
                <a
                  href={blobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-secondary btn-sm fw-semibold"
                >
                  <i className="bi bi-box-arrow-up-right me-1"></i> Open in Full Tab
                </a>
              )}
              <button
                type="button"
                onClick={handleDownload}
                className="btn btn-cobalt btn-sm fw-bold px-3"
              >
                <i className="bi bi-download me-1"></i> Download {docInfo.isDocx ? '.docx' : '.pdf'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm px-3"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
