import DownloadButton from './DownloadButton.jsx';

function formatFileSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }

  const units = ['KB', 'MB', 'GB'];
  let value = size / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)} ${units[unitIndex]}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function DocumentList({ documents, isLoading }) {
  if (isLoading) {
    return <p className="list-message" role="status">Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return <p className="list-message">Nenhum documento encontrado.</p>;
  }

  return (
    <div className="table-scroll">
      <table className="document-table">
        <thead>
          <tr>
            <th scope="col">Nome</th>
            <th scope="col">Tamanho</th>
            <th scope="col">Enviado em</th>
            <th scope="col"><span className="visually-hidden">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id}>
              <th scope="row" className="document-name">{document.originalName}</th>
              <td data-label="Tamanho">{formatFileSize(document.size)}</td>
              <td data-label="Enviado em">{formatDate(document.uploadedAt)}</td>
              <td className="document-actions">
                <DownloadButton
                  documentId={document.id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}