// Seed do servidor backend do Document Management System.
//
// Este arquivo é apenas um ponto de partida mínimo. Ao longo do workshop você
// vai usar o Agent Mode do GitHub Copilot para construir as camadas:
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const path = require('node:path');
const multer = require('multer');
const createDocumentRepository = require('./repositories/documentRepository');
const createDocumentService = require('./services/documentService');
const createDocumentController = require('./controllers/documentController');
const createDocumentRoutes = require('./routes/documentRoutes');

const PORT = process.env.PORT || 3000;
const DEFAULT_MAX_FILE_BYTES = 10 * 1024 * 1024;

function createApp({
  storageDirectory = path.resolve(__dirname, '../storage'),
  maxFileBytes = Number(process.env.MAX_UPLOAD_BYTES) || DEFAULT_MAX_FILE_BYTES,
} = {}) {
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
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
module.exports.createApp = createApp;
