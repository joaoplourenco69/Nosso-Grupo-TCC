# Fire-Guard - Guia de armazenamento de imagens no Supabase

## Visão geral

Para este projeto, a melhor arquitetura é:

- armazenar as imagens no Supabase Storage
- salvar os metadados da ocorrência no banco PostgreSQL
- guardar somente a URL pública ou o caminho no banco

Isso torna o sistema mais leve, rápido e escalável.

A tela de listagem já usa a coluna imagem_url para mostrar as imagens em src/screens/ListaAlertasScreen.jsx.

---

## Estrutura recomendada

### 1) Bucket no Supabase Storage

Criar um bucket chamado:

- fire-images

Configuração recomendada:

- público: sim
- tipos permitidos: image/jpeg, image/png, image/webp

### 2) Tabela principal

Na tabela ocorrencias, manter as informações do alerta:

- id
- local
- horario
- status
- imagem_url
- storage_path
- created_at

### 3) Relação de dados

- Storage guarda o arquivo físico da imagem
- ocorrencias guarda o caminho/URL da imagem + dados do evento

---

## Por que essa é a melhor prática

Evite salvar a imagem em base64 ou em texto grande dentro do banco.

O ideal é:

- banco = metadados da ocorrência
- storage = arquivo de imagem

Isso evita:

- banco grande
- leitura lenta
- custo desnecessário
- problema de escalabilidade

---

## Passo a passo no Supabase

### Passo 1: criar bucket

No painel do Supabase:

1. abrir Storage
2. clicar em Create a new bucket
3. nome: fire-images
4. deixar público

### Passo 2: habilitar tipos de imagem

Permitir:

- image/jpeg
- image/png
- image/webp

### Passo 3: verificar a tabela ocorrencias

Se ela já existir, adicione as colunas:

```sql
ALTER TABLE ocorrencias
  ADD COLUMN IF NOT EXISTS imagem_url text,
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
```

Se quiser garantir que created_at exista:

```sql
ALTER TABLE ocorrencias
  ALTER COLUMN created_at SET DEFAULT now();
```

---

## Fluxo do upload

Fluxo recomendado:

1. capturar imagem da câmera / GoPro
2. enviar para o bucket fire-images
3. obter a URL pública
4. salvar imagem_url e storage_path na tabela ocorrencias
5. mostrar no app usando imagem_url

---

## Exemplo de upload no Expo / React Native

Arquivo sugerido: src/services/uploadImagemOcorrencia.js

```js
import { supabase } from './supabase';

export const uploadImagemOcorrencia = async (imagem) => {
  if (!imagem || !imagem.uri) {
    throw new Error('Imagem inválida');
  }

  const fileName = `${Date.now()}-${(imagem.fileName || 'foto.jpg').replace(/\s+/g, '-')}`;
  const path = `ocorrencias/${fileName}`;

  try {
    const response = await fetch(imagem.uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('fire-images')
      .upload(path, blob, {
        contentType: imagem.type || 'image/jpeg',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data: publicData } = supabase.storage
      .from('fire-images')
      .getPublicUrl(path);

    return {
      storage_path: path,
      imagem_url: publicData.publicUrl,
    };
  } catch (error) {
    console.error('Erro no upload da imagem:', error);
    throw error;
  }
};
```

---

## Exemplo de salvamento da ocorrência

```js
import { supabase } from '../services/supabase';
import { uploadImagemOcorrencia } from '../services/uploadImagemOcorrencia';

const salvarOcorrenciaComImagem = async (imagem, local) => {
  try {
    const uploaded = await uploadImagemOcorrencia(imagem);

    const { error } = await supabase.from('ocorrencias').insert([
      {
        local,
        horario: new Date().toISOString(),
        status: 'detectado',
        imagem_url: uploaded.imagem_url,
        storage_path: uploaded.storage_path,
      },
    ]);

    if (error) throw error;

    console.log('Ocorrência salva com imagem!');
  } catch (error) {
    console.error(error);
  }
};
```

---

## Observações importantes

### 1) URL pública

Se o bucket for público, a URL pública será algo como:

https://SEU_PROJETO.supabase.co/storage/v1/object/public/fire-images/ocorrencias/arquivo.jpg

Essa URL pode ser salva na coluna imagem_url.

### 2) Segurança

Se a aplicação for restrita, configure regras de acesso do bucket com RLS.

Para uso mais simples e rápido, o bucket público é aceitável para imagens de monitoramento.

### 3) Não usar base64

Não salve a imagem como texto grande no banco.

---

## Conclusão

A arquitetura mais adequada para o Fire-Guard é:

- Bucket Supabase Storage: fire-images
- Tabela ocorrencias: com imagem_url e storage_path
- App: faz upload da imagem e salva a URL no banco

Essa solução é simples, prática e compatível com o que o projeto já está fazendo.

---

## Arquivos relevantes do projeto

- src/services/supabase.js
- src/screens/ListaAlertasScreen.jsx

Esses dois arquivos mostram que o projeto já está preparado para receber imagem_url.
