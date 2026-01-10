import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Upload, FileText, X } from 'lucide-react';

export interface FileUploadProps {
  accept?: string;
  onFileSelect: (content: string, filename: string) => void;
  error?: string;
  label?: string;
}

export function FileUpload({ accept = '.json', onFileSelect, error, label }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Vérifier l'extension du fichier
    const acceptedExtensions = accept.split(',').map((ext) => ext.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!acceptedExtensions.includes(fileExtension)) {
      return;
    }

    // Lire le contenu du fichier
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSelectedFile(file.name);
      onFileSelect(content, file.name);
    };
    reader.onerror = () => {
      console.error('Erreur lors de la lecture du fichier');
    };
    reader.readAsText(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="file-upload-dropzone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          data-testid="file-upload-input"
        />

        {!selectedFile ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="w-12 h-12 text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Glissez-déposez votre fichier ici, ou
              </p>
              <button
                type="button"
                onClick={handleClick}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                data-testid="file-upload-button"
              >
                Sélectionner un fichier
              </button>
            </div>
            <p className="text-xs text-gray-500">Formats acceptés : {accept}</p>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-3" data-testid="file-upload-selected">
            <FileText className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">{selectedFile}</span>
            <button
              type="button"
              onClick={handleClearFile}
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Supprimer le fichier"
              data-testid="file-upload-clear"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600" data-testid="file-upload-error">
          {error}
        </p>
      )}
    </div>
  );
}
