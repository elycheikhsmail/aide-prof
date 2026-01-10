import { jsPDF } from 'jspdf';
import type { Evaluation } from '../types';

/**
 * Génère un PDF avec les questions et des espaces pour répondre sur la même feuille
 */
export function generateCombinedSheet(evaluation: Evaluation): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // En-tête
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(evaluation.title, margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Matière: ${evaluation.subject}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Date: ${new Date(evaluation.date).toLocaleDateString('fr-FR')}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Total: ${evaluation.totalPoints} points`, margin, yPosition);
  yPosition += 15;

  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Informations de l'étudiant
  doc.setFontSize(11);
  doc.text('Nom: _________________________________', margin, yPosition);
  yPosition += 7;
  doc.text('Prénom: _________________________________', margin, yPosition);
  yPosition += 15;

  // Ligne de séparation
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Questions
  evaluation.questions.forEach((question, index) => {
    // Vérifier si on a besoin d'une nouvelle page
    const questionHeight = 40; // Hauteur approximative pour une question + espace de réponse
    const pointsHeight = question.points * 5; // 5mm par point pour l'espace de réponse
    const totalQuestionSpace = Math.max(questionHeight, pointsHeight);

    if (yPosition + totalQuestionSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    // Numéro et titre de la question
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Question ${index + 1} (${question.points} point${question.points > 1 ? 's' : ''})`, margin, yPosition);
    yPosition += 8;

    // Texte de la question
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const questionLines = doc.splitTextToSize(question.statement, contentWidth);
    doc.text(questionLines, margin, yPosition);
    yPosition += questionLines.length * 6;
    yPosition += 5;

    // Espace pour la réponse
    const answerSpaceHeight = Math.max(30, question.points * 5);
    doc.setDrawColor(220, 220, 220);

    // Lignes pour écrire la réponse
    const lineSpacing = 7;
    const numberOfLines = Math.floor(answerSpaceHeight / lineSpacing);
    for (let i = 0; i < numberOfLines; i++) {
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += lineSpacing;
    }

    yPosition += 10; // Espace entre les questions
  });

  // Télécharger le PDF
  const fileName = `${evaluation.title.replace(/[^a-z0-9]/gi, '_')}_feuille_reponse.pdf`;
  doc.save(fileName);
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
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // En-tête
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(evaluation.title, margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Matière: ${evaluation.subject}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Date: ${new Date(evaluation.date).toLocaleDateString('fr-FR')}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Total: ${evaluation.totalPoints} points`, margin, yPosition);
  yPosition += 15;

  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Questions
  evaluation.questions.forEach((question, index) => {
    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }

    // Numéro et titre de la question
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Question ${index + 1} (${question.points} point${question.points > 1 ? 's' : ''})`, margin, yPosition);
    yPosition += 8;

    // Texte de la question
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const questionLines = doc.splitTextToSize(question.statement, contentWidth);
    doc.text(questionLines, margin, yPosition);
    yPosition += questionLines.length * 6;
    yPosition += 15; // Espace entre les questions
  });

  // Télécharger le PDF
  const fileName = `${evaluation.title.replace(/[^a-z0-9]/gi, '_')}_questions.pdf`;
  doc.save(fileName);
}

/**
 * Génère un PDF avec les numéros de questions et des espaces pour répondre
 */
function generateAnswersSheet(evaluation: Evaluation): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // En-tête
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(evaluation.title + ' - Feuille de Réponses', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Matière: ${evaluation.subject}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Date: ${new Date(evaluation.date).toLocaleDateString('fr-FR')}`, margin, yPosition);
  yPosition += 15;

  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Informations de l'étudiant
  doc.setFontSize(11);
  doc.text('Nom: _________________________________', margin, yPosition);
  yPosition += 7;
  doc.text('Prénom: _________________________________', margin, yPosition);
  yPosition += 15;

  // Ligne de séparation
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Espaces de réponse pour chaque question
  evaluation.questions.forEach((question, index) => {
    // Calculer l'espace nécessaire
    const answerSpaceHeight = Math.max(35, question.points * 5);
    const lineSpacing = 7;
    const numberOfLines = Math.floor(answerSpaceHeight / lineSpacing);
    const totalSpace = numberOfLines * lineSpacing + 15;

    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition + totalSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    // Numéro de la question
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Question ${index + 1} (${question.points} point${question.points > 1 ? 's' : ''})`, margin, yPosition);
    yPosition += 10;

    // Lignes pour écrire la réponse
    doc.setDrawColor(220, 220, 220);
    doc.setFont('helvetica', 'normal');
    for (let i = 0; i < numberOfLines; i++) {
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += lineSpacing;
    }

    yPosition += 10; // Espace entre les questions
  });

  // Télécharger le PDF
  const fileName = `${evaluation.title.replace(/[^a-z0-9]/gi, '_')}_reponses.pdf`;
  doc.save(fileName);
}
