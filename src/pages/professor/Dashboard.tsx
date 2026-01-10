import { useState } from 'react';
import { FileText, Users, ClipboardCheck, TrendingUp, Plus, Upload } from 'lucide-react';
import { Button, Card, Badge, Input, Select, StatCard, Modal } from '../../components/ui';
import { ImportEvaluationModal } from '../../components/professor/ImportEvaluationModal';
import { useEvaluations } from '../../contexts/EvaluationsContext';
import { mockStatistics, mockNotifications } from '../../data/mockData';
import type { Evaluation } from '../../types';

export function ProfessorDashboard() {
  const { evaluations, addEvaluation } = useEvaluations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: 'math',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsModalOpen(false);
  };

  const handleImportEvaluation = (evaluation: Evaluation) => {
    addEvaluation(evaluation);
    setIsImportModalOpen(false);
  };

  return (
    <>
      {/* Titre et boutons CTA */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tableau de bord</h2>
          <p className="text-gray-600 mt-1">Vue d'ensemble de vos évaluations</p>
        </div>
        <div className="flex space-x-3">
          <Button
            data-testid="import-evaluation-button"
            variant="outline"
            size="lg"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Upload className="w-5 h-5 mr-2" />
            Importer JSON
          </Button>
          <Button
            data-testid="create-evaluation-button"
            variant="primary"
            size="lg"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Créer une évaluation
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          data-testid="stat-total-evaluations"
          title="Total Évaluations"
          value={mockStatistics.totalEvaluations}
          icon={FileText}
          trend={{ value: 8.5, isPositive: true }}
        />
        <StatCard
          data-testid="stat-classes-actives"
          title="Classes Actives"
          value={mockStatistics.activeClasses}
          icon={Users}
        />
        <StatCard
          data-testid="stat-copies-a-corriger"
          title="Copies à Corriger"
          value={mockStatistics.copiesToCorrect}
          icon={ClipboardCheck}
          trend={{ value: 12, isPositive: false }}
        />
        <StatCard
          data-testid="stat-taux-de-reussite"
          title="Taux de Réussite"
          value={`${mockStatistics.averageSuccessRate}%`}
          icon={TrendingUp}
          trend={{ value: 3.2, isPositive: true }}
        />
      </div>

      {/* Évaluations récentes */}
      <Card
        header={
          <h3 className="text-lg font-semibold text-gray-900">
            Évaluations Récentes
          </h3>
        }
        className="mb-8"
      >
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
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody data-testid="evaluations-table-body" className="divide-y divide-gray-200">
              {evaluations.slice(0, 5).map((evaluation) => (
                <tr key={evaluation.id} data-testid={`evaluation-row-${evaluation.id}`} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {evaluation.title}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {evaluation.subject}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {new Date(evaluation.date).toLocaleDateString('fr-FR')}
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
                    <Button variant="ghost" size="sm">
                      Voir détails
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Notifications */}
      <Card
        header={
          <h3 className="text-lg font-semibold text-gray-900">
            Notifications
          </h3>
        }
      >
        <div data-testid="notifications-list" className="space-y-4">
          {mockNotifications.map((notification) => (
            <div
              key={notification.id}
              data-testid={`notification-${notification.id}`}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
            >
              <div className={`w-2 h-2 mt-2 rounded-full ${
                notification.type === 'success'
                  ? 'bg-green-500'
                  : notification.type === 'warning'
                  ? 'bg-orange-500'
                  : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal de création d'évaluation */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Créer une nouvelle évaluation"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Créer
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            data-testid="evaluation-title-input"
            label="Titre de l'évaluation"
            placeholder="Ex: Contrôle Mathématiques"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Select
            data-testid="evaluation-subject-select"
            label="Matière"
            options={[
              { value: 'math', label: 'Mathématiques' },
              { value: 'physics', label: 'Physique' },
              { value: 'chemistry', label: 'Chimie' },
            ]}
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
        </form>
      </Modal>

      {/* Modal d'import d'évaluation depuis JSON */}
      <ImportEvaluationModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportEvaluation}
      />
    </>
  );
}
