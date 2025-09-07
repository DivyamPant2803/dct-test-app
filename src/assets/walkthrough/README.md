# Walkthrough Images

This folder contains the screenshots for the Guidance Walkthrough feature.

## Required Images

You need to create the following images for the walkthrough to work:

### WebP Format (Primary - 85% quality)
- `step1-welcome.webp` (2500x1100)
- `step2-info-category.webp` (2500x1100)
- `step3-data-subject.webp` (2500x1100)
- `step4-countries.webp` (2500x1100)
- `step5-entities.webp` (2500x1100)
- `step6-transfer-location.webp` (2500x1100)
- `step7-recipient-type.webp` (2500x1100)
- `step8-results.webp` (2500x1100)
- `step9-completion.webp` (2500x1100)

### PNG Format (Fallback)
- `step1-welcome.png` (2500x1100)
- `step2-info-category.png` (2500x1100)
- `step3-data-subject.png` (2500x1100)
- `step4-countries.png` (2500x1100)
- `step5-entities.png` (2500x1100)
- `step6-transfer-location.png` (2500x1100)
- `step7-recipient-type.png` (2500x1100)
- `step8-results.png` (2500x1100)
- `step9-completion.png` (2500x1100)

## Image Creation Process

1. **Capture screenshots** at 2500x1100 resolution
2. **Convert to WebP** using online tools or ImageMagick:
   ```bash
   cwebp -q 85 input.png -o output.webp
   ```
3. **Keep PNG versions** as fallback for older browsers
4. **Optimize file sizes** - WebP should be ~150-300KB per image

## Screenshot Content

Each screenshot should capture:
- **Step 1**: Welcome screen with walkthrough introduction
- **Step 2**: Information Category selection (ED vs CID)
- **Step 3**: Data Subject Type selection
- **Step 4**: Countries selection interface
- **Step 5**: Entity selection modal/interface
- **Step 6**: Transfer location selection
- **Step 7**: Recipient type selection
- **Step 8**: Results/Output page
- **Step 9**: Completion screen

## Testing

Once images are added, test the walkthrough by:
1. Running the development server
2. Navigating to the Guidance page
3. Clicking the "Guidance Walkthrough" button
4. Verifying all images load correctly
5. Testing navigation and keyboard shortcuts 