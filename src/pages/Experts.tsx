import React, { useEffect, useState } from 'react';
import { ExpertCard } from '../components/ExpertCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useExpertStore } from '../stores/expertStore';
import { ExpertMode } from '../types';

interface ExpertsProps {
  onNavigate: (page: string) => void;
  onSelectExpert: (expert: ExpertMode | null) => void;
}

export const Experts: React.FC<ExpertsProps> = ({ onNavigate, onSelectExpert }) => {
  const { experts, selectedExpert, isLoading, error, loadExperts, createExpert, selectExpert, clearError } = useExpertStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
  });

  useEffect(() => {
    loadExperts();
  }, [loadExperts]);

  const presetExperts = experts.filter((e) => e.isPreset);
  const customExperts = experts.filter((e) => !e.isPreset);

  const handleCreateExpert = async (e: React.FormEvent) => {
    e.preventDefault();
    await createExpert(formData);
    setFormData({ name: '', description: '', systemPrompt: '' });
    setShowCreateForm(false);
  };

  const handleSelectExpert = (expert: ExpertMode) => {
    if (selectedExpert?.id === expert.id) {
      selectExpert(null);
      onSelectExpert(null);
    } else {
      selectExpert(expert);
      onSelectExpert(expert);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Chat
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Expert Modes</h1>
              <p className="text-gray-600 mt-1">Choose or create specialized AI assistants</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Expert
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Custom Expert</h2>
            <form onSubmit={handleCreateExpert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Code Reviewer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="A brief description of what this expert does"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Instructions that define the expert's behavior and capabilities..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Create Expert
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
            <button onClick={clearError} className="text-sm underline mt-1">
              Dismiss
            </button>
          </div>
        )}

        {isLoading && experts.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {presetExperts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Preset Experts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {presetExperts.map((expert) => (
                    <ExpertCard
                      key={expert.id}
                      expert={expert}
                      isSelected={selectedExpert?.id === expert.id}
                      onSelect={handleSelectExpert}
                    />
                  ))}
                </div>
              </div>
            )}

            {customExperts.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Experts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customExperts.map((expert) => (
                    <ExpertCard
                      key={expert.id}
                      expert={expert}
                      isSelected={selectedExpert?.id === expert.id}
                      onSelect={handleSelectExpert}
                    />
                  ))}
                </div>
              </div>
            )}

            {experts.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <span className="text-4xl">🤖</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No experts yet</h3>
                <p className="text-gray-600 mb-4">Create your first custom expert mode to get started</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Create Expert
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
