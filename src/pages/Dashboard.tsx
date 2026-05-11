import React, { useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInput } from '../components/ChatInput';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useChatStore } from '../stores/chatStore';
import { useExpertStore } from '../stores/expertStore';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isStreaming,
    error,
    loadConversations,
    setCurrentConversation,
    createConversation,
    deleteConversation,
    sendMessage,
    clearError,
  } = useChatStore();

  const { selectedExpert } = useExpertStore();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleNewConversation = async () => {
    const conversation = await createConversation(undefined, selectedExpert?.id);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const handleSelectConversation = (conversation: typeof currentConversation) => {
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!currentConversation) {
      const conversation = await createConversation(
        message.slice(0, 50),
        selectedExpert?.id
      );
      if (conversation) {
        await sendMessage(message, selectedExpert?.id);
      }
    } else {
      await sendMessage(message, selectedExpert?.id);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(id);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        conversations={conversations}
        currentConversation={currentConversation}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onNavigate={onNavigate}
      />

      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
                  <span className="text-5xl">💬</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {selectedExpert ? `Chat with ${selectedExpert.name}` : 'Start a conversation'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {selectedExpert
                    ? selectedExpert.description
                    : 'Ask me anything! I can help you with coding, writing, analysis, and much more.'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSendMessage('Help me write a React component')}
                    className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all"
                  >
                    <p className="font-medium text-gray-900 text-sm">Help me code</p>
                    <p className="text-xs text-gray-500">Write a React component</p>
                  </button>
                  <button
                    onClick={() => handleSendMessage('Explain this code for me')}
                    className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all"
                  >
                    <p className="font-medium text-gray-900 text-sm">Explain code</p>
                    <p className="text-xs text-gray-500">Understand complex logic</p>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isStreaming={
                    isStreaming &&
                    message.id === messages[messages.length - 1].id &&
                    message.role === 'assistant'
                  }
                />
              ))}
            </div>
          )}

          {error && (
            <div className="max-w-4xl mx-auto mt-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p>{error}</p>
                <button
                  onClick={clearError}
                  className="text-sm underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading && !isStreaming}
          isLoading={isLoading && !isStreaming}
        />
      </div>
    </div>
  );
};
