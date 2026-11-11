function createDocumentController(documentService) {
  function upload(req, res, next) {
    if (!req.file) {
      return res.status(400).json({ error: 'Selecione um arquivo para enviar.' });
    }

    return documentService.createDocument(req.file)
      .then((document) => res.status(201).json(document))
      .catch(next);
  }

  function list(req, res) {
    return res.json(documentService.listDocuments());
  }

  function download(req, res, next) {
    const result = documentService.findDocumentForDownload(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Documento não encontrado.' });
    }

    return res.download(result.filePath, result.document.originalName, (error) => {
      if (error) {
        next(error);
      }
    });
  }

  return { upload, list, download };
}

module.exports = createDocumentController;