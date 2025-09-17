// Web Worker for bulk reaffirmation processing
import { BulkReaffirmationRequest, BulkOperationProgress } from '../types/index';

interface WorkerMessage {
  type: 'START_BULK_REAFFIRMATION';
  data: {
    request: BulkReaffirmationRequest;
    operationId: string;
  };
}

interface WorkerResponse {
  type: 'PROGRESS_UPDATE' | 'COMPLETION' | 'ERROR';
  data: BulkOperationProgress;
}

// Simulate API call delay
const simulateApiCall = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate reaffirmation API call
const reaffirmRequirement = async (combinationId: string, _request: BulkReaffirmationRequest): Promise<void> => {
  // Simulate API call delay (100-500ms)
  const delay = Math.random() * 400 + 100;
  await simulateApiCall(delay);
  
  // Simulate occasional failures (5% chance)
  if (Math.random() < 0.05) {
    throw new Error(`Failed to reaffirm requirement ${combinationId}`);
  }
  
  // In real implementation, this would call the actual API
  console.log(`Reaffirmed requirement ${combinationId}`);
};

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;
  
  if (type === 'START_BULK_REAFFIRMATION') {
    const { request, operationId } = data;
    
    const progress: BulkOperationProgress = {
      operationId,
      totalItems: request.combinationIds.length,
      processedItems: 0,
      completedItems: 0,
      failedItems: 0,
      status: 'RUNNING',
      startTime: new Date().toISOString(),
      errors: []
    };
    
    try {
      // Process each requirement
      for (let i = 0; i < request.combinationIds.length; i++) {
        const combinationId = request.combinationIds[i];
        
        try {
          await reaffirmRequirement(combinationId, request);
          progress.completedItems++;
        } catch (error) {
          progress.failedItems++;
          progress.errors!.push(`Requirement ${combinationId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        progress.processedItems = i + 1;
        
        // Send progress update
        self.postMessage({
          type: 'PROGRESS_UPDATE',
          data: { ...progress }
        } as WorkerResponse);
        
        // Small delay to prevent overwhelming the main thread
        await simulateApiCall(10);
      }
      
      // Mark as completed
      progress.status = 'COMPLETED';
      progress.endTime = new Date().toISOString();
      
      self.postMessage({
        type: 'COMPLETION',
        data: progress
      } as WorkerResponse);
      
    } catch (error) {
      // Mark as failed
      progress.status = 'FAILED';
      progress.endTime = new Date().toISOString();
      progress.errors!.push(`Bulk operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      self.postMessage({
        type: 'ERROR',
        data: progress
      } as WorkerResponse);
    }
  }
};

export {};
