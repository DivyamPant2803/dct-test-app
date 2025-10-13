import { useState, useCallback } from 'react';
import { 
  getTemplates, 
  getTemplateById, 
  getJurisdictions, 
  getEntityNames, 
  getEntityIds 
} from '../services/templateService';

export const useTemplateApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async (filters?: {
    jurisdiction?: string;
    entityId?: string;
    entityName?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const templates = await getTemplates(filters);
      return templates;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(errorMessage);
      console.error('Error fetching templates:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTemplateById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const template = await getTemplateById(id);
      return template;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch template';
      setError(errorMessage);
      console.error('Error fetching template:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJurisdictions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const jurisdictions = await getJurisdictions();
      return jurisdictions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jurisdictions';
      setError(errorMessage);
      console.error('Error fetching jurisdictions:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEntityNames = useCallback(async (jurisdiction?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const entityNames = await getEntityNames(jurisdiction);
      return entityNames;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch entity names';
      setError(errorMessage);
      console.error('Error fetching entity names:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEntityIds = useCallback(async (jurisdiction?: string, entityName?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const entityIds = await getEntityIds(jurisdiction, entityName);
      return entityIds;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch entity IDs';
      setError(errorMessage);
      console.error('Error fetching entity IDs:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchTemplates,
    fetchTemplateById,
    fetchJurisdictions,
    fetchEntityNames,
    fetchEntityIds,
  };
};


