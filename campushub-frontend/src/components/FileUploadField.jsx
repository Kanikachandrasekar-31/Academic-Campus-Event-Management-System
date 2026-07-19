import { useState } from 'react';
import { uploadFile } from '../utils/api';

/**
 * A file input that uploads immediately on selection (via Cloudinary/
 * /api/upload) and reports the resulting URL back to the parent form.
 * Shows a small preview when the uploaded file is an image.
 */
const FileUploadField = ({ label, value, onChange, accept, isImage = false }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {label && <label className="form-label">{label}</label>}
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <input
          type="file"
          className="form-control"
          accept={accept}
          onChange={handleFile}
          disabled={uploading}
          style={{ maxWidth: 260 }}
        />
        {uploading && <span className="spinner-border spinner-border-sm" />}
        {value && !uploading && (
          isImage ? (
            <img src={value} alt="preview" style={{ height: 40, width: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
          ) : (
            <a href={value} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>View uploaded file</a>
          )
        )}
      </div>
      {error && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{error}</div>}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
        Or paste a URL directly below instead of uploading.
      </div>
    </div>
  );
};

export default FileUploadField;
