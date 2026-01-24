import type { TemplateData, TemplateFunction } from '../types.js';

function generateQuestionHtml(
  question: { number: number; statement: string; points: number; estimatedLines: number },
  includeQuestions: boolean,
  includeAnswerSpace: boolean
): string {
  const pointsLabel = question.points > 1 ? 'نقاط' : 'نقطة';
  const numberOfLines = Math.max(5, question.estimatedLines);
  let html: string = '';
  //  html = `
  //   <div class="question">
  //     <div class="question-header">
  //       السؤال ${question.number} (${question.points} ${pointsLabel})
  //     </div>
  // `;

  if (includeQuestions) {
    html += `
      <div class="question-text">
        ${question.statement} (${question.points} ${pointsLabel})
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

export const arabicTemplate: TemplateFunction = (data: TemplateData): string => {
  const questionsHtml = data.questions
    .map((q) => generateQuestionHtml(q, data.includeQuestions, data.includeAnswerSpace))
    .join('');

  const studentInfoHtml = data.includeAnswerSpace
    ? `
      <div class="student-info">
        <div class="student-field">الاسم الكامل: _________________________________________________________________ الرقم: ____</div>
      </div>
    `
    : '';

  return `
    <!doctype html>
    <html lang="ar">
      <head>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: 'Amiri', 'Arial', sans-serif;
            font-size: 12pt;
            line-height: 1.6;
          }
          .pdf-container {
            padding: 20px;
            direction: rtl;
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
            text-align: right;
          }
          .info {
            font-size: 11pt;
            margin-bottom: 5px;
            text-align: right;
          }
          .student-info {
            margin: 15px 0;
            padding: 10px 0;
            border-top: 1px solid #cccccc !important;
            border-bottom: 1px solid #cccccc !important;
          }
          .student-field {
            margin: 8px 0;
            text-align: right;
          }
          .question {
            margin: 20px 0;
            page-break-inside: avoid;
          }
          .question-header {
            font-weight: bold;
            font-size: 13pt;
            margin-bottom: 8px;
            text-align: right;
          }
          .question-text {
            margin-bottom: 10px;
            text-align: right;
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
        <div class="pdf-container" dir="rtl">
          ${studentInfoHtml}
          ${questionsHtml}
        </div>
      </body>
    </html>
  `;
};
