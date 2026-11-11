const { test } = require('node:test');
const assert = require('node:assert');
const { once } = require('node:events');
const { mkdtemp, rm } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const appModule = require('../src/app');
const app = appModule;

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('a API permite enviar, listar e baixar documentos', async (t) => {
  const storageDirectory = await mkdtemp(path.join(os.tmpdir(), 'dms-test-'));
  const testApp = appModule.createApp({ storageDirectory, maxFileBytes: 1024 });
  const server = testApp.listen(0);
  await once(server, 'listening');

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await rm(storageDirectory, { recursive: true, force: true });
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const emptyUpload = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: new FormData(),
  });
  assert.strictEqual(emptyUpload.status, 400);

  const oversizedForm = new FormData();
  oversizedForm.append('file', new Blob(['x'.repeat(1025)]), 'large.txt');
  const oversizedUpload = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: oversizedForm,
  });
  assert.strictEqual(oversizedUpload.status, 413);

  const uploadForm = new FormData();
  uploadForm.append('file', new Blob(['conteudo de teste']), 'documento.txt');
  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: uploadForm,
  });
  assert.strictEqual(uploadResponse.status, 201);

  const document = await uploadResponse.json();
  assert.strictEqual(document.originalName, 'documento.txt');
  assert.strictEqual(document.size, Buffer.byteLength('conteudo de teste'));
  assert.strictEqual(document.owner, 'local');
  assert.ok(document.id);
  assert.ok(document.uploadedAt);

  const listResponse = await fetch(`${baseUrl}/documents`);
  assert.strictEqual(listResponse.status, 200);
  assert.deepStrictEqual(await listResponse.json(), [document]);

  const downloadResponse = await fetch(`${baseUrl}/documents/${document.id}/download`);
  assert.strictEqual(downloadResponse.status, 200);
  assert.strictEqual(await downloadResponse.text(), 'conteudo de teste');

  const missingDocument = await fetch(`${baseUrl}/documents/missing/download`);
  assert.strictEqual(missingDocument.status, 404);
});
