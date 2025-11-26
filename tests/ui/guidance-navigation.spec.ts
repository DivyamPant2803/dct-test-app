import { test, expect } from '@playwright/test';

/**
 * Test suite for Guidance page navigation and questionnaire flow
 * Generated using the UI test generation prompt from @playwright-mcp/automation
 * 
 * Test Scenarios:
 * - Verify that the user can successfully navigate through the Guidance tab and perform selections
 * - For each question presented, make a valid selection and click Next to proceed
 */

test.describe('Guidance Page - Questionnaire Navigation Flow', () => {
  const GUIDANCE_URL = 'http://localhost:5173/guidance';

  test.beforeEach(async ({ page }) => {
    // Navigate to the Guidance page
    await page.goto(GUIDANCE_URL);
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should successfully navigate through Guidance tab and perform selections', async ({ page }) => {
    // PHASE 1: Page Load and Initial State Validation
    // Verify page title and initial question is visible
    await expect(page.locator('text=Select Information Category')).toBeVisible({ timeout: 10000 });
    
    // Verify Next button is initially disabled (no selection made yet)
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeDisabled();

    // PHASE 2: Question 1 - Select Information Category
    // Wait for options to be visible
    await expect(page.locator('text=CID')).toBeVisible();
    await expect(page.locator('text=ED')).toBeVisible();
    
    // Make a valid selection (CID)
    const cidOption = page.locator('text=CID').first();
    await cidOption.click();
    
    // Verify selection was made (Next button should be enabled)
    await expect(nextButton).toBeEnabled();
    
    // Click Next to proceed to Question 2
    await nextButton.click();
    
    // Wait for Question 2 to load
    await page.waitForTimeout(500);

    // PHASE 3: Question 2 - Select Data Subject Type
    // Verify we're on Question 2
    await expect(page.locator('text=Select Data Subject Type')).toBeVisible();
    
    // Wait for Client category options to be visible (since CID was selected)
    await expect(page.locator('text=Client').first()).toBeVisible();
    
    // Make a valid selection (Client)
    const clientOption = page.locator('text=Client').first();
    await clientOption.click();
    
    // Verify Next button is enabled
    await expect(nextButton).toBeEnabled();
    
    // Click Next to proceed to Question 3
    await nextButton.click();
    
    // Wait for Question 3 to load
    await page.waitForTimeout(500);

    // PHASE 4: Question 3 - Select the countries
    // Verify we're on Question 3
    await expect(page.locator('text=Selected Countries')).toBeVisible();
    
    // Make a valid selection (Japan)
    const japanOption = page.locator('button:has-text("Japan")').first();
    await expect(japanOption).toBeVisible();
    await japanOption.click();
    
    // Verify selection was made
    await expect(page.locator('text=Selected Countries (1)')).toBeVisible({ timeout: 5000 });
    
    // Verify Next button is enabled
    await expect(nextButton).toBeEnabled();
    
    // Click Next to proceed to Question 4
    await nextButton.click();
    
    // Wait for Question 4 to load
    await page.waitForTimeout(500);

    // PHASE 5: Question 4 - Select the entities
    // Verify we're on Question 4
    await expect(page.locator('text=Selected Entities')).toBeVisible();
    
    // Wait for entity options to load based on selected country
    // Select a business division first
    const businessDivision = page.locator('button:has-text("Investment Banking Global Markets (IB GM)")').first();
    await expect(businessDivision).toBeVisible({ timeout: 10000 });
    await businessDivision.click();
    
    // Wait for individual entities to appear
    await page.waitForTimeout(1000);
    
    // Select the first available entity
    const entityOption = page.locator('text=/Japan.*Entity.*/i').first();
    await expect(entityOption).toBeVisible({ timeout: 10000 });
    await entityOption.click();
    
    // Verify selection was made (should show selected count)
    await expect(page.locator('text=/Selected Entities \\(\\d+\\/100\\)/')).toBeVisible({ timeout: 5000 });
    
    // Verify Next button is enabled
    await expect(nextButton).toBeEnabled();
    
    // Click Next to proceed to Question 5
    await nextButton.click();
    
    // Wait for Question 5 to load
    await page.waitForTimeout(500);

    // PHASE 6: Question 5 - Select Transfer Location
    // Verify we're on Question 5
    await expect(page.locator('text=Select Transfer Location')).toBeVisible();
    
    // Wait for transfer location options to be visible
    await expect(page.locator('text=Inside Country')).toBeVisible();
    
    // Make a valid selection (Inside Country)
    const insideCountryOption = page.locator('text=Inside Country').first();
    await insideCountryOption.click();
    
    // Verify Next button is enabled
    await expect(nextButton).toBeEnabled();
    
    // Click Next to proceed to Question 6
    await nextButton.click();
    
    // Wait for Question 6 to load
    await page.waitForTimeout(500);

    // PHASE 7: Question 6 - Select Recipient Types
    // Verify we're on Question 6
    await expect(page.locator('text=Select Recipient Types')).toBeVisible();
    
    // Wait for recipient type options to be visible
    await expect(page.locator('text=Entity')).toBeVisible();
    
    // Make a valid selection (Entity)
    const entityRecipientOption = page.locator('text=Entity').first();
    await entityRecipientOption.click();
    
    // Verify Review button is enabled (button text changes to "Review" on last question)
    const reviewButton = page.locator('button:has-text("Review")');
    await expect(reviewButton).toBeEnabled();
    
    // Click Review to proceed to the review step
    await reviewButton.click();
    
    // Wait for Review step to load
    await page.waitForTimeout(500);

    // PHASE 8: Review Data Transfer Purpose step
    // Verify we're on the review step
    await expect(page.locator('text=Review Data Transfer Purpose')).toBeVisible();
    
    // Wait for the review table/content to be visible
    await expect(page.locator('text=Client').first()).toBeVisible({ timeout: 10000 });
    
    // Make a valid selection (select a data transfer purpose)
    const purposeOption = page.locator('text=Client Relationship Management').first();
    await expect(purposeOption).toBeVisible({ timeout: 10000 });
    await purposeOption.click();
    
    // Verify View Output button is visible and enabled
    const viewOutputButton = page.locator('button:has-text("View Output")');
    await expect(viewOutputButton).toBeVisible();
    await expect(viewOutputButton).toBeEnabled();
    
    // Click View Output to complete the questionnaire
    await viewOutputButton.click();
    
    // Wait for navigation to output page
    await page.waitForTimeout(1000);

    // PHASE 9: Verify Output/Results Page
    // Verify we're on the output/results page
    await expect(page.locator('text=Output').or(page.locator('h1, h2, h3').filter({ hasText: /output/i }))).toBeVisible({ timeout: 10000 });
    
    // Verify the output table is displayed
    await expect(page.locator('table').first()).toBeVisible({ timeout: 10000 });
    
    // Verify summary information is displayed
    await expect(page.locator('text=Information Category').or(page.locator('text=CID'))).toBeVisible();
    
    // Verify the results table contains data
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should validate Next button state based on selection', async ({ page }) => {
    // Verify Next button is initially disabled
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeDisabled();
    
    // Make a selection
    await page.locator('text=CID').first().click();
    
    // Verify Next button is now enabled
    await expect(nextButton).toBeEnabled();
    
    // Click Next
    await nextButton.click();
    
    // On Question 2, verify Next button is disabled until selection
    await expect(nextButton).toBeDisabled();
    
    // Make a selection
    await page.locator('text=Client').first().click();
    
    // Verify Next button is enabled again
    await expect(nextButton).toBeEnabled();
  });

  test('should handle navigation through all questions sequentially', async ({ page }) => {
    const questions = [
      { 
        question: 'Select Information Category', 
        selector: 'text=CID',
        verifyText: 'Select Information Category'
      },
      { 
        question: 'Select Data Subject Type', 
        selector: 'text=Client',
        verifyText: 'Select Data Subject Type'
      },
      { 
        question: 'Select the countries', 
        selector: 'button:has-text("Japan")',
        verifyText: 'Selected Countries'
      },
      { 
        question: 'Select the entities', 
        selector: 'button:has-text("Investment Banking Global Markets (IB GM)")',
        verifyText: 'Selected Entities'
      },
      { 
        question: 'Select Transfer Location', 
        selector: 'text=Inside Country',
        verifyText: 'Select Transfer Location'
      },
      { 
        question: 'Select Recipient Types', 
        selector: 'text=Entity',
        verifyText: 'Select Recipient Types'
      }
    ];

    const nextButton = page.locator('button:has-text("Next"), button:has-text("Review")');

    for (let i = 0; i < questions.length; i++) {
      const currentQuestion = questions[i];
      
      // Verify we're on the correct question
      await expect(page.locator(`text=${currentQuestion.verifyText}`)).toBeVisible({ timeout: 10000 });
      
      // Make a selection
      const option = page.locator(currentQuestion.selector).first();
      await expect(option).toBeVisible({ timeout: 10000 });
      await option.click();
      
      // For entity selection, wait for entities to load and select one
      if (currentQuestion.question === 'Select the entities') {
        await page.waitForTimeout(1000);
        const entityOption = page.locator('text=/Japan.*Entity.*/i').first();
        if (await entityOption.isVisible({ timeout: 5000 })) {
          await entityOption.click();
        }
      }
      
      // Verify Next/Review button is enabled
      await expect(nextButton).toBeEnabled({ timeout: 5000 });
      
      // Click Next/Review to proceed
      await nextButton.click();
      
      // Wait for next question to load
      await page.waitForTimeout(500);
    }
    
    // Verify we reached the review step
    await expect(page.locator('text=Review Data Transfer Purpose')).toBeVisible({ timeout: 10000 });
  });
});


