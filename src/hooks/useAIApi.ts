import { useState, useCallback } from 'react';
import { AISummary, ChatMsg, AIInsights } from '../types/index';

// Helper functions for localStorage caching
const getCachedSummary = (requirementId: string, version: number): AISummary | null => {
  const key = `ai_summary_${requirementId}_${version}`;
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error reading cached summary:', error);
    return null;
  }
};

const setCachedSummary = (summary: AISummary): void => {
  const key = `ai_summary_${summary.requirementId}_${summary.version}`;
  try {
    localStorage.setItem(key, JSON.stringify(summary));
  } catch (error) {
    console.error('Error caching summary:', error);
  }
};

const getCachedChatHistory = (contextRequirementId?: string): ChatMsg[] => {
  const key = contextRequirementId ? `chat_history_${contextRequirementId}` : 'chat_history_general';
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error reading cached chat history:', error);
    return [];
  }
};

const setCachedChatHistory = (messages: ChatMsg[], contextRequirementId?: string): void => {
  const key = contextRequirementId ? `chat_history_${contextRequirementId}` : 'chat_history_general';
  try {
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
    console.error('Error caching chat history:', error);
  }
};

// Mock AI responses for development
const mockSummaries: Record<string, string> = {
  'req-1': '• Ensure data processing follows GDPR Article 6 (lawfulness of processing)\n• Inform data subjects through clear privacy notices\n• Handle special categories per Article 9 requirements\n• Maintain records of processing activities\n• Implement appropriate technical safeguards',
  'req-2': '• Implement technical safeguards for data protection\n• Document all processing activities comprehensively\n• Maintain data subject rights and access procedures\n• Ensure lawful basis for all processing operations\n• Regular compliance monitoring and reporting',
  'default': '• Review the specific legal requirements carefully\n• Ensure compliance with applicable data protection laws\n• Document all necessary procedures and safeguards\n• Implement appropriate technical and organizational measures\n• Regular monitoring and review of compliance status'
};

const mockChatResponses: Record<string, string[]> = {
  'evidence': [
    'Based on the requirement, you\'ll need to provide evidence of your data processing agreement, privacy notices, and technical safeguards documentation.',
    'Common evidence includes: Data Processing Agreements (DPAs), Privacy Policy documentation, Technical security measures documentation, and Records of Processing Activities (ROPA).'
  ],
  'upload': [
    'The upload process involves three steps: 1) Prepare your documentation (PDF format preferred), 2) Upload via the evidence portal, 3) Wait for admin review and approval.',
    'Make sure your files are properly named and include clear descriptions. The review process typically takes 2-3 business days.'
  ],
  'escalation': [
    'If you need to escalate an issue, contact your legal team or data protection officer. They can help resolve complex compliance questions.',
    'Escalation is available for urgent matters or when standard procedures don\'t apply to your specific situation.'
  ],
  'default': [
    'I can help you understand the legal requirements and guide you through the compliance process. What specific aspect would you like to know more about?',
    'Feel free to ask about evidence requirements, upload procedures, or any other compliance-related questions.'
  ]
};

export const useAISummarize = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarizeRequirement = useCallback(async (requirementId: string, version: number = 1): Promise<AISummary | null> => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = getCachedSummary(requirementId, version);
      if (cached) {
        setLoading(false);
        return cached;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock API response
      const summary: AISummary = {
        requirementId,
        version,
        summary: mockSummaries[requirementId] || mockSummaries.default,
        createdAt: new Date().toISOString()
      };

      // Cache the result
      setCachedSummary(summary);
      setLoading(false);
      return summary;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to summarize requirement');
      setLoading(false);
      return null;
    }
  }, []);

  return {
    summarizeRequirement,
    loading,
    error
  };
};

export const useAIChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    messages: ChatMsg[],
    contextRequirementId?: string
  ): Promise<ChatMsg[]> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const lastMessage = messages[messages.length - 1];
      const messageText = lastMessage.text.toLowerCase();

      // Determine response based on message content
      let responseText = mockChatResponses.default[0];
      
      if (messageText.includes('evidence') || messageText.includes('document')) {
        responseText = mockChatResponses.evidence[Math.floor(Math.random() * mockChatResponses.evidence.length)];
      } else if (messageText.includes('upload') || messageText.includes('file')) {
        responseText = mockChatResponses.upload[Math.floor(Math.random() * mockChatResponses.upload.length)];
      } else if (messageText.includes('escalat') || messageText.includes('help')) {
        responseText = mockChatResponses.escalation[Math.floor(Math.random() * mockChatResponses.escalation.length)];
      }

      const assistantMessage: ChatMsg = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        text: responseText,
        createdAt: new Date().toISOString(),
        contextRequirementId
      };

      const updatedMessages = [...messages, assistantMessage];
      
      // Cache the conversation
      setCachedChatHistory(updatedMessages, contextRequirementId);
      
      setLoading(false);
      return updatedMessages;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setLoading(false);
      return messages;
    }
  }, []);

  const getChatHistory = useCallback((contextRequirementId?: string): ChatMsg[] => {
    return getCachedChatHistory(contextRequirementId);
  }, []);

  const clearChatHistory = useCallback((contextRequirementId?: string): void => {
    const key = contextRequirementId ? `chat_history_${contextRequirementId}` : 'chat_history_general';
    localStorage.removeItem(key);
  }, []);

  return {
    sendMessage,
    getChatHistory,
    clearChatHistory,
    loading,
    error
  };
};

export const useAIInsights = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInsights = useCallback(async (range: string = '30d'): Promise<AIInsights | null> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock insights data
      const insights: AIInsights = {
        topAskedIntents: [
          { intent: 'What evidence is needed?', count: 45 },
          { intent: 'Upload steps', count: 32 },
          { intent: 'Escalation policy', count: 28 },
          { intent: 'GDPR compliance', count: 24 },
          { intent: 'Data processing agreement', count: 19 }
        ],
        requirementsNeedingHelp: [
          { requirementId: 'req-1', title: 'GDPR Data Processing Agreement', helpClicks: 15 },
          { requirementId: 'req-2', title: 'Technical Safeguards Documentation', helpClicks: 12 },
          { requirementId: 'req-3', title: 'Privacy Notice Requirements', helpClicks: 9 },
          { requirementId: 'req-4', title: 'Data Subject Rights Procedures', helpClicks: 7 },
          { requirementId: 'req-5', title: 'Cross-border Transfer Safeguards', helpClicks: 6 }
        ],
        period: range
      };

      setLoading(false);
      return insights;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
      setLoading(false);
      return null;
    }
  }, []);

  return {
    getInsights,
    loading,
    error
  };
};
