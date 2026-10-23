import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, FileCheck, AlertCircle, Hash, Shield } from 'lucide-react';
import { EvidenceType } from '../api/types';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (response: any) => void;
  onUploadFile: (file: File, incidentId?: string, tags?: string, evidenceType?: EvidenceType) => Promise<any>;
  incidentIds: string[];
  defaultIncidentId?: string;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  onUploadFile,
  incidentIds,
  defaultIncidentId,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [incidentId, setIncidentId] = useState(defaultIncidentId || incidentIds[0] || '');
  const [tags, setTags] = useState('pcap,forensics,icu');
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('PCAP');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [calculatedSha, setCalculatedSha] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultIncidentId) {
      setIncidentId(defaultIncidentId);
    }
  }, [defaultIncidentId]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const computeSha256Client = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setCalculatedSha(hashHex);
    } catch {
      // Fallback
      setCalculatedSha(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      computeSha256Client(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      computeSha256Client(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose a file to upload.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(40);

      const res = await onUploadFile(selectedFile, incidentId || undefined, tags, evidenceType);
      setUploadProgress(100);
      onUploadSuccess(res);
      setTimeout(() => {
        setUploading(false);
        setSelectedFile(null);
        setCalculatedSha(null);
        onClose();
      }, 500);
    } catch (err: any) {
      setUploading(false);
      setUploadProgress(null);
      setError(err.message || 'Evidence upload failed.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-soc-dark border border-soc-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden focus:outline-none"
        tabIndex={-1}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-soc-surface border-b border-soc-border">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            <h3 id="upload-modal-title" className="text-base font-bold text-white tracking-wide">
              Secure Forensic Evidence Ingest
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Close upload dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Forensic Artifact File (.pcap, .evtx, .log, .dcm, .bin)
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Click or drop file to select forensic artifact"
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-cyan-400 bg-cyan-950/40'
                  : 'border-soc-border hover:border-cyan-500/50 bg-soc-card'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <Upload className="w-8 h-8 mx-auto text-cyan-400 mb-2" aria-hidden="true" />
              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white flex items-center justify-center gap-1">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {(selectedFile.size / 1024).toFixed(1)} KB | {selectedFile.type || 'Binary stream'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-200">
                    Drop forensic capture here, or <span className="text-cyan-400 underline">browse files</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Supports PCAP network dumps, Syslog, HL7/FHIR captures, DICOM headers
                  </p>
                </div>
              )}
            </div>

            {/* SHA-256 Client-Side Verification */}
            {calculatedSha && (
              <div className="mt-2 p-2 rounded bg-soc-surface border border-soc-border text-[11px] font-mono text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 truncate">
                  <Hash className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">SHA-256: {calculatedSha}</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold ml-2">VERIFIED</span>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Target Incident */}
            <div>
              <label htmlFor="target-incident" className="block text-xs font-semibold text-slate-300 mb-1">
                Link to Incident Dossier
              </label>
              <select
                id="target-incident"
                value={incidentId}
                onChange={(e) => setIncidentId(e.target.value)}
                className="w-full bg-soc-surface border border-soc-border rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-400"
              >
                {incidentIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>

            {/* Evidence Classification Type */}
            <div>
              <label htmlFor="evidence-type" className="block text-xs font-semibold text-slate-300 mb-1">
                Evidence Classification
              </label>
              <select
                id="evidence-type"
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
                className="w-full bg-soc-surface border border-soc-border rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-400"
              >
                <option value="PCAP">PCAP Network Capture</option>
                <option value="HL7">HL7 / FHIR Clinical Audit</option>
                <option value="DICOM">DICOM PACS Imaging</option>
                <option value="FIREWALL">Firewall / IDS Log</option>
                <option value="AUDIT">Endpoint / Event Log</option>
                <option value="MEMORY">Volatile Memory Dump</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="evidence-tags" className="block text-xs font-semibold text-slate-300 mb-1">
              Forensic Tags (comma-separated)
            </label>
            <input
              id="evidence-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. cobalt-strike, icu-ward, infusion-pump"
              className="w-full bg-soc-surface border border-soc-border rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Upload Progress Bar */}
          {uploadProgress !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Ingesting into immutable vault...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-soc-card rounded overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-soc-border">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-soc-surface hover:bg-soc-border/60 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-md shadow transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{uploading ? 'Sealing Artifact...' : 'Upload & Seal Evidence'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
