import { useState, useEffect } from 'react';
import { FileText, Users, ClipboardCheck, TrendingUp, Plus, Upload, Loader2 } from 'lucide-react';
import { Button, Card, Badge, Input, Select, StatCard, Modal } from '../../components/ui';
import { ImportEvaluationModal } from '../../components/professor/ImportEvaluationModal';
import { useEvaluations } from '../../contexts/EvaluationsContext';
// import { mockStatistics, mockNotifications } from '../../data/mockData';
import { dashboardApi, type DashboardStats, type Notification } from '../../services/dashboardApi';
import { subjectsApi, type Subject } from '../../services/subjectsApi';
import type { Evaluation } from '../../types';

export function ProfessorDashboard() {
  const { evaluations, addEvaluation, isLoading: isEvaluationsLoading, error: evaluationsError } = useEvaluations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
  });

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, notificationsData, subjectsData] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getNotifications(),
          subjectsApi.getAll()
        ]);
        setStats(statsData);
        setNotifications(notificationsData.notifications);
        setSubjects(subjectsData.subjects);
        if (subjectsData.subjects.length > 0) {
          setFormData(prev => ({ ...prev, subject: subjectsData.subjects[0].code }));
        }
      } catch (err) {
        console.error(err);
        setDataError('Erreur lors du chargement des données du tableau de bord');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Find subject label
    const subject = subjects.find(s => s.code === formData.subject);

    await addEvaluation({
      title: formData.title,
      subject: subject ? subject.label : formData.subject, // Fallback
      date: new Date().toISOString(),
      duration: 60, // Default duration
      totalPoints: 20, // Default total points
    });

    setIsModalOpen(false);
    setFormData({ title: '', subject: subjects[0]?.code || '' });

    // Refresh stats
    try {
      const newStats = await dashboardApi.getStats();
      setStats(newStats);
    } catch (e) {
      console.error('Failed to refresh stats', e);
    }
  };

  const handleImportEvaluation = async (evaluation: Evaluation) => {
    // Note: This might need adjustment depending on how import works with the backend
    // For now assuming we just create a new evaluation from the imported data
    await addEvaluation({
      title: evaluation.title,
      subject: evaluation.subject,
      date: evaluation.date,
      duration: evaluation.duration,
      totalPoints: evaluation.totalPoints,
    });
    setIsImportModalOpen(false);
  };

  if ((isEvaluationsLoading || isLoadingData) && evaluations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const error = evaluationsError || dataError;

  return (
    <>
      {/* Titre et boutons CTA */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 data-testid="dashboard-title" className="text-3xl font-bold text-gray-900">Tableau de bord</h2>
          <p data-testid="dashboard-subtitle" className="text-gray-600 mt-1">Vue d'ensemble de vos évaluations</p>
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

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* Cartes de statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            data-testid="stat-total-evaluations"
            title="Total Évaluations"
            value={stats.totalEvaluations}
            icon={FileText}
            trend={{ value: 8.5, isPositive: true }}
          />
          <StatCard
            data-testid="stat-classes-actives"
            title="Classes Actives"
            value={stats.activeClasses}
            icon={Users}
          />
          <StatCard
            data-testid="stat-copies-a-corriger"
            title="Copies à Corriger"
            value={stats.copiesToCorrect}
            icon={ClipboardCheck}
            trend={{ value: 12, isPositive: false }}
          />
          <StatCard
            data-testid="stat-taux-de-reussite"
            title="Taux de Réussite"
            value={`${stats.averageSuccessRate}%`}
            icon={TrendingUp}
            trend={{ value: 3.2, isPositive: true }}
          />
        </div>
      )}

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
                <th data-testid="column-header-title" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Titre
                </th>
                <th data-testid="column-header-subject" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Matière
                </th>
                <th data-testid="column-header-date" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th data-testid="column-header-status" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th data-testid="column-header-actions" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody data-testid="evaluations-table-body" className="divide-y divide-gray-200">
              {evaluations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Aucune évaluation trouvée
                  </td>
                </tr>
              ) : (
                evaluations.slice(0, 5).map((evaluation) => (
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
                        data-testid={`status-badge-${evaluation.status}`}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Notifications */}
      <Card
        header={
          <h3 data-testid="notifications-title" className="text-lg font-semibold text-gray-900">
            Notifications
          </h3>
        }
      >
        <div data-testid="notifications-list" className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm p-4 text-center">Aucune notification</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                data-testid={`notification-${notification.id}`}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
              >
                <div className={`w-2 h-2 mt-2 rounded-full ${notification.type === 'success'
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
            ))
          )}
        </div>
      </Card>

      {/* Modal de création d'évaluation */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Créer une nouvelle évaluation"
        footer={
          <>
            <Button data-testid="create-modal-cancel" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isEvaluationsLoading || isLoadingData}>
              Annuler
            </Button>
            <Button data-testid="create-modal-submit" variant="primary" onClick={handleSubmit} disabled={isEvaluationsLoading || isLoadingData}>
              {isEvaluationsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer'}
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
            disabled={isEvaluationsLoading || isLoadingData}
          />
          <Select
            data-testid="evaluation-subject-select"
            label="Matière"
            options={subjects.map(s => ({ value: s.code, label: s.label }))}
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            disabled={isEvaluationsLoading || isLoadingData}
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
