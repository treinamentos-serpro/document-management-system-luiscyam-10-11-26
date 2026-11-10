import { useState } from 'react';

export default function UploadComponent({ onUpload, isUploading }) {
  const [file, setFile] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (file && await onUpload(file)) {
      setFile(null);
      event.currentTarget.reset();
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label className="file-picker">
        <span className="file-picker__symbol" aria-hidden="true">+</span>
        <span className="file-picker__text">
          <strong>{file ? file.name : 'Escolher arquivo'}</strong>
          <small>{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Selecione um arquivo no dispositivo'}</small>
        </span>
        <input
          type="file"
          name="file"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          aria-label="Selecionar documento"
        />
      </label>
      <button className="button button--primary" type="submit" disabled={!file || isUploading}>
        {isUploading ? 'Enviando...' : 'Enviar documento'}
      </button>
    </form>
  );
}