import type { Evaluation } from '../types';

// @ts-ignore - pdfmake n'a pas de types parfaits
import pdfMake from 'pdfmake/build/pdfmake';
// @ts-ignore - vfs_fonts n'a pas de types
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Types pour pdfMake
type Content = any;
type TDocumentDefinitions = {
  content: Content[];
  styles?: any;
  defaultStyle?: any;
};

// Configurer les polices - pdfFonts peut avoir différentes structures selon la version
console.log('pdfFonts structure:', pdfFonts);
console.log('pdfFonts.pdfMake:', pdfFonts.pdfMake);
console.log('pdfFonts.vfs:', pdfFonts.vfs);

// Essayer différentes structures possibles
let vfs;
if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  vfs = pdfFonts.pdfMake.vfs;
  console.log('Using pdfFonts.pdfMake.vfs');
} else if (pdfFonts.vfs) {
  vfs = pdfFonts.vfs;
  console.log('Using pdfFonts.vfs');
} else if (typeof pdfFonts === 'object' && Object.keys(pdfFonts).length > 0) {
  // Si pdfFonts est directement l'objet vfs
  vfs = pdfFonts;
  console.log('Using pdfFonts directly as vfs');
} else {
  console.error('Could not find vfs in pdfFonts!');
  vfs = {};
}

(pdfMake as any).vfs = vfs;

/**
 * Détecte si un texte contient des caractères arabes
 */
function containsArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicRegex.test(text);
}

/**
 * Génère un PDF avec les questions et des espaces pour répondre sur la même feuille
 */
export function generateCombinedSheet(evaluation: Evaluation): void {
  const hasArabic = evaluation.questions.some(q => containsArabic(q.statement));

  const content: Content[] = [
    // En-tête
    {
      text: evaluation.title,
      style: 'header',
      alignment: hasArabic ? 'right' : 'left',
    },
    {
      text: `${hasArabic ? 'المادة' : 'Matière'}: ${evaluation.subject}`,
      style: 'subheader',
      alignment: hasArabic ? 'right' : 'left',
    },
    {
      text: `${hasArabic ? 'التاريخ' : 'Date'}: ${new Date(evaluation.date).toLocaleDateString('fr-FR')}`,
      alignment: hasArabic ? 'right' : 'left',
    },
    {
      text: `${hasArabic ? 'المجموع' : 'Total'}: ${evaluation.totalPoints} ${hasArabic ? 'نقطة' : 'points'}`,
      alignment: hasArabic ? 'right' : 'left',
      margin: [0, 0, 0, 10],
    },
    {
      canvas: [
        { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#CCCCCC' }
      ],
      margin: [0, 5, 0, 10],
    },
    // Informations de l'étudiant
    {
      text: `${hasArabic ? 'الاسم' : 'Nom'}: _________________________________`,
      alignment: hasArabic ? 'right' : 'left',
    },
    {
      text: `${hasArabic ? 'اللقب' : 'Prénom'}: _________________________________`,
      alignment: hasArabic ? 'right' : 'left',
      margin: [0, 0, 0, 15],
    },
    {
      canvas: [
        { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#CCCCCC' }
      ],
      margin: [0, 5, 0, 15],
    },
  ];

  // Ajouter les questions
  evaluation.questions.forEach((question, index) => {
    const questionHasArabic = containsArabic(question.statement);

    content.push(
      {
        text: `${hasArabic ? 'السؤال' : 'Question'} ${index + 1} (${question.points} ${question.points > 1 ? (hasArabic ? 'نقاط' : 'points') : (hasArabic ? 'نقطة' : 'point')})`,
        style: 'questionHeader',
        alignment: questionHasArabic ? 'right' : 'left',
      },
      {
        text: question.statement,
        margin: [0, 5, 0, 10],
        alignment: questionHasArabic ? 'right' : 'left',
      }
    );

    // Ajouter des lignes pour la réponse
    const numberOfLines = Math.max(5, question.points * 2);
    for (let i = 0; i < numberOfLines; i++) {
      content.push({
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#DDDDDD' }
        ],
        margin: [0, 0, 0, 7],
      });
    }

    content.push({ text: '', margin: [0, 0, 0, 10] }); // Espace entre les questions
  });

  const docDefinition: TDocumentDefinitions = {
    content,
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },
      subheader: {
        fontSize: 12,
        margin: [0, 0, 0, 5] as [number, number, number, number],
      },
      questionHeader: {
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 5] as [number, number, number, number],
      },
    },
    defaultStyle: {
      font: 'Roboto',
    },
  };

  const fileName = `${evaluation.title.replace(/[^a-z0-9]/gi, '_')}_feuille_reponse.pdf`;
  pdfMake.createPdf(docDefinition).download(fileName);
}

/**
 * Génère deux PDF séparés : un avec les questions, un avec les espaces de réponse
 */
export function generateSeparateSheets(evaluation: Evaluation): void {
  generateQuestionsSheet(evaluation);
  generateAnswersSheet(evaluation);
}

/**
 * Génère un PDF avec uniquement les questions
 */
function generateQuestionsSheet(evaluation: Evaluation): void {
  const hasArabic = evaluation.questions.some(q => containsArabic(q.statement));

  const content: Content[] = [
    // En-tête
    {
      text: evaluation.title,
      style: 'header',
      alignment: hasArabic ? 'right' : 'left',
    },
    {
      text: `${hasArabic ? 'المادة' : 'Matière'}: ${evaluation.subject}`,
      style: 'subheader',
      alignment: hasArabic ? 'right' : 'left',
    },
    {
      text: `${hasArabic ? 'التاريخ' : 'Date'}: ${new Date(evaluation.date).toLocaleDateString('fr-FR')}`,
      alignment: hasArabic ? 'right' : 'left',
    },
    {
      text: `${hasArabic ? 'المجموع' : 'Total'}: ${evaluation.totalPoints} ${hasArabic ? 'نقطة' : 'points'}`,
      alignment: hasArabic ? 'right' : 'left',
      margin: [0, 0, 0, 15],
    },
    {
      canvas: [
        { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#CCCCCC' }
      ],
      margin: [0, 5, 0, 15],
    },
  ];

  // Ajouter les questions
  evaluation.questions.forEach((question, index) => {
    const questionHasArabic = containsArabic(question.statement);

    content.push(
      {
        text: `${hasArabic ? 'السؤال' : 'Question'} ${index + 1} (${question.points} ${question.points > 1 ? (hasArabic ? 'نقاط' : 'points') : (hasArabic ? 'نقطة' : 'point')})`,
        style: 'questionHeader',
        alignment: questionHasArabic ? 'right' : 'left',
      },
      {
        text: question.statement,
        margin: [0, 5, 0, 15],
        alignment: questionHasArabic ? 'right' : 'left',
      }
    );
  });

  const docDefinition: TDocumentDefinitions = {
    content,
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },
      subheader: {
        fontSize: 12,
        margin: [0, 0, 0, 5] as [number, number, number, number],
      },
      questionHeader: {
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 5] as [number, number, number, number],
      },
    },
    defaultStyle: {
      font: 'Roboto',
    },
  };

  const fileName = `${evaluation.title.replace(/[^a-z0-9]/gi, '_')}_questions.pdf`;
  pdfMake.createPdf(docDefinition).download(fileName);
}

/**
 * Génère un PDF avec les numéros de questions et des espaces pour répondre
 */
function generateAnswersSheet(evaluation: Evaluation): void {
  const hasArabic = evaluation.questions.some(q => containsArabic(q.statement));

  const content: Content[] = [
    // En-tête
    {
      text: `${evaluation.title} - ${hasArabic ? 'ورقة الإجابة' : 'Feuille de Réponses'}`,
      style: 'header',
      alignment: hasArabic ? 'right' : 'left',
    },
    {
      text: `${hasArabic ? 'المادة' : 'Matière'}: ${evaluation.subject}`,
      style: 'subheader',
      alignment: hasArabic ? 'right' : 'left',
    },
    {
      text: `${hasArabic ? 'التاريخ' : 'Date'}: ${new Date(evaluation.date).toLocaleDateString('fr-FR')}`,
      alignment: hasArabic ? 'right' : 'left',
      margin: [0, 0, 0, 15],
    },
    {
      canvas: [
        { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#CCCCCC' }
      ],
      margin: [0, 5, 0, 10],
    },
    // Informations de l'étudiant
    {
      text: `${hasArabic ? 'الاسم' : 'Nom'}: _________________________________`,
      alignment: hasArabic ? 'right' : 'left',
    },
    {
      text: `${hasArabic ? 'اللقب' : 'Prénom'}: _________________________________`,
      alignment: hasArabic ? 'right' : 'left',
      margin: [0, 0, 0, 15],
    },
    {
      canvas: [
        { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#CCCCCC' }
      ],
      margin: [0, 5, 0, 15],
    },
  ];

  // Espaces de réponse pour chaque question
  evaluation.questions.forEach((question, index) => {
    content.push({
      text: `${hasArabic ? 'السؤال' : 'Question'} ${index + 1} (${question.points} ${question.points > 1 ? (hasArabic ? 'نقاط' : 'points') : (hasArabic ? 'نقطة' : 'point')})`,
      style: 'questionHeader',
      alignment: hasArabic ? 'right' : 'left',
    });

    // Ajouter des lignes pour la réponse
    const numberOfLines = Math.max(5, question.points * 2);
    for (let i = 0; i < numberOfLines; i++) {
      content.push({
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#DDDDDD' }
        ],
        margin: [0, 0, 0, 7],
      });
    }

    content.push({ text: '', margin: [0, 0, 0, 10] }); // Espace entre les questions
  });

  const docDefinition: TDocumentDefinitions = {
    content,
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },
      subheader: {
        fontSize: 12,
        margin: [0, 0, 0, 5] as [number, number, number, number],
      },
      questionHeader: {
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },
    },
    defaultStyle: {
      font: 'Roboto',
    },
  };

  const fileName = `${evaluation.title.replace(/[^a-z0-9]/gi, '_')}_reponses.pdf`;
  pdfMake.createPdf(docDefinition).download(fileName);
}
