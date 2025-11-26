import { test, expect } from '@playwright/test';

test.describe('Guidance Page - Questionnaire Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Guidance page
    await page.goto('/guidance');
  });

  test('should successfully navigate through Guidance tab and perform selections', async ({ page }) => {
    // Wait for the page to load
    await expect(page.locator('text=Data Transfer Compliance Tool')).toBeVisible();
    
    // Verify we're on the Guidance page
    await expect(page.locator('text=Select Information Category')).toBeVisible();

    // Question 1: Select Information Category
    // Wait for the CID option to be visible
    await expect(page.locator('text=CID')).toBeVisible();
    
    // Select CID option
    const cidOption = page.locator('text=CID').first();
    await cidOption.click();
    
    // Verify selection was made (Next button should be enabled)
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeEnabled();
    
    // Verify Question 2 is now enabled
    await expect(page.locator('button:has-text("Select Data Subject Type")')).toBeEnabled();
    
    // Click Next to proceed to Question 2
    await nextButton.click();

    // Question 2: Select Data Subject Type
    // Wait for the Client option to be visible
    await expect(page.locator('text=Client').filter({ hasText: 'Select the type of data subject' })).toBeVisible();
    
    // Select Client option
    const clientOption = page.locator('text=Client').filter({ hasText: 'Select the type of data subject' }).first();
    await clientOption.click();
    
    // Verify Next button is enabled
    await expect(nextButton).toBeEnabled();
    
    // Verify Question 3 is now enabled
    await expect(page.locator('button:has-text("Select the countries")')).toBeEnabled();
    
    // Click Next to proceed to Question 3
    await nextButton.click();

    // Question 3: Select the countries
    // Wait for country selector to be visible
    await expect(page.locator('text=Selected Countries')).toBeVisible();
    
    // Select Japan country
    const japanOption = page.locator('button:has-text("Japan")').filter({ hasText: 'APAC' });
    await expect(japanOption).toBeVisible();
    await japanOption.click();
    
    // Verify selection was made (should show "Selected Countries (1)")
    await expect(page.locator('text=Selected Countries (1)')).toBeVisible();
    
    // Verify Next button is enabled
    await expect(nextButton).toBeEnabled();
    
    // Verify Question 4 is now enabled
    await expect(page.locator('button:has-text("Select the entities")')).toBeEnabled();
    
    // Click Next to proceed to Question 4
    await nextButton.click();

    // Question 4: Select the entities
    // Wait for entity selector to be visible
    await expect(page.locator('text=Selected Entities')).toBeVisible();
    
    // Select Investment Banking Global Markets (IB GM) business division
    const ibGmOption = page.locator('button:has-text("Investment Banking Global Markets (IB GM)")');
    await expect(ibGmOption).toBeVisible();
    await ibGmOption.click();
    
    // Wait for individual entities to appear
    await expect(page.locator('text=Japan Investment Banking Global Markets (IB GM) Entity 1')).toBeVisible();
    
    // Select the first entity
    const entityOption = page.locator('text=Japan Investment Banking Global Markets (IB GM) Entity 1').first();
    await entityOption.click();
    
    // Verify selection was made (should show "Selected Entities (1/100)")
    await expect(page.locator('text=Selected Entities (1/100)')).toBeVisible();
    
    // Verify Next button is enabled
    await expect(nextButton).toBeEnabled();
    
    // Verify Question 5 is now enabled
    await expect(page.locator('button:has-text("Select Transfer Location")')).toBeEnabled();
    
    // Click Next to proceed to Question 5
    await nextButton.click();

    // Question 5: Select Transfer Location
    // Wait for transfer location options to be visible
    await expect(page.locator('text=Inside Country')).toBeVisible();
    
    // Select Inside Country option
    const insideCountryOption = page.locator('text=Inside Country').filter({ hasText: 'Data will be transferred within the same country' });
    await insideCountryOption.click();
    
    // Verify Next button is enabled
    await expect(nextButton).toBeEnabled();
    
    // Verify Question 6 is now enabled
    await expect(page.locator('button:has-text("Select Recipient Types")')).toBeEnabled();
    
    // Click Next to proceed to Question 6
    await nextButton.click();

    // Question 6: Select Recipient Types
    // Wait for recipient type options to be visible
    await expect(page.locator('text=Entity')).toBeVisible();
    
    // Select Entity option
    const entityRecipientOption = page.locator('text=Entity').filter({ hasText: 'Select the type of recipient' });
    await entityRecipientOption.click();
    
    // Verify Review button is enabled (button text changes to "Review" on last question)
    const reviewButton = page.locator('button:has-text("Review")');
    await expect(reviewButton).toBeEnabled();
    
    // Verify Review Data Transfer Purpose step is now enabled
    await expect(page.locator('button:has-text("Review Data Transfer Purpose")')).toBeEnabled();
    
    // Click Review to proceed to the review step
    await reviewButton.click();

    // Review Data Transfer Purpose step
    // Wait for the review table to be visible
    await expect(page.locator('text=Client')).toBeVisible();
    
    // Select a data transfer purpose (Client Relationship Management)
    const purposeOption = page.locator('text=Client Relationship Management');
    await expect(purposeOption).toBeVisible();
    await purposeOption.click();
    
    // Verify View Output button is visible
    const viewOutputButton = page.locator('button:has-text("View Output")');
    await expect(viewOutputButton).toBeVisible();
    
    // Click View Output to complete the questionnaire
    await viewOutputButton.click();

    // Verify we're on the output/results page
    await expect(page.locator('text=Output')).toBeVisible();
    
    // Verify the output table is displayed
    await expect(page.locator('table')).toBeVisible();
    
    // Verify summary information is displayed
    await expect(page.locator('text=Information Category')).toBeVisible();
    await expect(page.locator('text=CID')).toBeVisible();
    await expect(page.locator('text=Data Subject Type')).toBeVisible();
    await expect(page.locator('text=Client')).toBeVisible();
    
    // Verify the results table contains data
    const tableRows = page.locator('table tbody tr');
    await expect(tableRows.first()).toBeVisible();
  });

  test('should validate that Next button is disabled until a selection is made', async ({ page }) => {
    // Wait for the page to load
    await expect(page.locator('text=Select Information Category')).toBeVisible();
    
    // Verify Next button is initially disabled
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeDisabled();
    
    // Make a selection
    await page.locator('text=CID').first().click();
    
    // Verify Next button is now enabled
    await expect(nextButton).toBeEnabled();
  });

  test('should allow navigation back to previous questions', async ({ page }) => {
    // Navigate through first two questions
    await page.locator('text=CID').first().click();
    await page.locator('button:has-text("Next")').click();
    
    await page.locator('text=Client').filter({ hasText: 'Select the type of data subject' }).first().click();
    await page.locator('button:has-text("Next")').click();
    
    // Verify we're on Question 3
    await expect(page.locator('text=Selected Countries')).toBeVisible();
    
    // Click Back button
    const backButton = page.locator('button:has-text("Back")');
    await expect(backButton).toBeVisible();
    await backButton.click();
    
    // Verify we're back on Question 2
    await expect(page.locator('text=Client').filter({ hasText: 'Select the type of data subject' })).toBeVisible();
  });
});




