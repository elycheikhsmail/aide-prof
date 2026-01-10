import { useState } from 'react';
import type { Evaluation } from '../../types';
import { Modal, Button, FileUpload, Textarea } from '../ui';
import { EvaluationPreview } from './EvaluationPreview';
import { validateEvaluationJSON, normalizeEvaluationData } from '../../utils/evaluationValidator';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export interface ImportEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (evaluation: Evaluation) => void;
}

type ImportMethod = 'file' | 'paste' | null;
type Step = 1 | 2 | 3;

export function ImportEvaluationModal({ isOpen, onClose, onImport }: ImportEvaluationModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [importMethod, setImportMethod] = useState<ImportMethod>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateEvaluationJSON> | null>(null);

  const handleClose = () => {
    // Réinitialiser l'état
    setStep(1);
    setImportMethod(null);
    setJsonInput('');
    setValidationResult(null);
    onClose();
  };

  const handleMethodSelect = (method: ImportMethod) => {
    setImportMethod(method);
  };

  const handleFileSelect = (content: string, _filename: string) => {
    setJsonInput(content);
  };

  const handleTextareaChange = (value: string) => {
    setJsonInput(value);
  };

  const handleNext = () => {
    // Valider le JSON
    const result = validateEvaluationJSON(jsonInput);
    setValidationResult(result);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setValidationResult(null);
    }
  };

  const handleConfirm = () => {
    if (validationResult && validationResult.isValid) {
      const normalizedData = normalizeEvaluationData(validationResult.data);
      setStep(3);
      // Simuler un petit délai pour montrer le message de succès
      setTimeout(() => {
        onImport(normalizedData);
        handleClose();
      }, 1500);
    }
  };

  const canProceed = jsonInput.trim().length > 0;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Choix de la méthode */}
            {!importMethod && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Choisissez comment vous souhaitez importer votre évaluation :
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleMethodSelect('file')}
                    className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    data-testid="import-method-file"
                  >
                    <Upload className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900">
                      Upload fichier .json
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMethodSelect('paste')}
                    className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    data-testid="import-method-paste"
                  >
                    <FileText className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900">Coller JSON</p>
                  </button>
                </div>
              </div>
            )}

            {/* Upload de fichier */}
            {importMethod === 'file' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Upload de fichier</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setImportMethod(null);
                      setJsonInput('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                    data-testid="change-import-method"
                  >
                    Changer de méthode
                  </button>
                </div>
                <FileUpload
                  accept=".json"
                  onFileSelect={handleFileSelect}
                  label="Fichier JSON"
                />
              </div>
            )}

            {/* Textarea pour coller le JSON */}
            {importMethod === 'paste' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Coller le JSON</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setImportMethod(null);
                      setJsonInput('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                    data-testid="change-import-method"
                  >
                    Changer de méthode
                  </button>
                </div>
                <Textarea
                  label="Contenu JSON"
                  placeholder='{"title": "Mon Évaluation", ...}'
                  value={jsonInput}
                  onChange={(e) => handleTextareaChange(e.target.value)}
                  rows={12}
                  data-testid="json-textarea"
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {validationResult && (
              <EvaluationPreview
                evaluation={validationResult.data}
                errors={validationResult.errors}
                warnings={validationResult.warnings}
              />
            )}
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h4 className="text-xl font-semibold text-gray-900">Évaluation importée !</h4>
            <p className="text-sm text-gray-600 text-center">
              L'évaluation a été créée avec succès et ajoutée à votre liste.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const renderFooter = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={handleClose} data-testid="import-modal-cancel">
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed}
              data-testid="import-modal-next"
            >
              Suivant
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="flex justify-between">
            <Button variant="ghost" onClick={handleBack} data-testid="import-modal-back">
              Retour
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={!validationResult?.isValid}
              data-testid="import-modal-confirm"
            >
              Confirmer
            </Button>
          </div>
        );

      case 3:
        return null; // Pas de boutons, le modal se ferme automatiquement

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (step) {
      case 1:
        return 'Importer une évaluation';
      case 2:
        return 'Validation de l\'évaluation';
      case 3:
        return 'Succès';
      default:
        return 'Importer une évaluation';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getTitle()}
      footer={renderFooter()}
    >
      {renderStepContent()}
    </Modal>
  );
}
