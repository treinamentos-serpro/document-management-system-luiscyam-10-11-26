async function request(path, options) {
  const response = await fetch(`/api${path}`, options);

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Não foi possível concluir a operação.');
  }

  return response;
}

export async function listDocuments() {
  const response = await request('/documents');
  return response.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request('/upload', {
    method: 'POST',
    body: formData,
  });
  return response.json();
}