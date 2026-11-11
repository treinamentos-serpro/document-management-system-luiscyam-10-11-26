# Especificação - Document Management System

## 1. Objetivo

Entregar uma aplicação web que permita a usuários enviar, consultar e baixar documentos, mantendo os arquivos no filesystem local e os metadados em memória nesta fase.

## 2. Escopo

### Dentro do escopo

- Envio de um documento por requisição.
- Listagem dos metadados dos documentos do contexto local de usuário único.
- Download de um documento pelo identificador.
- Interface React para envio, listagem e download, integrada à API por `fetch`.
- Armazenamento de arquivos em `backend/storage` por meio do Multer com `diskStorage`.
- Metadados mantidos em memória; reiniciar o backend pode remover o catálogo, mesmo que os arquivos ainda estejam no disco.
- Tratamento de entradas inválidas, documentos inexistentes e falhas de filesystem nos limites apropriados.

### Fora do escopo

- Armazenamento externo ou em nuvem.
- Versionamento, edição, compartilhamento ou exclusão de documentos.
- Persistência durável de metadados ou banco de dados nesta fase.
- Autenticação, autorização multiusuário e isolamento entre usuários.
- Filtro por lista de tipos MIME; nesta fase, qualquer tipo de arquivo é aceito dentro do limite de tamanho.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve aceitar um arquivo no campo `file` de uma requisição `multipart/form-data` e retornar os metadados do documento criado. |
| RF-02 | O sistema deve atribuir ao documento um identificador único, preservar o nome original, registrar tamanho e data/hora de upload e atribuir `owner: "local"`. |
| RF-03 | O sistema deve gravar o conteúdo do arquivo localmente em `backend/storage`, usando Multer `diskStorage`; nomes de arquivo fornecidos pelo cliente não devem definir diretamente caminhos de armazenamento. |
| RF-04 | O sistema deve listar os metadados de todos os documentos do contexto local de usuário único. |
| RF-05 | O sistema deve permitir baixar o conteúdo binário de um documento identificado por `id`, sem aceitar do cliente um caminho de filesystem. |
| RF-06 | O sistema deve responder de forma controlada quando não houver arquivo no upload, quando o `id` não existir ou quando ocorrer falha de leitura/escrita, sem expor detalhes internos do filesystem. |
| RF-07 | Se o registro de metadados não puder ser concluído após gravar o arquivo, o fluxo deve evitar deixar arquivo órfão sempre que possível, removendo o arquivo temporário/final criado. |
| RF-08 | A interface deve oferecer os fluxos de upload, visualização da lista e acionamento do download, apresentando feedback de sucesso e erro em português. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem permanecer no filesystem local da aplicação em `backend/storage`, com Multer `diskStorage`; não usar serviços ou provedores de armazenamento externos. |
| RNF-02 | Os metadados devem permanecer em memória nesta fase. Não se promete retenção do catálogo após reinício do processo. |
| RNF-03 | Configurações operacionais devem seguir 12-Factor; `PORT` configura a porta, `HOST` configura a interface de escuta (padrão: `127.0.0.1`) e `MAX_UPLOAD_BYTES` configura o tamanho máximo do arquivo (padrão: 10 MiB, inteiro positivo). |
| RNF-04 | O backend deve usar Node.js, Express e CommonJS; o frontend deve usar React, Vite e ESM; o código permanecerá em JavaScript. |
| RNF-05 | O backend deve seguir o fluxo de dependências `routes -> controllers -> services -> repositories`, sem camadas internas conhecerem Express ou dependerem de camadas externas. |
| RNF-06 | O frontend deve chamar a API com `fetch` sob o prefixo `/api`; o proxy de desenvolvimento do Vite remove esse prefixo antes de encaminhar as rotas ao backend. |
| RNF-07 | O backend deve tratar erros de entrada e operações de filesystem nos limites do sistema e evitar exposição de caminhos locais ou stack traces ao cliente. |
| RNF-08 | Testes de backend devem usar o runner nativo `node:test` e cobrir os fluxos e erros relevantes sem depender de armazenamento externo. |

## 5. Modelo de dados (metadados do documento)

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único usado nas operações de listagem e download. O formato/estratégia de geração ainda precisa ser escolhido. |
| `originalName` | string | Nome original informado para o arquivo enviado; não deve ser usado como caminho de destino no filesystem. |
| `size` | number | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Data e hora do upload em formato ISO 8601. |
| `owner` | string | Identificador do contexto de usuário único local, definido como `local`; não representa autenticação ou isolamento multiusuário. |

O repositório de arquivos deve manter a associação interna entre `id`/metadados e o arquivo salvo, sem expor caminho local na API. O local de armazenamento permanece `backend/storage`. O registro público de metadados não inclui o conteúdo binário.

**Limites do modelo nesta fase:**

- O sistema opera em contexto de usuário único local, sem autenticação. Todos os documentos registrados são visíveis nesse contexto; não há garantia de isolamento entre clientes que alcancem o servidor.
- O `owner` é atribuído pelo servidor como `local`; o cliente não pode escolher esse valor.
- O identificador é um UUID gerado pelo servidor. A API o expõe como string.
- Metadados em memória podem se perder após reinício, embora os arquivos permaneçam no disco. Reconciliação desses arquivos não está incluída.

## 6. Contratos de API

As rotas do backend são `/upload`, `/documents` e `/documents/:id/download`. No desenvolvimento, o frontend as acessa por `/api/upload`, `/api/documents` e `/api/documents/:id/download`, conforme o proxy do Vite. Os contratos abaixo descrevem o comportamento-alvo; o seed atual ainda não implementa essas rotas.

### `POST /upload`

- Entrada: `multipart/form-data` com um arquivo no campo `file`.
- Sucesso: `201 Created`, corpo JSON com `id`, `originalName`, `size`, `uploadedAt` e `owner` igual a `local`.
- Erros: `400 Bad Request` com `{ "error": "Selecione um arquivo para enviar." }` quando não houver arquivo; `413 Payload Too Large` com mensagem de limite excedido para arquivos acima de `MAX_UPLOAD_BYTES`; `500 Internal Server Error` com mensagem genérica para falhas inesperadas.
- Limite padrão: 10 MiB, configurável por `MAX_UPLOAD_BYTES`. Não há filtro por tipo MIME nesta fase.

### `GET /documents`

- Entrada: sem corpo.
- Sucesso: `200 OK`, corpo JSON com uma coleção de metadados no mesmo formato do upload; sem conteúdo binário e sem caminhos locais. A coleção inclui todos os documentos do processo local.

### `GET /documents/:id/download`

- Entrada: identificador do documento no parâmetro `id`; nenhum caminho de arquivo é aceito do cliente.
- Sucesso: `200 OK` com o conteúdo binário do arquivo e cabeçalhos apropriados para download, incluindo o nome original quando seguro para uso no cabeçalho.
- Erros: `404 Not Found` quando não houver documento correspondente; 4xx para falha de validação do identificador, se aplicável; 5xx para falha de leitura. As respostas não devem revelar caminhos locais.
- Não há autorização multiusuário nesta fase. O endpoint opera no contexto único local.

### Convenções transversais

- JSON para respostas de metadados; resposta binária para download.
- Respostas de erro usam JSON com a propriedade `error`. Não há erro de tipo não aceito nem de acesso não autorizado nesta fase.
- O endpoint existente `GET /health` retorna `{ "status": "ok" }` e deve continuar disponível como verificação de saúde.

## 7. Decisões arquiteturais

- Backend em Node.js/Express e CommonJS, organizado em `backend/src`:
  - `routes/`: registra endpoints e middleware de transporte, delegando aos controllers.
  - `controllers/`: interpreta entrada HTTP, faz validação básica e traduz resultados/erros para respostas HTTP.
  - `services/`: implementa regras de upload, listagem, ownership e download sem depender de Express.
  - `repositories/`: associa metadados em memória aos arquivos locais e concentra operações de leitura/escrita necessárias.
- O fluxo de dependência deve permanecer `routes -> controllers -> services -> repositories`. O middleware do Multer pode ser conectado na rota, com `diskStorage` configurado para gravar somente em `backend/storage`; a regra de negócio e a persistência de metadados permanecem nas camadas apropriadas.
- A persistência de metadados é em memória. Os arquivos ficam no disco local; não adicionar banco de dados, armazenamento remoto ou dependência externa de upload.
- O frontend usa React com componentes funcionais e Hooks, separando interface em `components/`, páginas em `pages/` e chamadas HTTP em `services/`. Requisições usam `fetch` e o prefixo `/api` do proxy Vite.
- Manter nomes de símbolos em inglês, mensagens e comentários voltados ao usuário em português, e privilegiar funções pequenas e dependências já presentes.
- O primeiro incremento opera como aplicação local de usuário único sem autenticação; não deve ser exposto como serviço multiusuário. O frontend chama a API por `/api` e apresenta upload, lista e download.
- O backend escuta em `127.0.0.1` por padrão. Alterar `HOST` para uma interface de rede expõe uma API sem autenticação e exige controles adicionais antes de uso remoto.

## 8. Plano de execução

Etapas futuras de implementação, sem execução neste documento:

1. Implementar as quatro camadas backend e os endpoints de upload, listagem e download mantendo arquivos locais e metadados em memória.
2. Cobrir os fluxos de API, limite de tamanho, arquivo ausente e documento inexistente com testes `node:test`.
3. Implementar a interface React para upload, lista e download, incluindo estados de erro, sucesso, carregamento e lista vazia.
4. Validar o build do frontend e a integração de ponta a ponta usando o proxy Vite e o backend local.
5. Antes de suportar múltiplos usuários ou expor o servidor à rede, definir autenticação, autorização e isolamento de documentos.