import { apiFetch } from './api';

export type PdfType = 'combined' | 'questions' | 'answers';

export interface PdfResponse {
  url: string;
  type: PdfType;
  createdAt?: string;
}

export interface GeneratePdfResponse extends PdfResponse {
  message: string;
}

export const pdfApi = {
  async generatePdf(evaluationId: string, type: PdfType = 'combined'): Promise<GeneratePdfResponse> {
    return apiFetch<GeneratePdfResponse>(`/evaluations/${evaluationId}/pdf/generate`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  },

  async getPdfUrl(evaluationId: string, type: PdfType = 'combined'): Promise<PdfResponse> {
    return apiFetch<PdfResponse>(`/evaluations/${evaluationId}/pdf?type=${type}`);
  },

  async getAllPdfs(evaluationId: string): Promise<{ pdfs: PdfResponse[] }> {
    return apiFetch<{ pdfs: PdfResponse[] }>(`/evaluations/${evaluationId}/pdfs`);
  },
};
