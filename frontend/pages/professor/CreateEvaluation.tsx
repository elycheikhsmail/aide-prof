import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button, Input, Select, Card } from '../../components/ui';
import { ICEvaluationForm } from './evaluation-forms/ICEvaluationForm';
import { MathsEvaluationForm } from './evaluation-forms/MathsEvaluationForm';
import { AREvaluationForm } from './evaluation-forms/AREvaluationForm';
import { subjectsApi, type Subject } from '../../services/subjectsApi';
import { useClasses } from '../../contexts/ClassesContext';

export function CreateEvaluation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { classes } = useClasses();

  // Étape 1: Informations générales
  const [title, setTitle] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');

  // Données spécifiques à chaque matière
  const [evaluationData, setEvaluationData] = useState<any>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    subjectsApi.getAll().then(data => setSubjects(data.subjects)).catch(console.error);
  }, []);

  const steps = [
    { id: 1, label: 'Informations générales' },
    { id: 2, label: 'Contenu de l\'évaluation' },
    { id: 3, label: 'Aperçu et validation' },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const evaluation = {
      title,
      discipline,
      classId,
      date,
      duration,
      content: evaluationData,
    };
    console.log('Évaluation créée:', evaluation);
    navigate('/evaluations');
  };

  const canProceedStep1 = title && discipline && classId && date && duration;

  // Helper to determine which form to show based on subject code
  const getEvaluationForm = () => {
    // Map subject codes to specific forms if they exist
    // Note: In a real app, this mapping might be driven by subject metadata (e.g., subject.type)
    if (discipline === 'math' || discipline === 'maths') return <MathsEvaluationForm data={evaluationData} onChange={setEvaluationData} />;
    if (discipline === 'ic') return <ICEvaluationForm data={evaluationData} onChange={setEvaluationData} />;
    if (discipline === 'ar') return <AREvaluationForm data={evaluationData} onChange={setEvaluationData} />;

    // Fallback for other subjects - using Maths form as generic or just a placeholder message
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
        Formulaire générique non implémenté pour cette matière. Utilisation du format standard.
        <MathsEvaluationForm data={evaluationData} onChange={setEvaluationData} />
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate('/evaluations')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux évaluations
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Créer une évaluation</h1>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span
                  className={`ml-3 font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contenu des étapes */}
      <Card>
        <div className="p-6">
          {/* Étape 1: Informations générales */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations générales
              </h2>

              <Input
                label="Titre de l'évaluation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Évaluation de mi-trimestre"
                required
              />

              <Select
                label="Discipline"
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                options={[
                  { value: '', label: 'Sélectionnez une discipline' },
                  ...subjects.map(s => ({ value: s.code, label: s.label }))
                ]}
                required
              />

              <Select
                label="Classe"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                options={[
                  { value: '', label: 'Sélectionnez une classe' },
                  ...classes.map(c => ({ value: c.id, label: c.name }))
                ]}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date de l'évaluation"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />

                <Input
                  label="Durée (en minutes)"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Ex: 120"
                  required
                />
              </div>

              {discipline && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Format de l'évaluation :
                  </h3>
                  <p className="text-blue-700 text-sm">
                    {discipline === 'ic' && 'Suite de questions simples (Q1, Q2, Q3, ...)'}
                    {(discipline === 'math' || discipline === 'maths') &&
                      'Suite d\'exercices, chaque exercice contient plusieurs questions avec contexte optionnel'}
                    {discipline === 'ar' && 'Texte global suivi d\'une série de questions'}
                    {!['ic', 'math', 'maths', 'ar'].includes(discipline) && 'Format standard avec exercices et questions'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Étape 2: Contenu selon la discipline */}
          {currentStep === 2 && (
            <div>
              {getEvaluationForm()}
            </div>
          )}

          {/* Étape 3: Aperçu */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Aperçu de l'évaluation
              </h2>

              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div>
                  <span className="font-semibold text-gray-700">Titre: </span>
                  <span className="text-gray-900">{title}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Discipline: </span>
                  <span className="text-gray-900">{discipline?.toUpperCase()}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Date: </span>
                  <span className="text-gray-900">{date}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Durée: </span>
                  <span className="text-gray-900">{duration} minutes</span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Contenu:</h3>
                <pre className="bg-white p-4 rounded-lg border border-gray-200 overflow-auto">
                  {JSON.stringify(evaluationData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-200 p-6 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              disabled={currentStep === 1 && !canProceedStep1}
            >
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <Check className="w-4 h-4 mr-2" />
              Créer l'évaluation
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
