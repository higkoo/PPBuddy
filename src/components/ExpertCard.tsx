import React from 'react';
import { ExpertMode } from '../types';

interface ExpertCardProps {
  expert: ExpertMode;
  isSelected?: boolean;
  onSelect: (expert: ExpertMode) => void;
}

export const ExpertCard: React.FC<ExpertCardProps> = ({ expert, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(expert)}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-primary bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-primary hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
            isSelected ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          {expert.icon || '🤖'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{expert.name}</h3>
            {expert.isPreset && (
              <span className="px-2 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded-full">
                Preset
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{expert.description}</p>
        </div>
      </div>
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-primary/20">
          <p className="text-xs text-gray-600 mb-2">
            <strong>System Prompt:</strong>
          </p>
          <p className="text-xs text-gray-700 line-clamp-3 bg-white/50 rounded p-2">
            {expert.systemPrompt}
          </p>
        </div>
      )}
    </div>
  );
};
