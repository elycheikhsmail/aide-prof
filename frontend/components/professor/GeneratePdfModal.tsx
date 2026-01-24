import { useState } from 'react';
import { Modal, Button } from '../ui';
import type { Evaluation } from '../../types';

interface GeneratePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: Evaluation | null;
  onGenerate: (options: PdfGenerationOptions) => void;
  isLoading?: boolean;
}

export interface PdfGenerationOptions {
  combinedSheet: boolean; // Questions + espaces de réponse sur la même feuille
  separateSheets: boolean; // Questions et réponses sur des feuilles séparées
}

export function GeneratePdfModal({
  isOpen,
  onClose,
  evaluation,
  onGenerate,
  isLoading = false,
}: GeneratePdfModalProps) {
  const [options, setOptions] = useState<PdfGenerationOptions>({
    combinedSheet: false,
    separateSheets: false,
  });

  const handleCheckboxChange = (option: keyof PdfGenerationOptions) => {
    setOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleGenerate = () => {
    if (isLoading) return;
    if (!options.combinedSheet && !options.separateSheets) {
      alert('Veuillez sélectionner au moins une option');
      return;
    }
    onGenerate(options);
    // Réinitialiser les options après génération
    setOptions({
      combinedSheet: false,
      separateSheets: false,
    });
  };

  const isGenerateDisabled = !options.combinedSheet && !options.separateSheets;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Générer les feuilles de réponse"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={isGenerateDisabled || isLoading}
          >
            {isLoading ? 'Génération...' : 'Générer'}
          </Button>
        </>
      }
    >
      {evaluation && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{evaluation.title}</h4>
            <p className="text-sm text-gray-600">
              {evaluation.questions.length} question{evaluation.questions.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">
              Choisissez le format de génération :
            </p>

            <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={options.combinedSheet}
                onChange={() => handleCheckboxChange('combinedSheet')}
                disabled={isLoading}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Feuille unique (questions + réponses)
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Génère une seule feuille contenant les questions avec un espace suffisant
                  pour répondre sous chaque question
                </div>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={options.separateSheets}
                onChange={() => handleCheckboxChange('separateSheets')}
                disabled={isLoading}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Feuilles séparées (questions / réponses)
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Génère deux feuilles : une avec uniquement les questions, et une autre
                  avec les numéros de questions et des espaces pour répondre
                </div>
              </div>
            </label>
          </div>

          {!isGenerateDisabled && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                {options.combinedSheet && options.separateSheets
                  ? '3 fichiers PDF seront générés et téléchargés'
                  : options.combinedSheet
                  ? '1 fichier PDF sera généré et téléchargé'
                  : '2 fichiers PDF seront générés et téléchargés'}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
