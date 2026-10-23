import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('MediTrace AI - Clinical SOC Main User Journey', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/');
  });

  test('1. Loads dashboard with healthcare SOC branding and overview metrics', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/MediTrace AI/);

    // Header branding
    await expect(page.locator('header')).toContainText('MediTrace');
    await expect(page.locator('header')).toContainText('AI SOC');

    // Live FastAPI connection indicator
    await expect(page.locator('text=FastAPI: CONNECTED (Port 8000)')).toBeVisible({ timeout: 10000 });

    // Overview metrics cards
    await expect(page.locator('text=Active Threats')).toBeVisible();
    await expect(page.locator('text=Critical Alerts')).toBeVisible();
    await expect(page.locator('text=Affected Medical Devices')).toBeVisible();
    await expect(page.locator('text=HIPAA Security Score')).toBeVisible();
    await expect(page.locator('text=Mean Response Time')).toBeVisible();
    await expect(page.locator('text=Containment Rate')).toBeVisible();
  });

  test('2. Filters and searches prioritized alert queue with accessible controls', async ({ page }) => {
    // Wait for alert queue to populate
    const searchInput = page.locator('#alert-search-input');
    await expect(searchInput).toBeVisible();

    // Verify accessible label
    const searchLabel = page.locator('label[for="alert-search-input"]');
    await expect(searchLabel).toBeAttached();

    // Type search term for Infusion Pump
    await searchInput.fill('Infusion');
    await page.click('button:has-text("Filter")');

    // Confirm filtered results match
    await expect(page.locator('text=Unusual IoMT Port Scan targeting Infusion Pumps')).toBeVisible();

    // Reset filters
    await page.click('text=Reset Filters');

    // Test Severity filter dropdown
    const severitySelect = page.locator('#severity-filter');
    await severitySelect.selectOption('CRITICAL');
    
    // Only Critical badges should be shown in filtered items
    await expect(page.locator('text=Cobalt Strike C2 Beaconing over Encrypted HTTPS')).toBeVisible();
  });

  test('3. Inspects incident details, clinical assets, and IoCs', async ({ page }) => {
    // Click on the first alert
    const firstAlert = page.locator('article[role="article"]').first();
    await firstAlert.click();

    // Verify Incident Details dossier appears
    await expect(page.locator('text=Targeted Clinical Assets & Subnets')).toBeVisible();
    await expect(page.locator('text=Extracted Indicators of Compromise')).toBeVisible();

    // Check patient safety risk badge
    await expect(page.locator('text=PATIENT SAFETY RISK')).toBeVisible();

    // Check IoC copy button exists and has accessible label
    const copyButton = page.locator('button[aria-label*="Copy IOC"]').first();
    await expect(copyButton).toBeVisible();
  });

  test('4. Navigates chronological evidence timeline and inspects raw telemetry', async ({ page }) => {
    // Ensure timeline is visible
    await expect(page.locator('text=Chronological Evidence-Linked Timeline')).toBeVisible();

    // Check evidence type filter pills
    await expect(page.locator('button:has-text("ALL EVIDENCE")')).toBeVisible();
    const pcapFilter = page.locator('button:has-text("PCAP")');
    await expect(pcapFilter).toBeVisible();
    await pcapFilter.click();

    // Verify PCAP event is shown
    await expect(page.locator('text=Cobalt Strike C2 Beacon Initialized')).toBeVisible();

    // Expand raw telemetry
    const expandButton = page.locator('button:has-text("Inspect Raw Forensic Telemetry")').first();
    await expect(expandButton).toBeVisible();
    await expandButton.click();

    // Verify raw forensic payload is revealed
    await expect(page.locator('pre[aria-label*="Raw payload"]')).toBeVisible();

    // Verify cryptographic SHA-256 seal is displayed
    await expect(page.locator('text=SEALED')).toBeVisible();
  });

  test('5. Updates investigation status and containment controls', async ({ page }) => {
    // Verify Investigation controls section is loaded
    await expect(page.locator('text=SOC Investigation Controls & Remediation')).toBeVisible();

    // Click "Contained (VLAN Isolated)" status button
    const containedRadio = page.locator('button[role="radio"]:has-text("Contained")');
    await containedRadio.click();

    // Fill analyst action note
    const notesInput = page.locator('#analyst-notes');
    await notesInput.fill('Playwright Test: Verified nurse station quarantine and applied firewall block.');

    // Submit status update
    await page.click('button:has-text("Commit Status Update")');

    // Verify success confirmation message appears
    await expect(page.locator('text=Incident updated to CONTAINED successfully')).toBeVisible();
  });

  test('6. Ingests forensic evidence file with automated SHA-256 seal', async ({ page }) => {
    // Click Upload Evidence button in header
    await page.click('button[aria-label="Upload forensic evidence file"]');

    // Modal should be visible
    await expect(page.locator('#upload-modal-title')).toHaveText('Secure Forensic Evidence Ingest');

    // Create a temporary sample evidence log
    const testFilePath = path.join(process.cwd(), 'tests', 'sample-evidence.pcap');
    fs.writeFileSync(testFilePath, 'SAMPLE_PCAP_PACKET_STREAM_ICU_INFUSION_TRAFFIC_OCT2026');

    // Upload file through the hidden file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);

    // Verify SHA-256 was calculated and verified client-side
    const modal = page.locator('div[role="dialog"]');
    await expect(modal.getByText('VERIFIED', { exact: true })).toBeVisible();

    // Submit upload
    await modal.locator('button:has-text("Upload & Seal Evidence")').click();

    // Modal should close on completion
    await expect(page.locator('#upload-modal-title')).not.toBeVisible({ timeout: 10000 });

    // Clean up temporary file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  test('7. Verifies keyboard accessibility and skip navigation', async ({ page }) => {
    // Check skip to content link
    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toHaveAttribute('href', '#main-content');

    // Press Tab from the top to ensure skip link receives focus
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();

    // Check visible focus ring outline on interactive elements
    await page.keyboard.press('Tab');
    const uploadButton = page.locator('button[aria-label="Upload forensic evidence file"]');
    await expect(uploadButton).toBeVisible();
  });

});
