import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, FileDown, Loader2, ChevronLeft, ChevronRight, Trash2, RefreshCw, Eye, Pencil } from 'lucide-react';
import { Button, Card, Badge } from '../../components/ui';
import { ImportEvaluationModal } from '../../components/professor/ImportEvaluationModal';
import { EditEvaluationModal } from '../../components/professor/EditEvaluationModal';
import { GeneratePdfModal, type PdfGenerationOptions } from '../../components/professor/GeneratePdfModal';
import { useEvaluations } from '../../contexts/EvaluationsContext';
import { generateCombinedSheet, generateSeparateSheets, previewCombinedSheet } from '../../utils/pdfGeneratorHtml2Pdf';
import type { Evaluation } from '../../types';

const ITEMS_PER_PAGE = 10;

export function Evaluations() {
  const navigate = useNavigate();
  const { evaluations, addEvaluation, removeEvaluation, updateEvaluation, refreshEvaluations, isLoading, error } = useEvaluations();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [isGeneratePdfModalOpen, setIsGeneratePdfModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Calcul de la pagination
  const totalPages = Math.ceil(evaluations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEvaluations = evaluations.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Composant de boutons de pagination réutilisable
  const PaginationControls = () => (
    <div className="flex items-center justify-between py-3">
      <Button
        variant="outline"
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
        data-testid="pagination-previous"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Précédent
      </Button>
      <span className="text-sm text-gray-600">
        Page {currentPage} sur {totalPages} ({evaluations.length} évaluation{evaluations.length > 1 ? 's' : ''})
      </span>
      <Button
        variant="outline"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        data-testid="pagination-next"
      >
        Suivant
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );

  const handleImportEvaluation = async (evaluation: Evaluation) => {
    await addEvaluation({
      title: evaluation.title,
      subject: evaluation.subject,
      date: evaluation.date,
      duration: evaluation.duration,
      totalPoints: evaluation.totalPoints,
      questions: evaluation.questions.map((q, index) => ({
        number: q.number || index + 1,
        statement: q.statement,
        modelAnswer: q.modelAnswer || '',
        points: q.points,
        estimatedLines: q.estimatedLines || 5,
      })),
    });
    setIsImportModalOpen(false);
  };

  const handleGeneratePdf = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setIsGeneratePdfModalOpen(true);
  };

  const handlePdfGenerate = (options: PdfGenerationOptions) => {
    if (!selectedEvaluation) return;

    try {
      // Générer les PDF selon les options sélectionnées
      if (options.combinedSheet) {
        generateCombinedSheet(selectedEvaluation);
      }
      if (options.separateSheets) {
        generateSeparateSheets(selectedEvaluation);
      }

      // Fermer le modal après génération
      setIsGeneratePdfModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Une erreur est survenue lors de la génération du PDF');
    }
  };

  const handleEditEvaluation = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setIsEditModalOpen(true);
  };

  const handleUpdateEvaluation = async (id: string, updates: Partial<Evaluation>) => {
    await updateEvaluation(id, updates);
  };

  if (isLoading && evaluations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Mes évaluations</h2>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => refreshEvaluations()}
              disabled={isLoading}
              data-testid="refresh-evaluations"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload className="w-5 h-5 mr-2" />
              Importer JSON
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/evaluations/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer une évaluation
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {evaluations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Aucune évaluation pour le moment</p>
            <p className="text-gray-500 text-sm mt-2">Cliquez sur "Créer une évaluation" ou "Importer JSON" pour commencer</p>
          </div>
        ) : (
          <>
            {/* Boutons de pagination en haut */}
            <PaginationControls />

            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Titre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Matière
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Questions
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedEvaluations.map((evaluation) => (
                    <tr key={evaluation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {evaluation.title}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {evaluation.subject}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {new Date(evaluation.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {evaluation.questions.length} question{evaluation.questions.length > 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            evaluation.status === 'completed'
                              ? 'success'
                              : evaluation.status === 'correcting'
                              ? 'warning'
                              : evaluation.status === 'active'
                              ? 'info'
                              : 'neutral'
                          }
                        >
                          {evaluation.status === 'completed'
                            ? 'Terminé'
                            : evaluation.status === 'correcting'
                            ? 'Correction'
                            : evaluation.status === 'active'
                            ? 'Actif'
                            : 'Brouillon'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEvaluation(evaluation)}
                            data-testid={`edit-evaluation-${evaluation.id}`}
                            title="Modifier cette évaluation"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => previewCombinedSheet(evaluation)}
                            data-testid={`preview-evaluation-${evaluation.id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Aperçu
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGeneratePdf(evaluation)}
                          >
                            <FileDown className="w-4 h-4 mr-1" />
                            Générer PDF
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeEvaluation(evaluation.id)}
                            data-testid={`delete-evaluation-${evaluation.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Boutons de pagination en bas */}
            <PaginationControls />
          </>
        )}
      </div>

      {/* Modal d'import d'évaluation depuis JSON */}
      <ImportEvaluationModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportEvaluation}
      />

      {/* Modal d'édition d'évaluation */}
      <EditEvaluationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        evaluation={selectedEvaluation}
        onUpdate={handleUpdateEvaluation}
      />

      {/* Modal de génération de PDF */}
      <GeneratePdfModal
        isOpen={isGeneratePdfModalOpen}
        onClose={() => setIsGeneratePdfModalOpen(false)}
        evaluation={selectedEvaluation}
        onGenerate={handlePdfGenerate}
      />
    </>
  );
}
