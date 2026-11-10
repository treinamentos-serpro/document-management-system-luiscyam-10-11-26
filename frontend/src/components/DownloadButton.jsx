export default function DownloadButton({ onClick, isDownloading }) {
  return (
    <button className="button button--quiet" type="button" onClick={onClick} disabled={isDownloading}>
      {isDownloading ? 'Baixando...' : 'Baixar'}
    </button>
  );
}