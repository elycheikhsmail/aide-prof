# Plan : Migration de la Génération PDF Côté Serveur avec Stockage MinIO

## Objectif

Migrer la génération de PDF du frontend (html2pdf.js) vers le backend, et stocker les fichiers générés dans un bucket S3 MinIO.

---

## Architecture Actuelle

**Frontend:**
- `frontend/utils/pdfGeneratorHtml2Pdf.ts` : Utilise `html2pdf.js` pour générer des PDF côté client
- `frontend/utils/pdfGenerator.ts` : Alternative avec `jsPDF` (génération côté client)
- Les PDF sont générés à la volée et téléchargés directement par le navigateur

**Backend:**
- Aucun service de génération PDF
- Schéma `evaluations` sans champ pour l'URL du PDF

---

## Architecture Cible

```
┌─────────────┐    POST /api/v1/evaluations/:id/generate-pdf    ┌─────────────┐
│   Frontend  │ ──────────────────────────────────────────────► │   Backend   │
└─────────────┘                                                  │  (Hono.js)  │
                                                                 └──────┬──────┘
       │                                                                │
       │  GET PDF URL                                                   │ Génère PDF
       │                                                                ▼
       │                                                         ┌─────────────┐
       │                                                         │  Puppeteer  │
       │                                                         │  ou PDFKit  │
       │                                                         └──────┬──────┘
       │                                                                │
       │                                                                │ Upload
       │                                                                ▼
       │                                                         ┌─────────────┐
       └──────────── Téléchargement via URL signée ◄──────────── │   MinIO     │
                                                                 │   (S3)      │
                                                                 └─────────────┘
```

---

## Étapes d'Implémentation

### Phase 1 : Configuration Infrastructure

#### 1.1 Ajouter MinIO au docker-compose.yml

```yaml
services:
  postgres:
    # ... configuration existante ...

  postgres-test:
    # ... configuration existante ...

  minio:
    image: minio/minio:latest
    container_name: aide-prof-minio
    environment:
      MINIO_ROOT_USER: aideprof_minio
      MINIO_ROOT_PASSWORD: aideprof_minio_secret
    ports:
      - "9000:9000"    # API S3
      - "9001:9001"    # Console web
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  minio_data:
```

#### 1.2 Variables d'environnement (server/.env.development)

Ajouter au fichier `.env.development`:
```env
# MinIO / S3 Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=aideprof_minio
MINIO_SECRET_KEY=aideprof_minio_secret
MINIO_BUCKET_NAME=aide-prof-pdfs
MINIO_USE_SSL=false
```

#### 1.3 Mettre à jour server/src/config/env.ts

```typescript
export const env = {
  // ... existing config ...

  // MinIO Configuration
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || 'localhost',
  MINIO_PORT: parseInt(process.env.MINIO_PORT || '9000', 10),
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY!,
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY!,
  MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME || 'aide-prof-pdfs',
  MINIO_USE_SSL: process.env.MINIO_USE_SSL === 'true',
} as const;
```

---

### Phase 2 : Services Backend

#### 2.1 Installer les dépendances

```bash
cd server
bun add minio puppeteer @types/puppeteer
```

**Alternatives de génération PDF:**
- **Puppeteer** (recommandé) : Permet de rendre le HTML comme le navigateur, supporte les CSS, polices, RTL
- **PDFKit** : Plus léger mais moins de support CSS
- **jsPDF** : Déjà utilisé côté frontend, peut fonctionner côté serveur

#### 2.2 Créer le service de stockage S3 (MinIO)

**Fichier:** `server/src/services/storage.service.ts`

```typescript
import { Client } from 'minio';
import { env } from '../config/env.js';

class StorageService {
  private client: Client;
  private bucket: string;

  constructor() {
    this.client = new Client({
      endPoint: env.MINIO_ENDPOINT,
      port: env.MINIO_PORT,
      useSSL: env.MINIO_USE_SSL,
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY,
    });
    this.bucket = env.MINIO_BUCKET_NAME;
  }

  async init(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
      // Configurer la politique de lecture publique si nécessaire
    }
  }

  async uploadPdf(fileName: string, buffer: Buffer): Promise<string> {
    await this.client.putObject(this.bucket, fileName, buffer, {
      'Content-Type': 'application/pdf',
    });
    return this.getFileUrl(fileName);
  }

  async getFileUrl(fileName: string): Promise<string> {
    // URL signée valide 7 jours
    return await this.client.presignedGetObject(this.bucket, fileName, 7 * 24 * 60 * 60);
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.client.removeObject(this.bucket, fileName);
  }
}

export const storageService = new StorageService();
```

#### 2.3 Créer le service de génération PDF

**Fichier:** `server/src/services/pdf.service.ts`

```typescript
import puppeteer from 'puppeteer';
import type { Evaluation, Question } from '../db/schema/index.js';

class PdfService {
  private containsArabic(text: string): boolean {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    return arabicRegex.test(text);
  }

  private createEvaluationHTML(
    evaluation: Evaluation & { questions: Question[] },
    includeQuestions: boolean,
    includeAnswerSpace: boolean
  ): string {
    // Réutiliser la logique de frontend/utils/pdfGeneratorHtml2Pdf.ts
    // Adaptée pour le serveur
    const hasArabic = evaluation.questions.some(q => this.containsArabic(q.statement));
    // ... reste de la logique de génération HTML
  }

  async generateCombinedSheet(
    evaluation: Evaluation & { questions: Question[] }
  ): Promise<Buffer> {
    const html = this.createEvaluationHTML(evaluation, true, true);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      printBackground: true,
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  }

  async generateQuestionsSheet(
    evaluation: Evaluation & { questions: Question[] }
  ): Promise<Buffer> {
    // Similaire, avec includeQuestions=true, includeAnswerSpace=false
  }

  async generateAnswersSheet(
    evaluation: Evaluation & { questions: Question[] }
  ): Promise<Buffer> {
    // Similaire, avec includeQuestions=false, includeAnswerSpace=true
  }
}

export const pdfService = new PdfService();
```

---

### Phase 3 : Mise à jour de la Base de Données

#### 3.1 Ajouter la table evaluation_pdfs

**Fichier:** `server/src/db/schema/evaluationPdfs.ts`

```typescript
import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { evaluations } from './evaluations';

export const pdfTypeEnum = pgEnum('pdf_type', ['combined', 'questions', 'answers']);

export const evaluationPdfs = pgTable('evaluation_pdfs', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluationId: uuid('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
  type: pdfTypeEnum('type').notNull(),
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileUrl: varchar('file_url', { length: 1000 }), // URL signée, peut expirer
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type EvaluationPdf = typeof evaluationPdfs.$inferSelect;
export type NewEvaluationPdf = typeof evaluationPdfs.$inferInsert;
```

#### 3.2 Créer le repository

**Fichier:** `server/src/repositories/evaluationPdf.repository.ts`

```typescript
import { eq, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import { evaluationPdfs, type NewEvaluationPdf } from '../db/schema/evaluationPdfs.js';

class EvaluationPdfRepository {
  async create(data: NewEvaluationPdf) {
    const [pdf] = await db.insert(evaluationPdfs).values(data).returning();
    return pdf;
  }

  async findByEvaluationId(evaluationId: string) {
    return await db.select().from(evaluationPdfs).where(eq(evaluationPdfs.evaluationId, evaluationId));
  }

  async findByEvaluationAndType(evaluationId: string, type: 'combined' | 'questions' | 'answers') {
    const [pdf] = await db.select().from(evaluationPdfs)
      .where(and(
        eq(evaluationPdfs.evaluationId, evaluationId),
        eq(evaluationPdfs.type, type)
      ));
    return pdf;
  }

  async updateUrl(id: string, fileUrl: string) {
    const [pdf] = await db.update(evaluationPdfs)
      .set({ fileUrl, updatedAt: new Date() })
      .where(eq(evaluationPdfs.id, id))
      .returning();
    return pdf;
  }

  async delete(id: string) {
    await db.delete(evaluationPdfs).where(eq(evaluationPdfs.id, id));
  }
}

export const evaluationPdfRepository = new EvaluationPdfRepository();
```

---

### Phase 4 : Endpoints API

#### 4.1 Nouvelles routes PDF

**Fichier:** `server/src/routes/pdf.routes.ts`

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, professorMiddleware } from '../middlewares/auth.middleware.js';
import { pdfService } from '../services/pdf.service.js';
import { storageService } from '../services/storage.service.js';
import { evaluationService } from '../services/evaluation.service.js';
import { evaluationPdfRepository } from '../repositories/evaluationPdf.repository.js';

const pdfRoutes = new Hono();

pdfRoutes.use('*', authMiddleware, professorMiddleware);

const generatePdfSchema = z.object({
  type: z.enum(['combined', 'questions', 'answers']).default('combined'),
});

// POST /api/v1/evaluations/:id/pdf/generate
pdfRoutes.post('/:id/pdf/generate', zValidator('json', generatePdfSchema), async (c) => {
  const evaluationId = c.req.param('id');
  const { type } = c.req.valid('json');

  // Récupérer l'évaluation avec ses questions
  const evaluation = await evaluationService.findByIdWithQuestions(evaluationId);
  if (!evaluation) {
    return c.json({ error: 'Évaluation non trouvée' }, 404);
  }

  // Générer le PDF
  let pdfBuffer: Buffer;
  switch (type) {
    case 'combined':
      pdfBuffer = await pdfService.generateCombinedSheet(evaluation);
      break;
    case 'questions':
      pdfBuffer = await pdfService.generateQuestionsSheet(evaluation);
      break;
    case 'answers':
      pdfBuffer = await pdfService.generateAnswersSheet(evaluation);
      break;
  }

  // Nom du fichier
  const safeName = evaluation.title.replace(/[^a-z0-9]/gi, '_');
  const fileName = `evaluations/${evaluationId}/${safeName}_${type}_${Date.now()}.pdf`;

  // Upload vers MinIO
  const fileUrl = await storageService.uploadPdf(fileName, pdfBuffer);

  // Sauvegarder en base
  const existingPdf = await evaluationPdfRepository.findByEvaluationAndType(evaluationId, type);
  if (existingPdf) {
    // Supprimer l'ancien fichier et mettre à jour
    await storageService.deleteFile(existingPdf.fileName);
    await evaluationPdfRepository.updateUrl(existingPdf.id, fileUrl);
  } else {
    await evaluationPdfRepository.create({
      evaluationId,
      type,
      fileName,
      fileUrl,
    });
  }

  return c.json({
    message: 'PDF généré avec succès',
    url: fileUrl,
    type,
  });
});

// GET /api/v1/evaluations/:id/pdf
pdfRoutes.get('/:id/pdf', async (c) => {
  const evaluationId = c.req.param('id');
  const type = (c.req.query('type') as 'combined' | 'questions' | 'answers') || 'combined';

  const pdf = await evaluationPdfRepository.findByEvaluationAndType(evaluationId, type);
  if (!pdf) {
    return c.json({ error: 'PDF non trouvé. Veuillez le générer d\'abord.' }, 404);
  }

  // Régénérer une URL signée fraîche
  const freshUrl = await storageService.getFileUrl(pdf.fileName);

  return c.json({
    url: freshUrl,
    type: pdf.type,
    createdAt: pdf.createdAt,
  });
});

// GET /api/v1/evaluations/:id/pdfs (tous les PDFs d'une évaluation)
pdfRoutes.get('/:id/pdfs', async (c) => {
  const evaluationId = c.req.param('id');
  const pdfs = await evaluationPdfRepository.findByEvaluationId(evaluationId);

  // Régénérer les URLs signées
  const pdfsWithFreshUrls = await Promise.all(
    pdfs.map(async (pdf) => ({
      ...pdf,
      url: await storageService.getFileUrl(pdf.fileName),
    }))
  );

  return c.json({ pdfs: pdfsWithFreshUrls });
});

export default pdfRoutes;
```

#### 4.2 Enregistrer les routes

**Modifier:** `server/src/routes/index.ts`

```typescript
import pdfRoutes from './pdf.routes.js';

// ... dans la configuration des routes
app.route('/api/v1/evaluations', pdfRoutes);
```

---

### Phase 5 : Modifications Frontend

#### 5.1 Nouveau service API pour les PDFs

**Fichier:** `frontend/services/pdfApi.ts`

```typescript
import { api } from './api';

export type PdfType = 'combined' | 'questions' | 'answers';

interface PdfResponse {
  url: string;
  type: PdfType;
  createdAt?: string;
}

interface GeneratePdfResponse extends PdfResponse {
  message: string;
}

export const pdfApi = {
  async generatePdf(evaluationId: string, type: PdfType = 'combined'): Promise<GeneratePdfResponse> {
    const response = await api.post(`/evaluations/${evaluationId}/pdf/generate`, { type });
    return response.data;
  },

  async getPdfUrl(evaluationId: string, type: PdfType = 'combined'): Promise<PdfResponse> {
    const response = await api.get(`/evaluations/${evaluationId}/pdf?type=${type}`);
    return response.data;
  },

  async getAllPdfs(evaluationId: string): Promise<{ pdfs: PdfResponse[] }> {
    const response = await api.get(`/evaluations/${evaluationId}/pdfs`);
    return response.data;
  },
};
```

#### 5.2 Mettre à jour les composants

**Modifier les boutons PDF dans les composants** pour utiliser les nouveaux endpoints:

```typescript
// Au lieu de :
import { generateCombinedSheet, previewCombinedSheet } from '../../utils/pdfGeneratorHtml2Pdf';

// Utiliser :
import { pdfApi } from '../../services/pdfApi';

// Génération
const handleGeneratePdf = async (evaluationId: string) => {
  try {
    setIsLoading(true);
    const result = await pdfApi.generatePdf(evaluationId, 'combined');
    // Télécharger le PDF depuis l'URL
    window.open(result.url, '_blank');
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
  } finally {
    setIsLoading(false);
  }
};

// Prévisualisation
const handlePreviewPdf = async (evaluationId: string) => {
  try {
    const result = await pdfApi.getPdfUrl(evaluationId, 'combined');
    window.open(result.url, '_blank');
  } catch (error) {
    // Si le PDF n'existe pas, le générer d'abord
    const result = await pdfApi.generatePdf(evaluationId, 'combined');
    window.open(result.url, '_blank');
  }
};
```

---

### Phase 6 : Script de Démarrage et Initialisation

#### 6.1 Mettre à jour le script de démarrage

**Modifier:** `scripts/dev-start.ts`

Ajouter l'initialisation de MinIO:
- Attendre que MinIO soit prêt
- Créer le bucket si nécessaire

#### 6.2 Initialisation du service de stockage au démarrage

**Modifier:** `server/src/index.ts`

```typescript
import { storageService } from './services/storage.service.js';

// Au démarrage
await storageService.init();
```

---

## Fichiers à Créer/Modifier

### Nouveaux Fichiers

| Fichier | Description |
|---------|-------------|
| `server/src/services/storage.service.ts` | Service MinIO/S3 |
| `server/src/services/pdf.service.ts` | Service de génération PDF |
| `server/src/db/schema/evaluationPdfs.ts` | Schéma table evaluation_pdfs |
| `server/src/repositories/evaluationPdf.repository.ts` | Repository PDF |
| `server/src/routes/pdf.routes.ts` | Routes API PDF |
| `frontend/services/pdfApi.ts` | Service API frontend |

### Fichiers à Modifier

| Fichier | Modification |
|---------|--------------|
| `docker-compose.yml` | Ajouter service MinIO |
| `server/.env.development` | Ajouter variables MinIO |
| `server/.env.test` | Ajouter variables MinIO test |
| `server/src/config/env.ts` | Ajouter config MinIO |
| `server/src/db/schema/index.ts` | Exporter evaluationPdfs |
| `server/src/routes/index.ts` | Enregistrer routes PDF |
| `server/src/index.ts` | Initialiser storageService |
| `scripts/dev-start.ts` | Démarrer MinIO |
| `scripts/test-e2e-start.ts` | Démarrer MinIO pour tests |
| `frontend/pages/professor/Evaluations.tsx` | Utiliser nouveau service PDF |

---

## Commandes de Validation

```bash
# 1. Vérifier TypeScript
cd server && bun run tsc --noEmit

# 2. Build du projet
bun run build

# 3. Tests E2E (après implémentation des tests)
bun run test:e2e

# 4. Test manuel
docker compose up -d
bun dev
# Tester la génération PDF via l'interface
```

---

## Considérations Techniques

### Gestion des Polices (Arabe/RTL)

Puppeteer nécessite les polices installées sur le système. Options:
1. Installer les polices dans l'image Docker
2. Utiliser les polices Google Fonts via URL
3. Embarquer les polices en base64 dans le HTML

### Performances

- Puppeteer est gourmand en ressources
- Considérer une file d'attente (job queue) pour les générations massives
- Implémenter un cache pour éviter les régénérations inutiles

### Sécurité

- Les URLs signées MinIO expirent (7 jours configuré)
- Vérifier les permissions utilisateur avant génération
- Valider l'appartenance de l'évaluation au professeur

---

## Tests E2E à Créer

**Fichier:** `tests/e2e/professor/pdf-generation.spec.ts`

```typescript
test.describe('PDF Generation', () => {
  test('should generate combined PDF for evaluation', async ({ page }) => {
    // Login
    // Navigate to evaluations
    // Click generate PDF button
    // Verify PDF opens in new tab or downloads
  });

  test('should preview existing PDF', async ({ page }) => {
    // ...
  });
});
```

---

## Estimation des Dépendances

### Backend
- `minio` : Client S3 compatible (~200KB)
- `puppeteer` : Headless Chrome (~170MB avec Chromium)

### Alternative légère
Si Puppeteer est trop lourd, utiliser `@react-pdf/renderer` ou `pdfmake` côté serveur (sans navigateur).

---

## Ordre d'Exécution Recommandé

1. Phase 1.1 : docker-compose.yml (MinIO)
2. Phase 1.2-1.3 : Variables d'environnement
3. Phase 2.1 : Installation dépendances
4. Phase 3 : Schema DB + migration
5. Phase 2.2 : Service stockage
6. Phase 2.3 : Service PDF
7. Phase 4 : Routes API
8. Phase 5 : Frontend
9. Phase 6 : Scripts de démarrage
10. Tests et validation
