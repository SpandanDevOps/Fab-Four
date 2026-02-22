/**
 * EvidenceScreen Component
 * Upload evidence files for the report
 */

import { useRef } from 'react';
import { motion } from 'motion/react';
import { Camera, Upload, FileText, X, Plus, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { EvidenceFile } from '../types/index.js';
import Header from '../components/Header.js';

interface EvidenceScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
  evidence: EvidenceFile[];
  onFileUpload: (files: FileList) => void;
  onRemoveEvidence: (id: string) => void;
  isUploading: boolean;
}

export default function EvidenceScreen({
  onNavigate,
  onBack,
  evidence,
  onFileUpload,
  onRemoveEvidence,
  isUploading,
}: EvidenceScreenProps) {
  const { t } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:bg-background-dark">
      <Header title={t('evidence.title')} showBack onBack={onBack} />

      <main className="px-4 pt-6 pb-8">
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          {t('evidence.subtitle')}
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          className="hidden"
        />

        <div className="space-y-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <h4 className="font-medium">{t('evidence.takePhoto')}</h4>
              <p className="text-sm text-gray-500">{t('evidence.takePhotoDesc')}</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <h4 className="font-medium">{t('evidence.uploadGallery')}</h4>
              <p className="text-sm text-gray-500">{t('evidence.uploadGalleryDesc')}</p>
            </div>
          </motion.button>
        </div>

        {evidence.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-3">Uploaded Evidence ({evidence.length})</h4>
            <div className="grid grid-cols-3 gap-2">
              {evidence.map((file) => (
                <div
                  key={file.id}
                  className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
                >
                  {file.mimetype.startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <button
                    onClick={() => onRemoveEvidence(file.id)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-primary transition-colors"
              >
                <Plus className="w-8 h-8 text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="flex items-center justify-center gap-2 py-4 text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t('evidence.uploading')}</span>
          </div>
        )}

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('ANALYSIS')}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold"
          >
            {t('evidence.continue')}
          </motion.button>

          <button
            onClick={() => onNavigate('ANALYSIS')}
            className="w-full py-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {t('evidence.skip')}
          </button>
        </div>
      </main>
    </div>
  );
}
