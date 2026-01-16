import html2pdf from 'html2pdf.js';
import type { Evaluation } from '../types';

/**
 * Détecte si un texte contient des caractères arabes
 */
function containsArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicRegex.test(text);
}

/**
 * Crée le HTML pour le PDF avec support arabe
 */
function createEvaluationHTML(evaluation: Evaluation, includeQuestions: boolean, includeAnswerSpace: boolean): string {
  const hasArabic = evaluation.questions.some(q => containsArabic(q.statement));
  const direction = hasArabic ? 'rtl' : 'ltr';
  const align = hasArabic ? 'right' : 'left';
  const fontFamily = hasArabic ? "'Amiri', 'Arial', sans-serif" : "'Roboto', 'Arial', sans-serif";

  let html = `
    <div dir="${direction}" style="all: initial; display: block; font-family: ${fontFamily}; font-size: 12pt; line-height: 1.6; padding: 20px; background-color: #ffffff !important; color: #000000 !important;">
      <style>
        * {
          all: unset;
          display: revert;
          box-sizing: border-box;
        }
        div, span, p, h1, h2, h3, h4, h5, h6 {
          display: block;
          background-color: transparent !important;
          color: #000000 !important;
          border-color: #333333 !important;
        }
        .pdf-container {
          font-family: ${fontFamily};
          font-size: 12pt;
          line-height: 1.6;
          padding: 20px;
          direction: ${direction};
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        .header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #333333 !important;
          background-color: transparent !important;
        }
        .title {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 10px;
          text-align: ${align};
          color: #000000 !important;
          background-color: transparent !important;
        }
        .info {
          font-size: 11pt;
          margin-bottom: 5px;
          text-align: ${align};
          color: #000000 !important;
          background-color: transparent !important;
        }
        .separator {
          border-top: 1px solid #cccccc !important;
          margin: 15px 0;
          background-color: transparent !important;
        }
        .student-info {
          margin: 15px 0;
          padding: 10px 0;
          border-top: 1px solid #cccccc !important;
          border-bottom: 1px solid #cccccc !important;
          background-color: transparent !important;
        }
        .student-field {
          margin: 8px 0;
          text-align: ${align};
          color: #000000 !important;
          background-color: transparent !important;
        }
        .question {
          margin: 20px 0;
          page-break-inside: avoid;
          background-color: transparent !important;
        }
        .question-header {
          font-weight: bold;
          font-size: 13pt;
          margin-bottom: 8px;
          text-align: ${align};
          color: #000000 !important;
          background-color: transparent !important;
        }
        .question-text {
          margin-bottom: 10px;
          text-align: ${align};
          white-space: pre-wrap;
          color: #000000 !important;
          background-color: transparent !important;
        }
        .answer-lines {
          margin-top: 10px;
          background-color: transparent !important;
        }
        .answer-line {
          border-bottom: 1px solid #dddddd !important;
          height: 25px;
          margin: 2px 0;
          background-color: transparent !important;
        }
      </style>
      <div class="header">
        <div class="title">${evaluation.title}</div>
        <div class="info">${hasArabic ? 'المادة' : 'Matière'}: ${evaluation.subject}</div>
        <div class="info">${hasArabic ? 'التاريخ' : 'Date'}: ${new Date(evaluation.date).toLocaleDateString('fr-FR')}</div>
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
    const questionHasArabic = containsArabic(question.statement);
    const questionAlign = questionHasArabic ? 'right' : 'left';

    html += `
      <div class="question">
        <div class="question-header" style="text-align: ${questionAlign}">
          ${hasArabic ? 'السؤال' : 'Question'} ${index + 1}
          (${question.points} ${question.points > 1 ? (hasArabic ? 'نقاط' : 'points') : (hasArabic ? 'نقطة' : 'point')})
        </div>
    `;

    if (includeQuestions) {
      html += `
        <div class="question-text" style="text-align: ${questionAlign}">
          ${question.statement}
        </div>
      `;
    }

    if (includeAnswerSpace) {
      const numberOfLines = Math.max(5, question.points * 2);
      html += '<div class="answer-lines">';
      for (let i = 0; i < numberOfLines; i++) {
        html += '<div class="answer-line"></div>';
      }
      html += '</div>';
    }

    html += '</div>';
  });

  html += `
    </div>
  `;

  return html;
}

/**
 * Génère un PDF avec les questions et des espaces pour répondre sur la même feuille
 */
export function generateCombinedSheet(evaluation: Evaluation): void {
  const html = createEvaluationHTML(evaluation, true, true);

  const element = document.createElement('div');
  element.innerHTML = html;
  element.style.display = 'none';
  document.body.appendChild(element);

  const opt = {
    margin: [10, 10] as [number, number],
    filename: `${evaluation.title.replace(/[^a-z0-9]/gi, '_')}_feuille_reponse.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  };

  const firstChild = element.firstElementChild as HTMLElement;
  if (!firstChild) {
    document.body.removeChild(element);
    throw new Error('Impossible de générer le PDF: élément non trouvé');
  }

  console.log('Génération du PDF combiné pour:', evaluation.title);
  console.log('Element HTML:', firstChild);

  html2pdf()
    .from(firstChild)
    .set(opt)
    .save()
    .then(() => {
      console.log('PDF généré avec succès');
      document.body.removeChild(element);
    })
    .catch((error: Error) => {
      console.error('Erreur lors de la génération du PDF:', error);
      document.body.removeChild(element);
      throw error;
    });
}

/**
 * Prévisualise le PDF dans un nouvel onglet du navigateur
 */
export function previewCombinedSheet(evaluation: Evaluation): void {
  const html = createEvaluationHTML(evaluation, true, true);

  const element = document.createElement('div');
  element.innerHTML = html;
  element.style.display = 'none';
  document.body.appendChild(element);

  const opt = {
    margin: [10, 10] as [number, number],
    filename: `${evaluation.title.replace(/[^a-z0-9]/gi, '_')}_feuille_reponse.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  };

  const firstChild = element.firstElementChild as HTMLElement;
  if (!firstChild) {
    document.body.removeChild(element);
    throw new Error('Impossible de générer le PDF: élément non trouvé');
  }

  console.log('Prévisualisation du PDF pour:', evaluation.title);

  html2pdf()
    .from(firstChild)
    .set(opt)
    .outputPdf('bloburl')
    .then((blobUrl: string) => {
      console.log('PDF prévisualisé avec succès');
      document.body.removeChild(element);
      // Ouvrir le PDF dans un nouvel onglet
      window.open(blobUrl, '_blank');
    })
    .catch((error: Error) => {
      console.error('Erreur lors de la prévisualisation du PDF:', error);
      document.body.removeChild(element);
      throw error;
    });
}

/**
 * Génère deux PDF séparés : un avec les questions, un avec les espaces de réponse
 */
export function generateSeparateSheets(evaluation: Evaluation): void {
  generateQuestionsSheet(evaluation);
  setTimeout(() => {
    generateAnswersSheet(evaluation);
  }, 1000); // Délai pour éviter les conflits
}

/**
 * Génère un PDF avec uniquement les questions
 */
function generateQuestionsSheet(evaluation: Evaluation): void {
  const html = createEvaluationHTML(evaluation, true, false);

  const element = document.createElement('div');
  element.innerHTML = html;
  element.style.display = 'none';
  document.body.appendChild(element);

  const opt = {
    margin: [10, 10] as [number, number],
    filename: `${evaluation.title.replace(/[^a-z0-9]/gi, '_')}_questions.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  };

  const firstChild = element.firstElementChild as HTMLElement;
  if (!firstChild) {
    document.body.removeChild(element);
    throw new Error('Impossible de générer le PDF: élément non trouvé');
  }

  console.log('Génération du PDF questions pour:', evaluation.title);

  html2pdf()
    .from(firstChild)
    .set(opt)
    .save()
    .then(() => {
      console.log('PDF questions généré avec succès');
      document.body.removeChild(element);
    })
    .catch((error: Error) => {
      console.error('Erreur lors de la génération du PDF questions:', error);
      document.body.removeChild(element);
      throw error;
    });
}

/**
 * Génère un PDF avec les numéros de questions et des espaces pour répondre
 */
function generateAnswersSheet(evaluation: Evaluation): void {
  const html = createEvaluationHTML(evaluation, false, true);

  const element = document.createElement('div');
  element.innerHTML = html;
  element.style.display = 'none';
  document.body.appendChild(element);

  const opt = {
    margin: [10, 10] as [number, number],
    filename: `${evaluation.title.replace(/[^a-z0-9]/gi, '_')}_reponses.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  };

  const firstChild = element.firstElementChild as HTMLElement;
  if (!firstChild) {
    document.body.removeChild(element);
    throw new Error('Impossible de générer le PDF: élément non trouvé');
  }

  console.log('Génération du PDF réponses pour:', evaluation.title);

  html2pdf()
    .from(firstChild)
    .set(opt)
    .save()
    .then(() => {
      console.log('PDF réponses généré avec succès');
      document.body.removeChild(element);
    })
    .catch((error: Error) => {
      console.error('Erreur lors de la génération du PDF réponses:', error);
      document.body.removeChild(element);
      throw error;
    });
}
