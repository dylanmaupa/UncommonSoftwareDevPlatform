/**
 * submissions.queries.js
 *
 * Reusable Mongoose queries for the instructor dashboard.
 * All queries use .populate() to hydrate references with actual documents.
 *
 * Usage:
 *   import { getPendingSubmissions } from './submissions.queries.js';
 *   const subs = await getPendingSubmissions(instructorId);
 */

import Submission from '../models/Submission.model.js';
import Assignment from '../models/Assignment.model.js';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Get ALL pending submissions for a specific instructor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches every submission with status 'pending' that belongs to an
 * assignment created by the given instructor.
 *
 * Uses a two-step approach:
 *   Step 1 → Find all assignment IDs owned by this instructor
 *   Step 2 → Find pending submissions for those assignments, .populate() in
 *            the student and assignment details
 *
 * @param {string} instructorId  — The instructor's User _id
 * @param {object} [options]
 * @param {number} [options.limit=50]  — Max results
 * @param {number} [options.skip=0]    — Pagination offset
 * @returns {Promise<Array>} — Fully populated submission documents
 */
export async function getPendingSubmissions(instructorId, options = {}) {
  const { limit = 50, skip = 0 } = options;

  // Step 1: Get all assignment IDs belonging to this instructor
  const instructorAssignmentIds = await Assignment
    .find({ instructor: instructorId })
    .select('_id')
    .lean()
    .then(docs => docs.map(d => d._id));

  if (instructorAssignmentIds.length === 0) {
    return []; // Instructor has no assignments → no submissions possible
  }

  // Step 2: Fetch pending submissions with full population
  const pendingSubmissions = await Submission
    .find({
      assignment: { $in: instructorAssignmentIds },
      status: 'pending',
    })
    .populate({
      path: 'student',
      select: 'full_name email avatar hub_location',   // Only the fields we need
    })
    .populate({
      path: 'assignment',
      select: 'title description type difficulty module codeConfig.language deadline',
    })
    .populate({
      path: 'feedbackComments.author',
      select: 'full_name email',
    })
    .sort({ submittedAt: -1 })   // Newest first
    .skip(skip)
    .limit(limit)
    .lean();                     // Plain JS objects (faster, no Mongoose overhead)

  return pendingSubmissions;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Get ALL submissions for an instructor (any status) with optional filter
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} instructorId
 * @param {object} [filters]
 * @param {string} [filters.status]      — 'pending' | 'approved' | 'rejected' | 'all'
 * @param {string} [filters.type]        — 'written' | 'code' (filters by assignment type)
 * @param {number} [filters.limit=50]
 * @param {number} [filters.skip=0]
 */
export async function getInstructorSubmissions(instructorId, filters = {}) {
  const { status = 'all', type, limit = 50, skip = 0 } = filters;

  // Build assignment query
  const assignmentQuery = { instructor: instructorId };
  if (type) assignmentQuery.type = type;

  const assignmentIds = await Assignment
    .find(assignmentQuery)
    .select('_id')
    .lean()
    .then(docs => docs.map(d => d._id));

  if (assignmentIds.length === 0) return [];

  // Build submission query
  const submissionQuery = { assignment: { $in: assignmentIds } };
  if (status !== 'all') submissionQuery.status = status;

  return Submission
    .find(submissionQuery)
    .populate({
      path: 'student',
      select: 'full_name email avatar',
    })
    .populate({
      path: 'assignment',
      select: 'title type difficulty module codeConfig.language',
    })
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Get a single submission by ID (fully populated for the review page)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} submissionId
 */
export async function getSubmissionById(submissionId) {
  return Submission
    .findById(submissionId)
    .populate({
      path: 'student',
      select: 'full_name email avatar hub_location',
    })
    .populate({
      path: 'assignment',
      select: 'title description type difficulty module codeConfig writtenConfig deadline instructor',
    })
    .populate({
      path: 'feedbackComments.author',
      select: 'full_name email',
    })
    .populate({
      path: 'gradedBy',
      select: 'full_name email',
    })
    .lean();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Count pending submissions (for the dashboard badge)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} instructorId
 * @returns {Promise<number>}
 */
export async function countPendingSubmissions(instructorId) {
  const assignmentIds = await Assignment
    .find({ instructor: instructorId })
    .select('_id')
    .lean()
    .then(docs => docs.map(d => d._id));

  if (assignmentIds.length === 0) return 0;

  return Submission.countDocuments({
    assignment: { $in: assignmentIds },
    status: 'pending',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Express controller example — wire into your routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Example Express handler:
 *
 *   GET /api/instructor/submissions?status=pending&type=code&limit=20&skip=0
 *
 * Expects `req.user._id` to be the authenticated instructor.
 */
export async function handleGetSubmissions(req, res) {
  try {
    const instructorId = req.user._id;   // from auth middleware
    const { status, type, limit, skip } = req.query;

    const submissions = await getInstructorSubmissions(instructorId, {
      status: status || 'all',
      type: type || undefined,
      limit: parseInt(limit) || 50,
      skip:  parseInt(skip)  || 0,
    });

    const pendingCount = await countPendingSubmissions(instructorId);

    return res.status(200).json({
      submissions,
      pendingCount,
      total: submissions.length,
    });
  } catch (err) {
    console.error('[Submissions] Error fetching submissions:', err);
    return res.status(500).json({ error: 'Failed to load submissions.' });
  }
}
