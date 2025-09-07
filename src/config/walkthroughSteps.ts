export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  webpImage: string;
  pngImage: string;
}

// Note: Images should be placed in src/assets/walkthrough/ folder
// Current format: PNG at 1927x1030 resolution (will be converted to WebP later)
// Fallback PNG images are provided for older browsers
export const guidanceWalkthroughSteps: WalkthroughStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Data Transfer Compliance Tool',
    description: 'This walkthrough will guide you through the complete workflow for determining data transfer compliance requirements. You\'ll learn how to navigate through each step of the questionnaire and understand the results.',
    webpImage: '/src/assets/walkthrough/step1-welcome.svg',
    pngImage: '/src/assets/walkthrough/step1-welcome.svg'
  },
  {
    id: 'info-category',
    title: 'Step 1: Information Category',
    description: 'Select whether you\'re dealing with Employee Data (ED) or Client Information Data (CID). This choice determines the type of guidance you\'ll receive and the questions that follow.',
    webpImage: '/src/assets/walkthrough/information category.png',
    pngImage: '/src/assets/walkthrough/information category.png'
  },
  {
    id: 'data-subject',
    title: 'Step 2: Data Subject Type',
    description: 'Choose the specific type of data subjects involved in your transfer. For Employee Data, this might include employees, candidates, or contractors. For Client Data, this could be clients, prospects, or business partners.',
    webpImage: '/src/assets/walkthrough/Data subject types.png',
    pngImage: '/src/assets/walkthrough/Data subject types.png'
  },
  {
    id: 'countries',
    title: 'Step 3: Countries Selection',
    description: 'Select the countries involved in your data transfer. This includes both the source countries (where data originates) and destination countries (where data will be transferred to).',
    webpImage: '/src/assets/walkthrough/Countries.png',
    pngImage: '/src/assets/walkthrough/Countries.png'
  },
  {
    id: 'entities',
    title: 'Step 4: Entity Selection',
    description: 'Choose the specific entities or business units involved in the data transfer. This helps determine the applicable compliance requirements and business context for your transfer.',
    webpImage: '/src/assets/walkthrough/Entity Page.png',
    pngImage: '/src/assets/walkthrough/Entity Page.png'
  },
  {
    id: 'transfer-location',
    title: 'Step 5: Transfer Location',
    description: 'Specify where the data will be transferred to. This could include cloud providers, third-party services, or other business locations. The location affects compliance requirements.',
    webpImage: '/src/assets/walkthrough/Transfer Location.png',
    pngImage: '/src/assets/walkthrough/Transfer Location.png'
  },
  {
    id: 'recipient-type',
    title: 'Step 6: Recipient Type',
    description: 'Define who will receive the data. This could be internal teams, service providers, business partners, or other third parties. Different recipient types have different compliance requirements.',
    webpImage: '/src/assets/walkthrough/Recipient Types.png',
    pngImage: '/src/assets/walkthrough/Recipient Types.png'
  },
  {
    id: 'review-purpose',
    title: 'Step 7: Review Data Transfer Purpose',
    description: 'Review and confirm the purpose of your data transfer. This step ensures all information is accurate before generating compliance guidance.',
    webpImage: '/src/assets/walkthrough/Review Data Transfer Purpose.png',
    pngImage: '/src/assets/walkthrough/Review Data Transfer Purpose.png'
  },
  {
    id: 'results',
    title: 'Step 8: Review Results',
    description: 'Review your completed questionnaire and see the compliance guidance. The system will provide specific recommendations based on your selections and applicable regulations.',
    webpImage: '/src/assets/walkthrough/Output Table with Filters.png',
    pngImage: '/src/assets/walkthrough/Output Table with Filters.png'
  },
  {
    id: 'completion',
    title: 'Walkthrough Complete!',
    description: 'You\'ve successfully completed the walkthrough! You now understand how to use the Data Transfer Compliance Tool. You can start your own assessment or refer back to this walkthrough anytime.',
    webpImage: '/src/assets/walkthrough/step1-welcome.svg',
    pngImage: '/src/assets/walkthrough/step1-welcome.svg'
  }
]; 