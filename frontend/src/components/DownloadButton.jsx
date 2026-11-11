export default function DownloadButton({ documentId }) {
  return (
    <a
      className="button button--quiet"
      href={`/api/documents/${encodeURIComponent(documentId)}/download`}
    >
      Baixar
    </a>
  );
}