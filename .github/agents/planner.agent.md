---
description: Agente de planejamento que pesquisa o codebase e gera um plano de implementação sem alterar código.
name: planner
tools: ['search', 'codebase', 'usages']
handoffs:
  - label: Iniciar implementação
    agent: agent
    prompt: Implemente o plano descrito acima, seguindo as camadas do backend e as convenções do projeto.
    send: false
---

# Agente Planner

Você é um arquiteto de software sênior. Seu papel é planejar, não implementar.

## Diretrizes

- Use apenas ferramentas de leitura e análise. Não edite arquivos.
- Antes de propor o plano, colete contexto do codebase e da especificação em `docs/specs`.
- Respeite a Clean Architecture simples: `routes -> controllers -> services -> repositories`.
- Respeite a restrição de armazenamento local (multer com diskStorage).

## Saída esperada

1. Lista de etapas em ordem de execução.
2. Arquivos a serem criados ou alterados por etapa.
3. Decisões arquiteturais e riscos.
4. Critérios de aceite por etapa.

# Especificação - Document Management System

> Modelo de especificação (spec) para orientar o desenvolvimento guiado por
> especificação (Spec Driven Development). Preencha cada seção com o apoio do
> Plan Mode do GitHub Copilot durante o Passo 1.

## 1. Objetivo

Descreva em uma frase o que o sistema deve entregar.

## 2. Escopo

### Dentro do escopo

- Upload de documentos
- Listagem de documentos
- Download de documentos
- Gestão simples por usuário

### Fora do escopo

- Armazenamento externo ou em nuvem
- Versionamento de documentos

## 3. Requisitos funcionais

| ID    | Requisito                                            |
| ----- | ---------------------------------------------------- |
| RF-01 | O usuário pode enviar um documento                   |
| RF-02 | O usuário pode listar os documentos enviados         |
| RF-03 | O usuário pode baixar um documento pelo identificador|

## 4. Requisitos não funcionais

| ID     | Requisito                                                   |
| ------ | ----------------------------------------------------------- |
| RNF-01 | Arquivos gravados no filesystem local via multer            |
| RNF-02 | Metadados mantidos em memória nesta fase                    |
| RNF-03 | Configuração via variáveis de ambiente (12-Factor)          |

## 5. Modelo de dados (metadados do documento)

| Campo        | Tipo   | Descrição                          |
| ------------ | ------ | ---------------------------------- |
| id           | string | Identificador único do documento   |
| originalName | string | Nome original do arquivo enviado   |
| size         | number | Tamanho em bytes                   |
| uploadedAt   | string | Data/hora do upload (ISO 8601)     |
| owner        | string | Identificador do usuário dono      |

## 6. Contratos de API

### POST /upload

- Entrada: arquivo (multipart/form-data)
- Saída: metadados do documento criado

### GET /documents

- Saída: lista de metadados de documentos

### GET /documents/:id/download

- Saída: conteúdo binário do arquivo

## 7. Decisões arquiteturais

- Backend em Clean Architecture simples (routes, controllers, services, repositories)
- Frontend baseado em componentes (React)
- Armazenamento local apenas

## 8. Plano de execução

Liste as etapas na ordem de implementação (gerado no Passo 1).

1. ...
2. ...
3. ...
