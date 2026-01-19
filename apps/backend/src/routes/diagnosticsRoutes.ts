/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from 'express';
import type { Request, Response } from 'express';
import { isBrevoConfigured, getDefaultSender } from '../config/brevo.js';

const router = Router();

/**
 * GET /api/diagnostics/brevo
 * Check Brevo email service configuration
 *
 * This endpoint helps diagnose email sending issues by checking:
 * - If environment variables are properly set
 * - If Brevo is configured
 * - What sender information is being used
 */
router.get('/brevo', (_req: Request, res: Response) => {
  const configured = isBrevoConfigured();
  const sender = configured ? getDefaultSender() : null;

  const diagnostics = {
    timestamp: new Date().toISOString(),
    brevoConfigured: configured,
    environmentVariables: {
      BREVO_API_KEY: {
        set: !!process.env.BREVO_API_KEY,
        length: process.env.BREVO_API_KEY?.length || 0,
        startsWithCorrectPrefix:
          process.env.BREVO_API_KEY?.startsWith('xkeysib-') || false,
        preview:
          process.env.BREVO_API_KEY?.substring(0, 15) + '...' || '(not set)',
      },
      BREVO_SENDER_EMAIL: {
        set: !!process.env.BREVO_SENDER_EMAIL,
        value: process.env.BREVO_SENDER_EMAIL || '(not set)',
        isValidEmail: /@/.test(process.env.BREVO_SENDER_EMAIL || ''),
      },
      BREVO_SENDER_NAME: {
        set: !!process.env.BREVO_SENDER_NAME,
        value: process.env.BREVO_SENDER_NAME || '(not set)',
      },
    },
    sender: sender
      ? {
          email: sender.email,
          name: sender.name,
        }
      : null,
    status: configured ? 'ready' : 'misconfigured',
    issues: [] as string[],
  };

  // Identify specific issues
  if (!process.env.BREVO_API_KEY) {
    diagnostics.issues.push('BREVO_API_KEY environment variable is not set');
  } else if (!process.env.BREVO_API_KEY.startsWith('xkeysib-')) {
    diagnostics.issues.push(
      'BREVO_API_KEY does not start with "xkeysib-" - may be invalid'
    );
  }

  if (!process.env.BREVO_SENDER_EMAIL) {
    diagnostics.issues.push(
      'BREVO_SENDER_EMAIL environment variable is not set'
    );
  } else if (!/@/.test(process.env.BREVO_SENDER_EMAIL)) {
    diagnostics.issues.push('BREVO_SENDER_EMAIL is not a valid email address');
  }

  if (!process.env.BREVO_SENDER_NAME) {
    diagnostics.issues.push(
      'BREVO_SENDER_NAME environment variable is not set'
    );
  }

  // Set appropriate status code
  const statusCode = configured ? 200 : 503; // 503 Service Unavailable if not configured

  res.status(statusCode).json(diagnostics);
});

/**
 * GET /api/diagnostics/env
 * Check all environment variables (sanitized)
 */
router.get('/env', (_req: Request, res: Response) => {
  const sanitizedEnv: Record<string, any> = {};

  // List of sensitive keys that should be partially masked
  const sensitiveKeys = [
    'API_KEY',
    'SECRET',
    'PASSWORD',
    'TOKEN',
    'MONGODB_URI',
    'CLOUDINARY',
  ];

  for (const [key, value] of Object.entries(process.env)) {
    if (!value) {
      sanitizedEnv[key] = '(not set)';
      continue;
    }

    // Check if key contains sensitive information
    const isSensitive = sensitiveKeys.some((pattern) => key.includes(pattern));

    if (isSensitive) {
      // Mask sensitive values but show first few characters
      if (value.length > 20) {
        sanitizedEnv[key] =
          `${value.substring(0, 15)}...***[${value.length} chars]`;
      } else {
        sanitizedEnv[key] = '***[' + value.length + ' chars]';
      }
    } else {
      sanitizedEnv[key] = value;
    }
  }

  res.json({
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    totalVariables: Object.keys(process.env).length,
    environment: sanitizedEnv,
  });
});

/**
 * GET /api/diagnostics/health
 * Overall health check including all services
 */
router.get('/health', (_req: Request, res: Response) => {
  const health = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {
      email: {
        configured: isBrevoConfigured(),
        status: isBrevoConfigured() ? 'operational' : 'misconfigured',
      },
      database: {
        // You can add MongoDB connection check here
        status: 'unknown',
      },
      cloudinary: {
        configured: !!(
          process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY
        ),
        status:
          process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY
            ? 'operational'
            : 'misconfigured',
      },
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version,
  };

  // Overall status is unhealthy if email is not configured
  if (!isBrevoConfigured()) {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
