import React, { useState } from 'react';
import NavigationButtons from './NavigationButtons';

/**
 * Example component demonstrating how to use the NavigationButtons component
 * This shows different configurations and use cases
 */
const NavigationButtonsExample: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isStepCompleted, setIsStepCompleted] = useState(false);
  
  const totalSteps = 5;

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsStepCompleted(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setIsStepCompleted(false);
    }
  };

  const handleCompleteStep = () => {
    setIsStepCompleted(true);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Navigation Buttons Examples</h2>
      
      {/* Example 1: Basic navigation */}
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Basic Navigation</h3>
        <p>Current Step: {currentStep + 1} of {totalSteps}</p>
        <p>Step Completed: {isStepCompleted ? 'Yes' : 'No'}</p>
        
        <button 
          onClick={handleCompleteStep}
          style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}
        >
          {isStepCompleted ? 'Step Completed' : 'Mark Step Complete'}
        </button>
        
        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          canGoBack={currentStep > 0}
          canGoNext={isStepCompleted && currentStep < totalSteps - 1}
          showBack={currentStep > 0}
          showNext={currentStep < totalSteps - 1}
        />
      </div>

      {/* Example 2: Custom button text */}
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Custom Button Text</h3>
        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          canGoBack={currentStep > 0}
          canGoNext={isStepCompleted}
          showBack={true}
          showNext={true}
          backText="Previous"
          nextText="Continue"
        />
      </div>

      {/* Example 3: Back button only */}
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Back Button Only</h3>
        <NavigationButtons
          onBack={handleBack}
          onNext={() => {}}
          canGoBack={currentStep > 0}
          canGoNext={false}
          showBack={true}
          showNext={false}
        />
      </div>

      {/* Example 4: Next button only */}
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Next Button Only</h3>
        <NavigationButtons
          onBack={() => {}}
          onNext={handleNext}
          canGoBack={false}
          canGoNext={isStepCompleted}
          showBack={false}
          showNext={true}
        />
      </div>

      {/* Example 5: Disabled buttons */}
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Disabled Buttons</h3>
        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          canGoBack={false}
          canGoNext={false}
          showBack={true}
          showNext={true}
        />
      </div>
    </div>
  );
};

export default NavigationButtonsExample; 