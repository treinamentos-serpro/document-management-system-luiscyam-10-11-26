const { randomUUID } = require('node:crypto');
const { unlink } = require('node:fs/promises');

function createDocumentService(documentRepository) {
  async function createDocument(file) {
    const document = {
      id: randomUUID(),
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner: 'local',
    };

    try {
      documentRepository.addDocument(document, file.path);
      return document;
    } catch (error) {
      await unlink(file.path).catch(() => {});
      throw error;
    }
  }

  function listDocuments() {
    return documentRepository.listDocuments();
  }

  function findDocumentForDownload(id) {
    const storedDocument = documentRepository.findDocumentById(id);
    if (!storedDocument) {
      return null;
    }

    const { filePath, ...document } = storedDocument;
    return { document, filePath };
  }

  return { createDocument, listDocuments, findDocumentForDownload };
}

module.exports = createDocumentService;