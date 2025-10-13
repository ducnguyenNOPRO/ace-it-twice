import { test as setup } from '@playwright/test';

setup('login and save storage', async ({ page }) => {
  await page.goto('http://localhost:5173/Account/Login');

  // Fill in login form
  await page.getByRole('textbox', { name: 'Email' }).fill('123456@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('123456');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  // Wait for redirect to dashboard or any authenticated page
    await page.waitForURL(/\/setting$/i, { timeout: 5000 });
    await page.getByRole('link', { name: 'Transaction' }).click();
    await page.waitForURL(/\/transaction$/i, { timeout: 5000 });

  // Save authentication state
  await page.context().storageState({ path: 'storageState.json' });
});
