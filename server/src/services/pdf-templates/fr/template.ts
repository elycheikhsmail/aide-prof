import type { TemplateData, TemplateFunction } from '../types.js';

function generateQuestionHtml(
  question: { number: number; statement: string; points: number; estimatedLines: number },
  includeQuestions: boolean,
  includeAnswerSpace: boolean
): string {
  const pointsLabel = question.points > 1 ? 'points' : 'point';
  const numberOfLines = Math.max(5, question.estimatedLines);

  let html = `
    <div class="question">
      <div class="question-header">
        Question ${question.number} (${question.points} ${pointsLabel})
      </div>
  `;

  if (includeQuestions) {
    html += `
      <div class="question-text">
        ${question.statement}
      </div>
    `;
  }

  if (includeAnswerSpace) {
    html += '<div class="answer-lines">';
    for (let i = 0; i < numberOfLines; i++) {
      html += '<div class="answer-line"></div>';
    }
    html += '</div>';
  }

  html += '</div>';
  return html;
}

export const frenchTemplate: TemplateFunction = (data: TemplateData): string => {
  const questionsHtml = data.questions
    .map((q) => generateQuestionHtml(q, data.includeQuestions, data.includeAnswerSpace))
    .join('');

  const studentInfoHtml = data.includeAnswerSpace
    ? `
      <div class="student-info">
        <div class="student-field">Nom complet: _________________________________ Numéro: _________________________________</div>
      </div>
    `
    : '';

  return `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: 'Roboto', 'Arial', sans-serif;
            font-size: 12pt;
            line-height: 1.6;
          }
          .pdf-container {
            padding: 20px;
            direction: ltr;
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
            text-align: left;
          }
          .info {
            font-size: 11pt;
            margin-bottom: 5px;
            text-align: left;
          }
          .student-info {
            margin: 15px 0;
            padding: 10px 0;
            border-top: 1px solid #cccccc !important;
            border-bottom: 1px solid #cccccc !important;
          }
          .student-field {
            margin: 8px 0;
            text-align: left;
          }
          .question {
            margin: 20px 0;
            page-break-inside: avoid;
          }
          .question-header {
            font-weight: bold;
            font-size: 13pt;
            margin-bottom: 8px;
            text-align: left;
          }
          .question-text {
            margin-bottom: 10px;
            text-align: left;
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
        <div class="pdf-container" dir="ltr">
          ${studentInfoHtml}
          ${questionsHtml}
        </div>
      </body>
    </html>
  `;
};
