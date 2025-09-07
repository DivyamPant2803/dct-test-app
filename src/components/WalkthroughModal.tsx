import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiChevronLeft, FiChevronRight, FiPlay, FiSkipForward } from 'react-icons/fi';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
`;

const ModalContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const WalkthroughImage = styled.img`
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  object-position: center;
  display: block;
`;

const NavigationOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  pointer-events: none;
  z-index: 5;
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  color: #333;

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Header = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  color: #666;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background: #dc2626;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 1);
    color: white;
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ProgressIndicator = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 20px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

const LoadingDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #dc2626;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 0.4;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: white;
  font-size: 16px;
`;

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  webpImage: string;
  pngImage: string;
}

interface WalkthroughModalProps {
  open: boolean;
  onClose: () => void;
  steps: WalkthroughStep[];
}

const WalkthroughModal: React.FC<WalkthroughModalProps> = ({ open, onClose, steps }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set());

  const currentStepData = steps[currentStep];

  // Preload all images when modal opens
  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setLoadedImages(new Set());
      setPreloadedImages(new Set());
      return;
    }

    // Load first image immediately
    if (steps.length > 0) {
      setLoadedImages(new Set([0]));
    }

    // Preload all other images in background
    const preloadImages = async () => {
      const imagePromises = steps.map((step, index) => {
        if (index === 0) return Promise.resolve(); // First image already loaded
        
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            setPreloadedImages(prev => new Set(prev).add(index));
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to preload image for step ${index}`);
            resolve();
          };
          img.src = step.webpImage;
        });
      });

      await Promise.all(imagePromises);
    };

    preloadImages();
  }, [open, steps]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
          }
          break;
        case 'ArrowRight':
          if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
          }
          break;
        case 's':
        case 'S':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, currentStep, steps.length, onClose]);

  const handleImageLoad = (stepIndex: number) => {
    setLoadedImages(prev => new Set(prev).add(stepIndex));
    setIsLoading(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsLoading(true);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsLoading(true);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const isImageLoaded = loadedImages.has(currentStep);
  const isImagePreloaded = preloadedImages.has(currentStep) || currentStep === 0;

  if (!open) return null;

  return (
    <Overlay>
      <ModalContainer>
        <ImageContainer>
          {isLoading && !isImagePreloaded && (
            <LoadingSpinner>Loading...</LoadingSpinner>
          )}
          
          <picture>
            <source srcSet={currentStepData.webpImage} type="image/webp" />
            <WalkthroughImage
              src={currentStepData.pngImage}
              alt={currentStepData.title}
              onLoad={() => handleImageLoad(currentStep)}
              style={{ display: isImageLoaded || isImagePreloaded ? 'block' : 'none' }}
            />
          </picture>

          <Header>
            <CloseButton onClick={onClose} aria-label="Close walkthrough">
              <FiX size={20} />
            </CloseButton>
            <ProgressIndicator>
              Step {currentStep + 1} of {steps.length}
              {preloadedImages.size < steps.length - 1 && open && <LoadingDot />}
            </ProgressIndicator>
            <div></div> {/* Empty div for flex spacing */}
          </Header>

          <NavigationOverlay>
            <NavButton
              onClick={handlePrevious}
              disabled={isFirstStep}
              aria-label="Previous step"
            >
              <FiChevronLeft size={24} />
            </NavButton>
            <NavButton
              onClick={handleNext}
              disabled={isLastStep}
              aria-label="Next step"
            >
              <FiChevronRight size={24} />
            </NavButton>
          </NavigationOverlay>
        </ImageContainer>
      </ModalContainer>
    </Overlay>
  );
};

export default WalkthroughModal; 