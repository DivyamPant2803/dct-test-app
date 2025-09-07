# Common Components

This directory contains reusable React components used throughout the application.

## Components

### TooltipWrapper Component

A reusable React component that adds tooltip functionality to any child element. The tooltip appears at the bottom of the wrapped element on mouse hover.

#### Features

- **Positioned at bottom**: Tooltip appears below the element (as requested)
- **Smooth animations**: Fades in/out with CSS transitions
- **Reusable**: Can wrap any React component or HTML element
- **Accessible**: Proper hover states and keyboard navigation support
- **Customizable**: Easy to modify styling and behavior

#### Usage

```tsx
import TooltipWrapper from '../common/TooltipWrapper';

<TooltipWrapper tooltipText="This is the tooltip text">
  <button>Hover me</button>
</TooltipWrapper>
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `React.ReactNode` | Yes | The element to wrap with tooltip functionality |
| `tooltipText` | `string` | Yes | The text to display in the tooltip |

### NavigationButtons Component

A reusable React component that provides Back and Next navigation buttons for multi-step forms and wizards.

#### Features

- **Flexible configuration**: Show/hide back and next buttons independently
- **Customizable text**: Custom button labels for different contexts
- **Disabled states**: Proper handling of disabled states with visual feedback
- **Consistent styling**: Matches the application's design system
- **Accessible**: Proper ARIA labels and keyboard navigation support

#### Usage

```tsx
import NavigationButtons from '../common/NavigationButtons';

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
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onBack` | `() => void` | Yes | - | Function called when back button is clicked |
| `onNext` | `() => void` | Yes | - | Function called when next button is clicked |
| `canGoBack` | `boolean` | No | `true` | Whether the back button should be enabled |
| `canGoNext` | `boolean` | No | `true` | Whether the next button should be enabled |
| `backText` | `string` | No | `'Back'` | Text to display on the back button |
| `nextText` | `string` | No | `'Next'` | Text to display on the next button |
| `showBack` | `boolean` | No | `true` | Whether to show the back button |
| `showNext` | `boolean` | No | `true` | Whether to show the next button |

#### Examples

**Basic navigation:**
```tsx
<NavigationButtons
  onBack={handleBack}
  onNext={handleNext}
  canGoBack={currentStep > 0}
  canGoNext={isStepCompleted}
/>
```

**Custom button text:**
```tsx
<NavigationButtons
  onBack={handleBack}
  onNext={handleNext}
  backText="Previous"
  nextText="Continue"
/>
```

**Back button only:**
```tsx
<NavigationButtons
  onBack={handleBack}
  onNext={() => {}}
  showNext={false}
/>
```

**Next button only:**
```tsx
<NavigationButtons
  onBack={() => {}}
  onNext={handleNext}
  showBack={false}
/>
```

**Disabled buttons:**
```tsx
<NavigationButtons
  onBack={handleBack}
  onNext={handleNext}
  canGoBack={false}
  canGoNext={false}
/>
```

## Styling

Both components use styled-components with consistent design patterns:

- **Colors**: Black (`#000`) for primary actions, gray (`#666`) for secondary
- **Borders**: 2px solid borders with rounded corners
- **Transitions**: Smooth 0.2s transitions for hover and active states
- **Spacing**: Consistent padding and margins
- **Typography**: Medium font weight for buttons

## Examples

See the example files for comprehensive usage examples:
- `TooltipWrapper.example.tsx` - Tooltip usage examples
- `NavigationButtons.example.tsx` - Navigation button configurations

## Implementation Notes

- Both components are fully typed with TypeScript
- Use React hooks for state management
- Follow accessibility best practices with proper ARIA labels
- Compatible with React 16.8+ and styled-components 