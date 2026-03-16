/**
 * codeRunner.routes.js
 *
 * Mount this router in your Express app:
 *
 *   import codeRunnerRoutes from './routes/codeRunner.routes.js';
 *   app.use('/api/code', codeRunnerRoutes);
 *
 * This makes the endpoint available at: POST /api/code/run
 *
 * Tip: add express-rate-limit before this router in production to
 * prevent abuse, e.g.:
 *
 *   import rateLimit from 'express-rate-limit';
 *   const limiter = rateLimit({ windowMs: 60_000, max: 20 });
 *   app.use('/api/code', limiter, codeRunnerRoutes);
 */

import { Router } from 'express';
import { runCode } from '../controllers/codeRunner.controller.js';

const router = Router();

/**
 * POST /api/code/run
 *
 * Body (JSON):
 *   {
 *     code:      string  — source code to execute (required)
 *     language:  string  — 'python' | 'javascript' | 'typescript' | 'java' | 'c' | 'cpp' | 'go' | 'rust'
 *     version?:  string  — optional Piston runtime version override
 *   }
 *
 * Response (JSON):
 *   {
 *     stdout:        string   — standard output
 *     stderr:        string   — standard error (includes compile errors)
 *     exitCode:      number   — process exit code (0 = success)
 *     executionTime: number   — wall-clock milliseconds
 *     language:      string
 *     version:       string
 *   }
 */
router.post('/run', runCode);

export default router;
