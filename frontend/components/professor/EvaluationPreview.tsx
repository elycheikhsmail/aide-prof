import type { Evaluation } from '../../types';
import { Card, Badge } from '../ui';
import { CheckCircle, AlertCircle, AlertTriangle, FileText } from 'lucide-react';

export interface EvaluationPreviewProps {
  evaluation: Partial<Evaluation>;
  errors: string[];
  warnings?: string[];
}

export function EvaluationPreview({ evaluation, errors, warnings = [] }: EvaluationPreviewProps) {
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  return (
    <div className="space-y-6" data-testid="evaluation-preview">
      {/* Statut de validation */}
      <div className="flex items-center space-x-3">
        {hasErrors ? (
          <>
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h4 className="text-lg font-semibold text-red-700">Validation échouée</h4>
          </>
        ) : (
          <>
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h4 className="text-lg font-semibold text-green-700">Validation réussie</h4>
          </>
        )}
      </div>

      {/* Liste des erreurs */}
      {hasErrors && (
        <Card>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h5 className="font-semibold text-red-700">
                Erreurs ({errors.length})
              </h5>
            </div>
            <ul className="space-y-1" data-testid="validation-errors">
              {errors.map((error, index) => (
                <li
                  key={index}
                  className="text-sm text-red-600 pl-4 border-l-2 border-red-300"
                  data-testid={`validation-error-${index}`}
                >
                  {error}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Liste des warnings */}
      {hasWarnings && (
        <Card>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h5 className="font-semibold text-orange-700">
                Avertissements ({warnings.length})
              </h5>
            </div>
            <ul className="space-y-1" data-testid="validation-warnings">
              {warnings.map((warning, index) => (
                <li
                  key={index}
                  className="text-sm text-orange-600 pl-4 border-l-2 border-orange-300"
                  data-testid={`validation-warning-${index}`}
                >
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Aperçu de l'évaluation (si pas d'erreurs bloquantes) */}
      {!hasErrors && (
        <div className="space-y-4">
          <h5 className="font-semibold text-gray-900">Aperçu de l'évaluation</h5>

          {/* Informations de base */}
          <Card header="Informations générales">
            <div className="grid grid-cols-2 gap-4" data-testid="preview-basic-info">
              <div>
                <p className="text-sm font-medium text-gray-500">Titre</p>
                <p className="text-base text-gray-900">{evaluation.title || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Matière</p>
                <p className="text-base text-gray-900">{evaluation.subject || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p className="text-base text-gray-900">{evaluation.date || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Durée</p>
                <p className="text-base text-gray-900">
                  {evaluation.duration ? `${evaluation.duration} min` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total des points</p>
                <p className="text-base text-gray-900 font-semibold">
                  {evaluation.totalPoints || 0}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Statut</p>
                <div className="mt-1">
                  <Badge variant={getStatusVariant(evaluation.status || 'draft')}>
                    {getStatusLabel(evaluation.status || 'draft')}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Questions */}
          {evaluation.questions && evaluation.questions.length > 0 && (
            <Card header={`Questions (${evaluation.questions.length})`}>
              <div className="space-y-4" data-testid="preview-questions">
                {evaluation.questions.map((question, index) => (
                  <div
                    key={question.id || index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    data-testid={`preview-question-${index}`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-700">
                          {question.number}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {question.statement}
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        <span className="font-medium">Réponse modèle:</span> {question.modelAnswer}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          <span className="font-medium">{question.points}</span> points
                        </span>
                        <span>
                          <FileText className="w-3 h-3 inline mr-1" />
                          {question.estimatedLines} lignes
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Résumé des points */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Total calculé à partir des questions
                  </span>
                  <span className="text-base font-semibold text-gray-900">
                    {evaluation.questions.reduce((sum, q) => sum + (q.points || 0), 0)} points
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Classes assignées */}
          {evaluation.classIds && evaluation.classIds.length > 0 && (
            <Card header="Classes assignées">
              <div className="flex flex-wrap gap-2" data-testid="preview-classes">
                {evaluation.classIds.map((classId, index) => (
                  <Badge key={index} variant="info">
                    {classId}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// Helpers pour le statut
function getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'active':
      return 'info';
    case 'correcting':
      return 'warning';
    case 'draft':
    default:
      return 'neutral';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'Terminé';
    case 'active':
      return 'Actif';
    case 'correcting':
      return 'Correction';
    case 'draft':
    default:
      return 'Brouillon';
  }
}
