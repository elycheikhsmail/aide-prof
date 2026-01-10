import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button, Input, Textarea } from '../../../components/ui';

interface Question {
  id: string;
  context?: string;
  text: string;
  points: number;
}

interface Exercise {
  id: string;
  title: string;
  questions: Question[];
}

interface MathsEvaluationFormProps {
  data: { exercises: Exercise[] } | null;
  onChange: (data: { exercises: Exercise[] }) => void;
}

export function MathsEvaluationForm({ data, onChange }: MathsEvaluationFormProps) {
  const [exercises, setExercises] = useState<Exercise[]>(data?.exercises || []);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());

  // État pour le formulaire d'exercice
  const [currentExerciseTitle, setCurrentExerciseTitle] = useState('');
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  // État pour le formulaire de question (par exercice)
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [currentQuestionContext, setCurrentQuestionContext] = useState('');
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [currentQuestionPoints, setCurrentQuestionPoints] = useState<number>(0);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    onChange({ exercises });
  }, [exercises, onChange]);

  const toggleExercise = (id: string) => {
    const newExpanded = new Set(expandedExercises);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedExercises(newExpanded);
  };

  // Gestion des exercices
  const addOrUpdateExercise = () => {
    if (!currentExerciseTitle.trim()) {
      alert('Veuillez saisir un titre pour l\'exercice');
      return;
    }

    if (editingExerciseId) {
      // Mode édition
      setExercises(
        exercises.map((ex) =>
          ex.id === editingExerciseId ? { ...ex, title: currentExerciseTitle } : ex
        )
      );
      setEditingExerciseId(null);
    } else {
      // Mode ajout
      const newExercise: Exercise = {
        id: String(Date.now()),
        title: currentExerciseTitle,
        questions: [],
      };
      setExercises([...exercises, newExercise]);
      setExpandedExercises(new Set([...expandedExercises, newExercise.id]));
      setActiveExerciseId(newExercise.id);
    }

    setCurrentExerciseTitle('');
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
    if (editingExerciseId === id) {
      setEditingExerciseId(null);
      setCurrentExerciseTitle('');
    }
    if (activeExerciseId === id) {
      setActiveExerciseId(null);
    }
  };

  const editExercise = (exercise: Exercise) => {
    setEditingExerciseId(exercise.id);
    setCurrentExerciseTitle(exercise.title);
  };

  const cancelEditExercise = () => {
    setEditingExerciseId(null);
    setCurrentExerciseTitle('');
  };

  // Gestion des questions
  const addOrUpdateQuestion = () => {
    if (!activeExerciseId) return;

    if (!currentQuestionText.trim() || currentQuestionPoints <= 0) {
      alert('Veuillez remplir tous les champs correctement');
      return;
    }

    setExercises(
      exercises.map((ex) => {
        if (ex.id === activeExerciseId) {
          if (editingQuestionId) {
            // Mode édition
            return {
              ...ex,
              questions: ex.questions.map((q) =>
                q.id === editingQuestionId
                  ? {
                      ...q,
                      context: currentQuestionContext,
                      text: currentQuestionText,
                      points: currentQuestionPoints,
                    }
                  : q
              ),
            };
          } else {
            // Mode ajout
            const newQuestion: Question = {
              id: `${activeExerciseId}-${Date.now()}`,
              context: currentQuestionContext,
              text: currentQuestionText,
              points: currentQuestionPoints,
            };
            return {
              ...ex,
              questions: [...ex.questions, newQuestion],
            };
          }
        }
        return ex;
      })
    );

    // Vider le formulaire
    setCurrentQuestionContext('');
    setCurrentQuestionText('');
    setCurrentQuestionPoints(0);
    setEditingQuestionId(null);
  };

  const removeQuestion = (exerciseId: string, questionId: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            questions: ex.questions.filter((q) => q.id !== questionId),
          };
        }
        return ex;
      })
    );
    if (editingQuestionId === questionId) {
      setEditingQuestionId(null);
      setCurrentQuestionContext('');
      setCurrentQuestionText('');
      setCurrentQuestionPoints(0);
    }
  };

  const editQuestion = (exerciseId: string, question: Question) => {
    setActiveExerciseId(exerciseId);
    setEditingQuestionId(question.id);
    setCurrentQuestionContext(question.context || '');
    setCurrentQuestionText(question.text);
    setCurrentQuestionPoints(question.points);
  };

  const cancelEditQuestion = () => {
    setEditingQuestionId(null);
    setCurrentQuestionContext('');
    setCurrentQuestionText('');
    setCurrentQuestionPoints(0);
  };

  const getTotalPoints = () => {
    return exercises.reduce(
      (total, ex) => total + ex.questions.reduce((sum, q) => sum + q.points, 0),
      0
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Exercices de l'évaluation (Mathématiques)
      </h2>

      {/* Formulaire d'ajout/édition d'exercice */}
      <div className="border border-gray-300 rounded-lg p-6 bg-white">
        <h3 className="font-semibold text-gray-900 mb-4">
          {editingExerciseId ? 'Modifier l\'exercice' : 'Nouvel exercice'}
        </h3>
        <div className="space-y-4">
          <Input
            label="Titre de l'exercice"
            value={currentExerciseTitle}
            onChange={(e) => setCurrentExerciseTitle(e.target.value)}
            placeholder="Ex: Étude de fonction"
          />
        </div>

        <div className="mt-4 flex gap-3">
          <Button onClick={addOrUpdateExercise}>
            <Plus className="w-4 h-4 mr-2" />
            {editingExerciseId ? 'Mettre à jour l\'exercice' : 'Ajouter l\'exercice'}
          </Button>
          {editingExerciseId && (
            <Button variant="outline" onClick={cancelEditExercise}>
              Annuler
            </Button>
          )}
        </div>
      </div>

      {/* Liste des exercices */}
      {exercises.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">
            Exercices ajoutés ({exercises.length})
          </h3>
          {exercises.map((exercise, exIndex) => (
            <div
              key={exercise.id}
              className="border border-gray-300 rounded-lg bg-white"
            >
              {/* En-tête de l'exercice */}
              <div className="p-4 bg-gray-100 border-b border-gray-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleExercise(exercise.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {expandedExercises.has(exercise.id) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">
                          Exercice {exIndex + 1}: {exercise.title}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                          {exercise.questions.length} question(s)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editExercise(exercise)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeExercise(exercise.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenu de l'exercice (questions) */}
              {expandedExercises.has(exercise.id) && (
                <div className="p-4 space-y-4">
                  {/* Formulaire d'ajout de question pour cet exercice */}
                  {activeExerciseId === exercise.id && (
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        {editingQuestionId ? 'Modifier la question' : 'Nouvelle question'}
                      </h4>
                      <div className="space-y-4">
                        <Textarea
                          label="Contexte (optionnel)"
                          value={currentQuestionContext}
                          onChange={(e) => setCurrentQuestionContext(e.target.value)}
                          placeholder="Contexte ou données de la question..."
                          rows={2}
                        />

                        <Textarea
                          label="Énoncé de la question"
                          value={currentQuestionText}
                          onChange={(e) => setCurrentQuestionText(e.target.value)}
                          placeholder="Saisissez l'énoncé de la question..."
                          rows={3}
                        />

                        <Input
                          label="Points"
                          type="number"
                          value={currentQuestionPoints}
                          onChange={(e) => setCurrentQuestionPoints(Number(e.target.value))}
                          placeholder="Ex: 3"
                          min="0"
                        />
                      </div>

                      <div className="mt-4 flex gap-3">
                        <Button onClick={addOrUpdateQuestion} size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          {editingQuestionId ? 'Mettre à jour' : 'Ajouter'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveExerciseId(null);
                            cancelEditQuestion();
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Bouton pour activer le formulaire de question */}
                  {activeExerciseId !== exercise.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveExerciseId(exercise.id)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une question
                    </Button>
                  )}

                  {/* Liste des questions */}
                  {exercise.questions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Questions:</h4>
                      {exercise.questions.map((question, qIndex) => (
                        <div
                          key={question.id}
                          className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900">
                                  Q{qIndex + 1}
                                </span>
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  {question.points} pts
                                </span>
                              </div>
                              {question.context && (
                                <p className="text-gray-600 text-sm italic mb-1">
                                  {question.context}
                                </p>
                              )}
                              <p className="text-gray-700 whitespace-pre-wrap">
                                {question.text}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => editQuestion(exercise.id, question)}
                                className="text-blue-600 hover:text-blue-700"
                                title="Modifier"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeQuestion(exercise.id, question.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Total des points */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-blue-900">Total des points:</span>
          <span className="text-2xl font-bold text-blue-600">
            {getTotalPoints()} points
          </span>
        </div>
      </div>
    </div>
  );
}
