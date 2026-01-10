import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button, Input, Textarea } from '../../../components/ui';

interface Question {
  id: string;
  text: string;
  points: number;
}

interface AREvaluationFormProps {
  data: { globalText: string; questions: Question[] } | null;
  onChange: (data: { globalText: string; questions: Question[] }) => void;
}

export function AREvaluationForm({ data, onChange }: AREvaluationFormProps) {
  const [globalText, setGlobalText] = useState(data?.globalText || '');
  const [questions, setQuestions] = useState<Question[]>(data?.questions || []);
  const [currentText, setCurrentText] = useState('');
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    onChange({ globalText, questions });
  }, [globalText, questions, onChange]);

  const addOrUpdateQuestion = () => {
    if (!currentText.trim() || currentPoints <= 0) {
      alert('Veuillez remplir tous les champs correctement');
      return;
    }

    if (editingId) {
      // Mode édition
      setQuestions(
        questions.map((q) =>
          q.id === editingId ? { ...q, text: currentText, points: currentPoints } : q
        )
      );
      setEditingId(null);
    } else {
      // Mode ajout
      const newQuestion: Question = {
        id: String(Date.now()),
        text: currentText,
        points: currentPoints,
      };
      setQuestions([...questions, newQuestion]);
    }

    // Vider le formulaire
    setCurrentText('');
    setCurrentPoints(0);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setCurrentText('');
      setCurrentPoints(0);
    }
  };

  const editQuestion = (question: Question) => {
    setEditingId(question.id);
    setCurrentText(question.text);
    setCurrentPoints(question.points);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCurrentText('');
    setCurrentPoints(0);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Évaluation d'Arabe
      </h2>

      {/* Texte global */}
      <div className="border border-gray-300 rounded-lg p-6 bg-white">
        <h3 className="font-semibold text-gray-900 mb-4">Texte de l'évaluation</h3>
        <Textarea
          label="Texte global"
          value={globalText}
          onChange={(e) => setGlobalText(e.target.value)}
          placeholder="Saisissez le texte en arabe sur lequel portera l'évaluation..."
          rows={10}
          required
          className="text-right"
          dir="rtl"
        />
        <p className="mt-2 text-sm text-gray-600">
          Ce texte sera présenté aux élèves avant les questions.
        </p>
      </div>

      {/* Formulaire d'ajout/édition de question */}
      <div className="border border-gray-300 rounded-lg p-6 bg-white">
        <h3 className="font-semibold text-gray-900 mb-4">
          {editingId ? 'Modifier la question' : 'Nouvelle question'}
        </h3>
        <div className="space-y-4">
          <Textarea
            label="Énoncé de la question"
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            placeholder="Saisissez la question en arabe..."
            rows={3}
            className="text-right"
            dir="rtl"
          />

          <Input
            label="Points"
            type="number"
            value={currentPoints}
            onChange={(e) => setCurrentPoints(Number(e.target.value))}
            placeholder="Ex: 4"
            min="0"
          />
        </div>

        <div className="mt-4 flex gap-3">
          <Button onClick={addOrUpdateQuestion}>
            <Plus className="w-4 h-4 mr-2" />
            {editingId ? 'Mettre à jour la question' : 'Ajouter la question'}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={cancelEdit}>
              Annuler
            </Button>
          )}
        </div>
      </div>

      {/* Liste des questions ajoutées */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">
            Questions ajoutées ({questions.length})
          </h3>
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      Question {index + 1}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                      {question.points} pts
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap text-right" dir="rtl">
                    {question.text}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => editQuestion(question)}
                    className="text-blue-600 hover:text-blue-700"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeQuestion(question.id)}
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

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-blue-900">Total des points:</span>
          <span className="text-2xl font-bold text-blue-600">
            {questions.reduce((sum, q) => sum + q.points, 0)} points
          </span>
        </div>
      </div>
    </div>
  );
}
