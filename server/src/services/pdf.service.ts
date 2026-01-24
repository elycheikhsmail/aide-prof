import puppeteer from 'puppeteer';
import type { Evaluation, Question } from '../db/schema/index.js';
import { containsArabic, prepareTemplateData, getTemplate } from './pdf-templates/index.js';

type EvaluationWithQuestions = Evaluation & { questions: Question[] };

class PdfService {
  private async generatePdfBuffer(
    evaluation: EvaluationWithQuestions,
    includeQuestions: boolean,
    includeAnswerSpace: boolean
  ): Promise<Buffer> {
    const isArabic = evaluation.questions.some((q) => containsArabic(q.statement));
    const templateData = prepareTemplateData(evaluation, includeQuestions, includeAnswerSpace);
    const template = getTemplate(isArabic);
    const html = template(templateData);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
        printBackground: true,
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  async generateCombinedSheet(evaluation: EvaluationWithQuestions): Promise<Buffer> {
    return this.generatePdfBuffer(evaluation, true, true);
  }

  async generateQuestionsSheet(evaluation: EvaluationWithQuestions): Promise<Buffer> {
    return this.generatePdfBuffer(evaluation, true, false);
  }

  async generateAnswersSheet(evaluation: EvaluationWithQuestions): Promise<Buffer> {
    return this.generatePdfBuffer(evaluation, false, true);
  }
}

export const pdfService = new PdfService();
