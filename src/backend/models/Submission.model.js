/**
 * Submission.model.js
 *
 * Mongoose schema for student Submissions.
 * Links to Student (User) and Assignment, stores the student's content,
 * tab-switch count (written tasks), instructor grade, and feedback.
 *
 * Usage:
 *   import Submission from './Submission.model.js';
 *   const sub = await Submission.create({ ... });
 */

import { Schema, model } from 'mongoose';

// ── Feedback sub-schema (instructor comments) ───────────────────────────────

const FeedbackCommentSchema = new Schema(
  {
    /** The instructor who left the comment */
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    /** Markdown-formatted comment text */
    text: {
      type: String,
      required: true,
      trim: true,
    },

    /** Optional: line number reference (for code reviews) */
    lineNumber: {
      type: Number,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

// ── Submission Schema ────────────────────────────────────────────────────────

const SubmissionSchema = new Schema(
  {
    // ─── References ─────────────────────────────────────────────────────────
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },

    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment reference is required'],
      index: true,
    },

    // ─── Content ────────────────────────────────────────────────────────────
    /**
     * The actual student submission:
     *   - For 'written' assignments → the essay text
     *   - For 'code' assignments   → the source code
     */
    content: {
      type: String,
      required: [true, 'Submission content is required'],
    },

    /** Which language the code was written in (code submissions only) */
    language: {
      type: String,
      enum: ['python', 'javascript', 'typescript', 'java', 'c', 'cpp', 'go', 'rust'],
      default: null,
    },

    // ─── Academic integrity tracking ────────────────────────────────────────
    /**
     * Number of times the student switched away from the browser tab.
     * Tracked via document.visibilityState on the client.
     * Primarily for 'written' tasks, but stored for any submission type.
     */
    tabSwitchCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    /** Total time spent (ms) from first keystroke to submission */
    timeSpentMs: {
      type: Number,
      min: 0,
      default: null,
    },

    // ─── Grading ────────────────────────────────────────────────────────────
    /** Numeric grade 0–100.  null = not yet graded */
    grade: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    /**
     * Submission lifecycle:
     *   pending    → student has submitted, awaiting review
     *   reviewed   → instructor has viewed but not finalised
     *   approved   → instructor approved with a grade
     *   rejected   → instructor requested revision
     *   resubmitted→ student resubmitted after rejection
     */
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'approved', 'rejected', 'resubmitted'],
      default: 'pending',
      index: true,
    },

    // ─── Feedback / comments ────────────────────────────────────────────────
    /**
     * Array of instructor feedback comments.
     * Each entry has: author (instructor), text (markdown), optional lineNumber.
     */
    feedbackComments: {
      type: [FeedbackCommentSchema],
      default: [],
    },

    /** Primary / summary feedback (markdown) shown to the student */
    feedbackSummary: {
      type: String,
      trim: true,
      default: '',
    },

    // ─── Code execution results (code submissions only) ─────────────────────
    lastRunResult: {
      stdout: { type: String, default: '' },
      stderr: { type: String, default: '' },
      exitCode: { type: Number, default: null },
      executionTimeMs: { type: Number, default: null },
    },

    // ─── Submission metadata ────────────────────────────────────────────────
    submittedAt: {
      type: Date,
      default: Date.now,
    },

    gradedAt: {
      type: Date,
      default: null,
    },

    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  },
);

// ── Compound indexes ─────────────────────────────────────────────────────────
SubmissionSchema.index({ assignment: 1, status: 1 });
SubmissionSchema.index({ student: 1, assignment: 1 });
SubmissionSchema.index({ status: 1, submittedAt: -1 });

// ── Prevent duplicate submissions (one active per student+assignment) ────────
SubmissionSchema.index(
  { student: 1, assignment: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'reviewed'] },
    },
  },
);

// ── Virtuals ─────────────────────────────────────────────────────────────────
SubmissionSchema.virtual('isPending').get(function () {
  return this.status === 'pending';
});

SubmissionSchema.virtual('isGraded').get(function () {
  return this.grade !== null;
});

SubmissionSchema.virtual('letterGrade').get(function () {
  if (this.grade === null || this.grade === undefined) return null;
  if (this.grade >= 90) return 'A';
  if (this.grade >= 80) return 'B';
  if (this.grade >= 70) return 'C';
  if (this.grade >= 60) return 'D';
  return 'F';
});

SubmissionSchema.set('toJSON', { virtuals: true });
SubmissionSchema.set('toObject', { virtuals: true });

// ── Export ────────────────────────────────────────────────────────────────────
const Submission = model('Submission', SubmissionSchema);
export default Submission;
