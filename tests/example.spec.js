// @ts-check
import { test, expect } from '@playwright/test';
// import { db } from '../src/firebase/firebase';
// import { getDocs, collection } from 'firebase/firestore';

test.describe("'Personal Finance App - Firestore Integration Tests' - Transaction Page", () => {
  // TEST
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/Account/Login');

    // Fill in login form
    await page.getByRole('textbox', { name: 'Email' }).fill('123456@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  // Wait for redirect to dashboard or any authenticated page
    await page.waitForURL(/\/setting$/i, { timeout: 5000 });
    await page.getByRole('link', { name: 'Transaction' }).click();
    await page.waitForURL(/\/transaction$/i, { timeout: 5000 });
  })

  test('Add Transaction to UI + Firestore check', async ({ page }) => {
    
    await page.goto('http://localhost:5173/Transaction');
    await page.waitForTimeout(3000);

    await page.getByRole('button', { name: 'Add Transaction' }).click();
    await page.getByRole('combobox', { name: 'Account Name' }).click();
    await page.getByRole('option', { name: 'Plaid Saving -' }).click();
    await page.getByRole('textbox', { name: 'Merchant Name' }).click();
    await page.getByRole('textbox', { name: 'Merchant Name' }).fill('DoorDash');
    await page.getByRole('textbox', { name: 'Date' }).fill('2025-10-08');
    await page.getByRole('combobox', { name: 'Category' }).click();
    await page.getByRole('option', { name: 'Food' }).click();
    await page.getByRole('textbox', { name: 'Amount Use positive number' }).click();
    await page.getByRole('textbox', { name: 'Amount Use positive number' }).fill('100');
    await page.getByRole('button', { name: 'Save' }).click();

    await page.waitForTimeout(3000); // waits 2 seconds

    // Check UI showing the new added transaction
    const firstRow = page.locator('[data-rowindex="0"]');
    await expect(firstRow).toContainText('Plaid Saving', { timeout: 5000 });
    await expect(firstRow).toContainText('2025-10-08', { timeout: 5000 });
    await expect(firstRow).toContainText('DoorDash', { timeout: 5000 });
    await expect(firstRow).toContainText('Food', { timeout: 5000 });
    await expect(firstRow).toContainText('$100.00', { timeout: 5000 });

    // const ref = collection(db, 'users', 'SBJlmhu7lzaojZkKpmL9jAXycNtT', 'plaid', 
    //   "J5ZmRXAmkVFwM8vw9VK3FyN5LZRoVaUdnADQJ", 'transactions');
    // const snapshot = await getDocs(ref);
    // const docs = snapshot.docs.map(d => d.data())
    // await expect(docs.some(d => d.merchant_name == "DoorDash" && d.account_name == "Plaid Saving")).toBe(true);
  })
})
