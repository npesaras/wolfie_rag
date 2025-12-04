import React from 'react';
import { LoaderOne as Loader } from '@/components/ui/loader';

interface AILoadingStateProps {
  isLoading: boolean;
  loadingMessage?: string;
  processingSteps?: string[];
  currentStep?: number;
}

export const AILoadingState: React.FC<AILoadingStateProps> = ({
  isLoading,
  loadingMessage = "Processing...",
  processingSteps = [],
  currentStep = 0,
}) => {
  if (!isLoading) return null;

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4">
      <div className="w-8 h-8">
        <Loader />
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">{loadingMessage}</p>
        {processingSteps.length > 0 && (
          <div className="space-y-1">
            {processingSteps.map((step, index) => (
              <div
                key={index}
                className={`text-xs flex items-center space-x-2 ${
                  index === currentStep
                    ? 'text-primary font-medium'
                    : index < currentStep
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep
                      ? 'bg-primary animate-pulse'
                      : index < currentStep
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};