function createDocumentRepository() {
  const documentsById = new Map();

  function addDocument(document, filePath) {
    documentsById.set(document.id, { ...document, filePath });
  }

  function listDocuments() {
    return Array.from(documentsById.values(), ({ filePath, ...document }) => document);
  }

  function findDocumentById(id) {
    return documentsById.get(id) || null;
  }

  return { addDocument, listDocuments, findDocumentById };
}

module.exports = createDocumentRepository;