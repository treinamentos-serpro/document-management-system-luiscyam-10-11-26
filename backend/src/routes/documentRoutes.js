const crypto = require('node:crypto');
const fs = require('node:fs');
const express = require('express');
const multer = require('multer');

function createDocumentRoutes({ documentController, storageDirectory, maxFileBytes }) {
  fs.mkdirSync(storageDirectory, { recursive: true });

  const storage = multer.diskStorage({
    destination: storageDirectory,
    filename: (req, file, callback) => callback(null, crypto.randomUUID()),
  });
  const upload = multer({
    storage,
    limits: { fileSize: maxFileBytes, files: 1, fields: 0, parts: 2 },
  });
  const router = express.Router();

  router.post('/upload', upload.single('file'), documentController.upload);
  router.get('/documents', documentController.list);
  router.get('/documents/:id/download', documentController.download);

  return router;
}

module.exports = createDocumentRoutes;