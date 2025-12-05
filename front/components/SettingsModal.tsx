import React, { useState } from 'react';
import { Button } from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSave: (url: string) => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, currentUrl, onSave }) => {
  const [url, setUrl] = useState(currentUrl);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Configuration</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            n8n Webhook URL
          </label>
          <p className="text-xs text-slate-500 mb-2">
            The full transcript will be sent here when you finish the chat.
          </p>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-n8n-instance.com/webhook/..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(url); onClose(); }}>Save Configuration</Button>
        </div>
      </div>
    </div>
  );
};