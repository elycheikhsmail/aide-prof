import { useState } from 'react';
import { Plus, Users, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button, Card, Input, Modal, Select } from '../../components/ui';
import { useClasses } from '../../contexts/ClassesContext';
import type { Class } from '../../types';

export function Classes() {
  const { classes, addClass, updateClass, removeClass, isLoading, error } = useClasses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: 'math',
  });

  const handleOpenModal = (cls?: Class) => {
    if (cls) {
      setEditingClass(cls);
      setFormData({
        name: cls.name,
        subject: cls.subject,
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: '',
        subject: 'math',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClass) {
      await updateClass(editingClass.id, formData);
    } else {
      await addClass(formData);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
      await removeClass(id);
    }
  };

  if (isLoading && classes.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-900">Mes classes</h2>
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleOpenModal()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle classe
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {classes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Aucune classe pour le moment</p>
            <p className="text-gray-500 text-sm mt-2">Cliquez sur "Nouvelle classe" pour commencer</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <Card key={cls.id} className="hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(cls)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cls.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {cls.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {cls.subject === 'math' ? 'Mathématiques' : 
                     cls.subject === 'physics' ? 'Physique' : 
                     cls.subject === 'chemistry' ? 'Chimie' : cls.subject}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-1">{cls.studentCount}</span>
                    étudiants inscrits
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? "Modifier la classe" : "Nouvelle classe"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingClass ? 'Modifier' : 'Créer')}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Nom de la classe"
            placeholder="Ex: Terminale S2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isLoading}
          />
          <Select
            label="Matière"
            options={[
              { value: 'math', label: 'Mathématiques' },
              { value: 'physics', label: 'Physique' },
              { value: 'chemistry', label: 'Chimie' },
            ]}
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            disabled={isLoading}
          />
        </form>
      </Modal>
    </>
  );
}
