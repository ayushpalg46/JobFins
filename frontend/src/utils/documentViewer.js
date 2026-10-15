/**
 * Document Detection & Safe Handling Utility for JobFins
 * Accurately detects PDF vs DOCX vs DOC vs External URLs and provides
 * safe Blob-based preview and download without browser data-URI truncation.
 */

export function detectResumeType(link, preferredName = '') {
  if (!link || typeof link !== 'string') {
    return {
      type: 'NONE',
      extension: '',
      mime: '',
      label: 'No Document',
      isPdf: false,
      isDocx: false,
      isDoc: false,
      isDataUrl: false,
      isExternalUrl: false,
    };
  }

  const trimmed = link.trim();

  if (trimmed.startsWith('ON_DEMAND_REF:')) {
    const isDocx = trimmed.endsWith(':docx');
    return {
      type: isDocx ? 'DOCX' : 'PDF',
      extension: isDocx ? '.docx' : '.pdf',
      mime: isDocx ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf',
      label: isDocx ? 'Word Document (.docx)' : 'PDF Document',
      badgeClass: isDocx ? 'bg-primary-subtle text-primary border-primary-subtle' : 'bg-danger-subtle text-danger border-danger-subtle',
      icon: isDocx ? 'bi-file-earmark-word-fill text-primary' : 'bi-file-earmark-pdf-fill text-danger',
      isPdf: !isDocx,
      isDocx: isDocx,
      isDoc: false,
      isDataUrl: true,
      isOnDemand: true,
      isExternalUrl: false,
    };
  }

  if (trimmed.startsWith('data:')) {
    const commaIndex = trimmed.indexOf(',');
    const header = commaIndex !== -1 ? trimmed.substring(0, commaIndex) : '';
    const dataPrefix = commaIndex !== -1 ? trimmed.substring(commaIndex + 1, commaIndex + 60) : '';

    // 1. Magic bytes detection (100% ground truth regardless of header)
    // UEsDB = PK\x03\x04 (ZIP archive header, universal signature of DOCX / OpenXML)
    if (dataPrefix.startsWith('UEsDB')) {
      return {
        type: 'DOCX',
        extension: '.docx',
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        label: 'Word Document (.docx)',
        badgeClass: 'bg-primary-subtle text-primary border-primary-subtle',
        icon: 'bi-file-earmark-word-fill text-primary',
        isPdf: false,
        isDocx: true,
        isDoc: false,
        isDataUrl: true,
        isExternalUrl: false,
      };
    }

    // JVBER = %PDF- (Universal signature of PDF files)
    if (dataPrefix.startsWith('JVBER')) {
      return {
        type: 'PDF',
        extension: '.pdf',
        mime: 'application/pdf',
        label: 'PDF Document',
        badgeClass: 'bg-danger-subtle text-danger border-danger-subtle',
        icon: 'bi-file-earmark-pdf-fill text-danger',
        isPdf: true,
        isDocx: false,
        isDoc: false,
        isDataUrl: true,
        isExternalUrl: false,
      };
    }

    // 0M8R4 = OLE compound document (legacy MS Word .doc)
    if (dataPrefix.startsWith('0M8R4')) {
      return {
        type: 'DOC',
        extension: '.doc',
        mime: 'application/msword',
        label: 'Word Document (.doc)',
        badgeClass: 'bg-primary-subtle text-primary border-primary-subtle',
        icon: 'bi-file-earmark-word-fill text-primary',
        isPdf: false,
        isDocx: false,
        isDoc: true,
        isDataUrl: true,
        isExternalUrl: false,
      };
    }

    // 2. MIME type header fallback
    if (header.includes('application/pdf')) {
      return {
        type: 'PDF',
        extension: '.pdf',
        mime: 'application/pdf',
        label: 'PDF Document',
        badgeClass: 'bg-danger-subtle text-danger border-danger-subtle',
        icon: 'bi-file-earmark-pdf-fill text-danger',
        isPdf: true,
        isDocx: false,
        isDoc: false,
        isDataUrl: true,
        isExternalUrl: false,
      };
    }

    if (header.includes('wordprocessingml') || header.includes('docx') || preferredName.toLowerCase().endsWith('.docx')) {
      return {
        type: 'DOCX',
        extension: '.docx',
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        label: 'Word Document (.docx)',
        badgeClass: 'bg-primary-subtle text-primary border-primary-subtle',
        icon: 'bi-file-earmark-word-fill text-primary',
        isPdf: false,
        isDocx: true,
        isDoc: false,
        isDataUrl: true,
        isExternalUrl: false,
      };
    }

    if (header.includes('msword') || header.includes('doc') || preferredName.toLowerCase().endsWith('.doc')) {
      return {
        type: 'DOC',
        extension: '.doc',
        mime: 'application/msword',
        label: 'Word Document (.doc)',
        badgeClass: 'bg-primary-subtle text-primary border-primary-subtle',
        icon: 'bi-file-earmark-word-fill text-primary',
        isPdf: false,
        isDocx: false,
        isDoc: true,
        isDataUrl: true,
        isExternalUrl: false,
      };
    }

    // Default data URL fallback
    return {
      type: 'PDF',
      extension: '.pdf',
      mime: 'application/pdf',
      label: 'PDF Document',
      badgeClass: 'bg-danger-subtle text-danger border-danger-subtle',
      icon: 'bi-file-earmark-pdf-fill text-danger',
      isPdf: true,
      isDocx: false,
      isDoc: false,
      isDataUrl: true,
      isExternalUrl: false,
    };
  }

  // External Links (HTTP / HTTPS / GitHub / Drive)
  const lower = trimmed.toLowerCase();
  if (lower.includes('github.com')) {
    return {
      type: 'GITHUB',
      extension: '',
      mime: '',
      label: 'GitHub Repository',
      badgeClass: 'bg-dark text-white',
      icon: 'bi-github text-dark',
      isPdf: false,
      isDocx: false,
      isDoc: false,
      isDataUrl: false,
      isExternalUrl: true,
    };
  }

  if (lower.endsWith('.docx')) {
    return {
      type: 'DOCX',
      extension: '.docx',
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      label: 'Word Document (.docx)',
      badgeClass: 'bg-primary-subtle text-primary border-primary-subtle',
      icon: 'bi-file-earmark-word-fill text-primary',
      isPdf: false,
      isDocx: true,
      isDoc: false,
      isDataUrl: false,
      isExternalUrl: true,
    };
  }

  if (lower.endsWith('.doc')) {
    return {
      type: 'DOC',
      extension: '.doc',
      mime: 'application/msword',
      label: 'Word Document (.doc)',
      badgeClass: 'bg-primary-subtle text-primary border-primary-subtle',
      icon: 'bi-file-earmark-word-fill text-primary',
      isPdf: false,
      isDocx: false,
      isDoc: true,
      isDataUrl: false,
      isExternalUrl: true,
    };
  }

  if (lower.endsWith('.pdf')) {
    return {
      type: 'PDF',
      extension: '.pdf',
      mime: 'application/pdf',
      label: 'PDF Document',
      badgeClass: 'bg-danger-subtle text-danger border-danger-subtle',
      icon: 'bi-file-earmark-pdf-fill text-danger',
      isPdf: true,
      isDocx: false,
      isDoc: false,
      isDataUrl: false,
      isExternalUrl: true,
    };
  }

  return {
    type: 'URL',
    extension: '',
    mime: '',
    label: 'External Document',
    badgeClass: 'bg-secondary-subtle text-secondary',
    icon: 'bi-link-45deg',
    isPdf: false,
    isDocx: false,
    isDoc: false,
    isDataUrl: false,
    isExternalUrl: true,
  };
}

/**
 * Safely converts base64/data URI into a Blob and returns a Blob URL.
 */
export function createResumeBlobUrl(dataUrl, mimeType) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return null;

  try {
    const commaIndex = dataUrl.indexOf(',');
    const base64Str = commaIndex !== -1 ? dataUrl.substring(commaIndex + 1) : dataUrl;
    const byteCharacters = atob(base64Str);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType || 'application/octet-stream' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Failed to create Blob URL from resume data:', err);
    return null;
  }
}

/**
 * Cleanly triggers download of resume with matching file extension
 * (e.g. .docx for Word documents, .pdf for PDF files).
 */
export function downloadResumeDocument(resumeLink, candidateName = 'Candidate') {
  if (!resumeLink) return;

  const docInfo = detectResumeType(resumeLink);
  const cleanName = candidateName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${cleanName}_Resume${docInfo.extension || '.pdf'}`;

  if (resumeLink.startsWith('data:')) {
    const blobUrl = createResumeBlobUrl(resumeLink, docInfo.mime);
    if (blobUrl) {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      return;
    }
  }

  // Fallback for regular links
  const a = document.createElement('a');
  a.href = resumeLink;
  a.target = '_blank';
  a.rel = 'noreferrer';
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
