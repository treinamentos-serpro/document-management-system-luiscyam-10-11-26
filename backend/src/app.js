// O backend mantém as rotas de documentos separadas em camadas e armazena
// uploads localmente com multer diskStorage.

const express = require('express');
const path = require('node:path');
const multer = require('multer');
const createDocumentRepository = require('./repositories/documentRepository');
const createDocumentService = require('./services/documentService');
const createDocumentController = require('./controllers/documentController');
const createDocumentRoutes = require('./routes/documentRoutes');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const DEFAULT_MAX_FILE_BYTES = 10 * 1024 * 1024;

function createApp({
  storageDirectory = path.resolve(__dirname, '../storage'),
  maxFileBytes = process.env.MAX_UPLOAD_BYTES === undefined
    ? DEFAULT_MAX_FILE_BYTES
    : Number(process.env.MAX_UPLOAD_BYTES),
} = {}) {
  if (!Number.isSafeInteger(maxFileBytes) || maxFileBytes <= 0) {
    throw new Error('MAX_UPLOAD_BYTES deve ser um inteiro positivo.');
  }

  const app = express();
  const documentRepository = createDocumentRepository();
  const documentService = createDocumentService(documentRepository);
  const documentController = createDocumentController(documentService);

  app.use(express.json());
  app.use(createDocumentRoutes({ documentController, storageDirectory, maxFileBytes }));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }

    if (error instanceof multer.MulterError) {
      const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      const message = status === 413
        ? 'O arquivo excede o limite permitido.'
        : 'Não foi possível processar o arquivo enviado.';
      return res.status(status).json({ error: message });
    }

    return res.status(500).json({ error: 'Ocorreu um erro interno.' });
  });

  return app;
}

const app = createApp();

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`DMS backend ouvindo em ${HOST}:${PORT}`);
  });
}

module.exports = app;
module.exports.createApp = createApp;
