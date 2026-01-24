import puppeteer from 'puppeteer';
import type { Evaluation, Question } from '../db/schema/index.js';

type EvaluationWithQuestions = Evaluation & { questions: Question[] };

class PdfService {
  private containsArabic(text: string): boolean {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    return arabicRegex.test(text);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private createEvaluationHTML(
    evaluation: EvaluationWithQuestions,
    includeQuestions: boolean,
    includeAnswerSpace: boolean
  ): string {
    const hasArabic = evaluation.questions.some((question) => this.containsArabic(question.statement));
    const direction = hasArabic ? 'rtl' : 'ltr';
    const align = hasArabic ? 'right' : 'left';
    const fontFamily = hasArabic ? "'Amiri', 'Arial', sans-serif" : "'Roboto', 'Arial', sans-serif";
    const title = this.escapeHtml(evaluation.title);
    const subject = this.escapeHtml(evaluation.subject);
    const formattedDate = new Date(evaluation.date).toLocaleDateString('fr-FR');

    let html = `
      <!doctype html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Roboto:wght@400;700&display=swap');
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 0;
              background-color: #ffffff !important;
              color: #000000 !important;
              font-family: ${fontFamily};
              font-size: 12pt;
              line-height: 1.6;
            }
            .pdf-container {
              padding: 20px;
              direction: ${direction};
            }
            .header {
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #333333 !important;
            }
            .title {
              font-size: 18pt;
              font-weight: bold;
              margin-bottom: 10px;
              text-align: ${align};
            }
            .info {
              font-size: 11pt;
              margin-bottom: 5px;
              text-align: ${align};
            }
            .separator {
              border-top: 1px solid #cccccc !important;
              margin: 15px 0;
            }
            .student-info {
              margin: 15px 0;
              padding: 10px 0;
              border-top: 1px solid #cccccc !important;
              border-bottom: 1px solid #cccccc !important;
            }
            .student-field {
              margin: 8px 0;
              text-align: ${align};
            }
            .question {
              margin: 20px 0;
              page-break-inside: avoid;
            }
            .question-header {
              font-weight: bold;
              font-size: 13pt;
              margin-bottom: 8px;
              text-align: ${align};
            }
            .question-text {
              margin-bottom: 10px;
              text-align: ${align};
              white-space: pre-wrap;
            }
            .answer-lines {
              margin-top: 10px;
            }
            .answer-line {
              border-bottom: 1px solid #dddddd !important;
              height: 25px;
              margin: 2px 0;
            }
          </style>
        </head>
        <body>
          <div class="pdf-container" dir="${direction}">
            <div class="header">
              <div class="title">${title}</div>
              <div class="info">${hasArabic ? 'المادة' : 'Matière'}: ${subject}</div>
              <div class="info">${hasArabic ? 'التاريخ' : 'Date'}: ${formattedDate}</div>
              <div class="info">${hasArabic ? 'المجموع' : 'Total'}: ${evaluation.totalPoints} ${hasArabic ? 'نقطة' : 'points'}</div>
            </div>
    `;

    if (includeAnswerSpace) {
      html += `
            <div class="student-info">
              <div class="student-field">${hasArabic ? 'الاسم' : 'Nom'}: _________________________________</div>
              <div class="student-field">${hasArabic ? 'اللقب' : 'Prénom'}: _________________________________</div>
            </div>
      `;
    }

    evaluation.questions.forEach((question, index) => {
      const questionHasArabic = this.containsArabic(question.statement);
      const questionAlign = questionHasArabic ? 'right' : 'left';
      const questionNumber = question.number || index + 1;
      const statement = this.escapeHtml(question.statement);
      const pointsLabel =
        question.points > 1 ? (hasArabic ? 'نقاط' : 'points') : (hasArabic ? 'نقطة' : 'point');

      html += `
            <div class="question">
              <div class="question-header" style="text-align: ${questionAlign}">
                ${hasArabic ? 'السؤال' : 'Question'} ${questionNumber}
                (${question.points} ${pointsLabel})
              </div>
      `;

      if (includeQuestions) {
        html += `
              <div class="question-text" style="text-align: ${questionAlign}">
                ${statement}
              </div>
        `;
      }

      if (includeAnswerSpace) {
        const suggestedLines = question.estimatedLines ?? question.points * 2;
        const numberOfLines = Math.max(5, suggestedLines);
        html += '<div class="answer-lines">';
        for (let i = 0; i < numberOfLines; i += 1) {
          html += '<div class="answer-line"></div>';
        }
        html += '</div>';
      }

      html += '</div>';
    });

    html += `
          </div>
        </body>
      </html>
    `;

    return html;
  }

  private async generatePdfBuffer(
    evaluation: EvaluationWithQuestions,
    includeQuestions: boolean,
    includeAnswerSpace: boolean
  ): Promise<Buffer> {
    const html = this.createEvaluationHTML(evaluation, includeQuestions, includeAnswerSpace);

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
