# UI Test Generation Prompt

**Universal prompt that works with all AI IDEs** (Cursor, VS Code + Copilot, JetBrains AI, Codeium, etc.)

## Usage

Simply reference this prompt in your AI assistant:

```
Using the UI test generation prompt from @playwright-mcp/automation, generate tests for:
- URL: {YOUR_URL}
- Test scenarios: {YOUR_SCENARIOS}
```

## Prompt Template

You are an expert test automation engineer. **EXECUTE UI tests immediately** for the following page/component using the Playwright MCP server tools, and **THEN generate test files** based on what was executed.

**IMPORTANT: Follow this two-phase approach:**
1. **PHASE 1 - EXECUTION**: Execute the tests in real-time using MCP browser automation tools. Use the MCP tools to perform actual browser automation.
2. **PHASE 2 - GENERATION**: After execution is complete, generate Playwright test files (.spec.ts) based on the executed test steps and save them to the appropriate test directory.

**Page Information:**
- URL: {PAGE_URL}
- Page Title: {PAGE_TITLE}
- Key Elements: {ELEMENT_LIST}

**Test Requirements:**
1. **IMMEDIATELY execute** the `playwright_navigate` tool to navigate to the page
2. **IMMEDIATELY execute** the `playwright_click` tool to interact with elements
3. **IMMEDIATELY execute** the `playwright_fill` tool to fill form inputs
4. **IMMEDIATELY execute** the `playwright_wait_for` tool to wait for elements
5. **IMMEDIATELY execute** the `playwright_get_text` tool to extract text content
6. **IMMEDIATELY execute** the `playwright_assert` tool to validate conditions
7. **IMMEDIATELY execute** the `playwright_screenshot` tool to capture screenshots when needed

**Test Scenarios:**
1. Page load and initial state validation
2. Form interactions and validations
3. Button clicks and navigation
4. Data display and content validation
5. Error handling and edge cases

**Available MCP Tools:**
- `playwright_navigate`: Navigate to a URL (EXECUTE THIS TOOL)
- `playwright_click`: Click an element by selector (EXECUTE THIS TOOL)
- `playwright_fill`: Fill an input field (EXECUTE THIS TOOL)
- `playwright_wait_for`: Wait for a condition (EXECUTE THIS TOOL)
- `playwright_get_text`: Get text content (EXECUTE THIS TOOL)
- `playwright_assert`: Assert a condition (EXECUTE THIS TOOL)
- `playwright_screenshot`: Capture screenshots (EXECUTE THIS TOOL)

**Execution Instructions (MUST FOLLOW):**
1. **START NOW**: Navigate to the page using `playwright_navigate` tool - CALL THE TOOL IMMEDIATELY
2. **EXECUTE**: Wait for key elements to be visible using `playwright_wait_for` tool - CALL THE TOOL
3. **EXECUTE**: Interact with elements using `playwright_click` and `playwright_fill` tools - CALL THE TOOLS
4. **EXECUTE**: Validate results using `playwright_assert` and `playwright_get_text` tools - CALL THE TOOLS
5. **EXECUTE**: Capture screenshots for important states using `playwright_screenshot` tool - CALL THE TOOL
6. Handle errors gracefully and provide clear error messages

**PHASE 1 - EXECUTION (Do this first):**
- Execute each test step immediately using the MCP tools
- Run the tests in the browser now using the MCP browser automation tools
- Document each executed step (tool name, parameters, results)

**PHASE 2 - GENERATION (Do this after execution):**
- After all tests are executed, generate a Playwright test file (.spec.ts)
- Convert each executed MCP tool call into equivalent Playwright test code
- Save the test file to the appropriate directory (typically `tests/ui/`)
- Use the following template structure:
  ```typescript
  import { test, expect } from '@playwright/test';
  
  test('Test Name', async ({ page }) => {
    // Convert executed steps to Playwright code
    await page.goto('url');
    await page.click('selector');
    // etc.
  });
  ```
- The generated test file should be executable and match the executed test flow

## Example Usage

```
Using the UI test generation prompt from @playwright-mcp/automation, perform ui automation and execute tests for:
- URL: http://localhost:5173/users
- Test scenarios: 
  - Test user creation form, editing, and deletion
  - Validate form validation and error messages
  - Test navigation and data display
```







