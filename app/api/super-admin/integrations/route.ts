/**
 * app/api/super-admin/integrations/route.ts
 *
 * Super Admin REST API for external integrations inventory, healthcheck execution,
 * secure credential staging, and Playwright-assisted onboarding.
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireSuperAdmin } from '@/lib/ai/authHelper';
import { adapterRegistry } from '@/lib/automation/playwright/adapters';
import { credentialVault } from '@/lib/automation/playwright/credentialVault';
import { auditLogger } from '@/lib/automation/playwright/auditLogger';
import { browserManager } from '@/lib/automation/playwright/browserManager';
import { sanitizeData } from '@/lib/automation/playwright/secretRedaction';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);

    // 1. Read the machine-readable inventory
    const inventoryPath = path.resolve('docs', 'integrations', 'integration-inventory.json');
    let inventoryData: any = {};
    if (fs.existsSync(inventoryPath)) {
      inventoryData = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
    }

    // 2. Fetch live masked status for all inventory environment variables
    const allEnvVars = new Set<string>();
    if (Array.isArray(inventoryData.integrations)) {
      for (const item of inventoryData.integrations) {
        if (Array.isArray(item.envVariables)) {
          item.envVariables.forEach((v: string) => allEnvVars.add(v));
        }
      }
    }

    const variableStatuses = credentialVault.getVariableStatus(Array.from(allEnvVars));

    // Augment integrations with live configuration indicators (NO raw secrets)
    const augmentedIntegrations = (inventoryData.integrations || []).map((item: any) => {
      const vars = item.envVariables || [];
      const configuredCount = vars.filter((v: string) => variableStatuses[v]?.isConfigured).length;
      const totalVars = vars.length;

      let runtimeStatus = item.status;
      if (totalVars > 0 && configuredCount === totalVars) {
        runtimeStatus = item.status === 'VERIFIED' ? 'VERIFIED' : 'CONFIGURED';
      } else if (configuredCount > 0) {
        runtimeStatus = 'CONFIGURED_PARTIAL';
      }

      return {
        ...item,
        runtimeStatus,
        configuredVariables: vars.map((v: string) => ({
          key: v,
          exists: variableStatuses[v]?.exists || false,
          isConfigured: variableStatuses[v]?.isConfigured || false,
          masked: variableStatuses[v]?.masked || '[NOT_SET]',
        })),
      };
    });

    // 3. Read latest test results if available
    let latestTestResults: any = null;
    const testResultsPath = path.resolve('docs', 'integrations', 'test-results.json');
    if (fs.existsSync(testResultsPath)) {
      try {
        latestTestResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
      } catch {}
    }

    // 4. Fetch recent audit logs
    const recentAuditLogs = auditLogger.getRecentLogs(25);

    return NextResponse.json({
      success: true,
      summary: inventoryData.summary || {},
      integrations: augmentedIntegrations,
      latestTestResults,
      recentAuditLogs,
    });
  } catch (error: any) {
    const status = error.statusCode || (error.message?.includes('Super Admin') ? 403 : 500);
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireSuperAdmin(req);
    const body = await req.json();
    const { action, providerId, credentials, allowOverwrite } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action parameter is required.' }, { status: 400 });
    }

    // ACTION: VERIFY_ALL
    if (action === 'VERIFY_ALL') {
      const results = await adapterRegistry.verifyAll();
      return NextResponse.json({
        success: true,
        action,
        results,
        passed: results.filter((r) => r.success).length,
        total: results.length,
      });
    }

    // ACTION: VERIFY_PROVIDER
    if (action === 'VERIFY_PROVIDER') {
      if (!providerId) {
        return NextResponse.json({ success: false, error: 'providerId is required.' }, { status: 400 });
      }
      const adapter = adapterRegistry.getAdapter(providerId);
      if (!adapter) {
        return NextResponse.json({ success: false, error: `No adapter found for provider '${providerId}'` }, { status: 404 });
      }

      const result = await adapter.verifyCredentials(credentials || {});
      auditLogger.log({
        actor: 'SUPER_ADMIN',
        action: result.success ? 'VERIFICATION_PASSED' : 'VERIFICATION_FAILED',
        providerId,
        variableNames: [],
        status: result.success ? 'SUCCESS' : 'FAILURE',
        details: { adminEmail: admin.email, message: result.message },
      });

      return NextResponse.json({ success: true, result });
    }

    // ACTION: STAGE_CREDENTIALS
    if (action === 'STAGE_CREDENTIALS') {
      if (!providerId || !credentials || typeof credentials !== 'object') {
        return NextResponse.json({ success: false, error: 'providerId and credentials object are required.' }, { status: 400 });
      }

      const stagingResult = credentialVault.applyCredentials(credentials, {
        providerId,
        allowOverwrite: !!allowOverwrite,
      });

      return NextResponse.json({
        success: stagingResult.success,
        backupCreated: !!stagingResult.backupPath,
        changes: stagingResult.changes,
        message: stagingResult.message,
      });
    }

    // ACTION: LAUNCH_SUPERVISED_ONBOARDING
    if (action === 'LAUNCH_SUPERVISED_ONBOARDING') {
      if (!providerId) {
        return NextResponse.json({ success: false, error: 'providerId is required.' }, { status: 400 });
      }
      const adapter = adapterRegistry.getAdapter(providerId);
      if (!adapter) {
        return NextResponse.json({ success: false, error: `No adapter registered for '${providerId}'` }, { status: 404 });
      }

      // Launch supervised browser session
      const session = await browserManager.launchSupervisedSession(
        {
          providerId,
          headless: false,
          requireExplicitApproval: true,
        },
        true // Explicitly approved by authenticated Super Admin
      );

      await browserManager.navigateToPortal(session, adapter.metadata.portalUrl);

      return NextResponse.json({
        success: true,
        sessionId: session.sessionId,
        portalUrl: adapter.metadata.portalUrl,
        steps: adapter.getOnboardingSteps(),
        message: `Supervised onboarding session launched for ${adapter.metadata.serviceName}. Check the browser window.`,
      });
    }

    return NextResponse.json({ success: false, error: `Unknown action '${action}'` }, { status: 400 });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
