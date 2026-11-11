import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { downloadDocument, listDocuments, uploadDocument } from './services/documentsApi.js';
import './styles.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    listDocuments()
      .then(setDocuments)
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleUpload(file) {
    setIsUploading(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      await uploadDocument(file);
      setDocuments(await listDocuments());
      setStatusMessage(`${file.name} foi enviado.`);
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDownload(document) {
    setDownloadingId(document.id);
    setErrorMessage('');

    try {
      await downloadDocument(document);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="DMS, início">
          <span className="wordmark__mark">D</span>
          <span>DMS</span>
        </a>
        <span className="topbar__environment">ARQUIVO LOCAL</span>
      </header>

      <main className="workspace">
        <section className="page-heading" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">BIBLIOTECA</p>
            <h1 id="page-title">Documentos</h1>
          </div>
          <p className="document-count">
            <span>{documents.length.toString().padStart(2, '0')}</span>
            {documents.length === 1 ? 'ARQUIVO' : 'ARQUIVOS'}
          </p>
        </section>

        <section className="upload-section" aria-labelledby="upload-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">NOVO DOCUMENTO</p>
              <h2 id="upload-title">Adicionar arquivo</h2>
            </div>
          </div>
          <UploadComponent onUpload={handleUpload} isUploading={isUploading} />
        </section>

        {errorMessage && (
          <p className="feedback feedback--error" role="alert">{errorMessage}</p>
        )}
        {statusMessage && (
          <p className="feedback feedback--success" role="status">{statusMessage}</p>
        )}

        <section className="documents-section" aria-labelledby="documents-title">
          <div className="section-heading section-heading--list">
            <div>
              <p className="eyebrow">ACERVO</p>
              <h2 id="documents-title">Todos os documentos</h2>
            </div>
            <span className="section-heading__count">{documents.length}</span>
          </div>
          <DocumentList
            documents={documents}
            isLoading={isLoading}
            downloadingId={downloadingId}
            onDownload={handleDownload}
          />
        </section>
      </main>

      <footer className="footer">DMS <span>·</span> Armazenamento no dispositivo</footer>
    </div>
  );
}
