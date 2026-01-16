import { useState, useEffect } from 'react';
import type { Evaluation } from '../../types';
import { Modal, Button, Input, Select } from '../ui';

export interface EditEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: Evaluation | null;
  onUpdate: (id: string, updates: Partial<Evaluation>) => Promise<void>;
}

export function EditEvaluationModal({
  isOpen,
  onClose,
  evaluation,
  onUpdate,
}: EditEvaluationModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    date: '',
    duration: 0,
    totalPoints: 0,
    status: 'draft' as 'draft' | 'active' | 'correcting' | 'completed',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialiser le formulaire quand l'évaluation change
  useEffect(() => {
    if (evaluation) {
      setFormData({
        title: evaluation.title,
        subject: evaluation.subject,
        date: evaluation.date,
        duration: evaluation.duration,
        totalPoints: evaluation.totalPoints,
        status: evaluation.status,
      });
      setError(null);
    }
  }, [evaluation]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluation) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onUpdate(evaluation.id, formData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!evaluation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Modifier l'évaluation"
      footer={
        <div className="flex justify-end space-x-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            data-testid="edit-modal-cancel"
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            data-testid="edit-modal-save"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Titre"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Ex: Évaluation Maths Trimestre 1"
          required
          data-testid="edit-evaluation-title"
        />

        <Input
          label="Matière"
          type="text"
          value={formData.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          placeholder="Ex: Mathématiques"
          required
          data-testid="edit-evaluation-subject"
        />

        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          required
          data-testid="edit-evaluation-date"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Durée (minutes)"
            type="number"
            value={formData.duration}
            onChange={(e) => handleChange('duration', Number(e.target.value))}
            min={1}
            required
            data-testid="edit-evaluation-duration"
          />

          <Input
            label="Total points"
            type="number"
            value={formData.totalPoints}
            onChange={(e) => handleChange('totalPoints', Number(e.target.value))}
            min={1}
            required
            data-testid="edit-evaluation-points"
          />
        </div>

        <Select
          label="Statut"
          value={formData.status}
          onChange={(e) =>
            handleChange(
              'status',
              e.target.value as 'draft' | 'active' | 'correcting' | 'completed'
            )
          }
          options={[
            { value: 'draft', label: 'Brouillon' },
            { value: 'active', label: 'Actif' },
            { value: 'correcting', label: 'Correction' },
            { value: 'completed', label: 'Terminé' },
          ]}
          data-testid="edit-evaluation-status"
        />

        <div className="bg-gray-50 px-4 py-3 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Note :</strong> Les questions ne peuvent pas être modifiées ici.
            L'évaluation contient actuellement {evaluation.questions.length} question
            {evaluation.questions.length > 1 ? 's' : ''}.
          </p>
        </div>
      </form>
    </Modal>
  );
}
