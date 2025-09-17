import { useState, useCallback, useRef } from 'react';
import { BulkReaffirmationRequest, BulkOperationProgress } from '../types/index';

interface UseBulkReaffirmationReturn {
  progress: BulkOperationProgress | null;
  isRunning: boolean;
  startBulkReaffirmation: (request: BulkReaffirmationRequest) => void;
  cancelOperation: () => void;
}

export const useBulkReaffirmation = (): UseBulkReaffirmationReturn => {
  const [progress, setProgress] = useState<BulkOperationProgress | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const startBulkReaffirmation = useCallback((request: BulkReaffirmationRequest) => {
    if (isRunning) return;

    setIsRunning(true);
    
    // Create worker
    const worker = new Worker(new URL('../workers/bulkReaffirmationWorker.ts', import.meta.url));
    workerRef.current = worker;

    const operationId = `bulk_${Date.now()}`;

    // Set up worker message handler
    worker.onmessage = (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'PROGRESS_UPDATE':
          setProgress(data);
          break;
        case 'COMPLETION':
          setProgress(data);
          setIsRunning(false);
          worker.terminate();
          workerRef.current = null;
          break;
        case 'ERROR':
          setProgress(data);
          setIsRunning(false);
          worker.terminate();
          workerRef.current = null;
          break;
      }
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      setIsRunning(false);
      worker.terminate();
      workerRef.current = null;
    };

    // Start the operation
    worker.postMessage({
      type: 'START_BULK_REAFFIRMATION',
      data: { request, operationId }
    });
  }, [isRunning]);

  const cancelOperation = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setIsRunning(false);
    setProgress(null);
  }, []);

  return {
    progress,
    isRunning,
    startBulkReaffirmation,
    cancelOperation
  };
};
