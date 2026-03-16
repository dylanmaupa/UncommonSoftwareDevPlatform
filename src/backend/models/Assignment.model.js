/**
 * Assignment.model.js
 *
 * Mongoose schema for Assignments.
 * Supports two types: 'written' (essay / long-form) and 'code' (coding / debugging).
 *
 * Usage:
 *   import Assignment from './Assignment.model.js';
 *   const hw = await Assignment.create({ ... });
 */

import { Schema, model } from 'mongoose';

// ── Assignment Schema ────────────────────────────────────────────────────────

const AssignmentSchema = new Schema(
  {
    // ─── Core fields ────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },

    /**
     * Assignment type discriminator.
     *   'written' → student submits prose text (paste/copy disabled, tab-switches tracked)
     *   'code'    → student submits source code (Monaco editor, Piston execution)
     */
    type: {
      type: String,
      required: true,
      enum: {
        values: ['written', 'code'],
        message: 'Type must be either "written" or "code"',
      },
    },

    // ─── Instructor who created this assignment ─────────────────────────────
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor reference is required'],
      index: true,
    },

    // ─── Course / module context ────────────────────────────────────────────
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },

    module: {
      type: String,
      trim: true,
      default: '',
    },

    // ─── Difficulty & XP ────────────────────────────────────────────────────
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },

    xpReward: {
      type: Number,
      min: 0,
      max: 10000,
      default: 100,
    },

    // ─── Code-specific config (only relevant when type === 'code') ──────────
    codeConfig: {
      /** Language the student must use */
      language: {
        type: String,
        enum: ['python', 'javascript', 'typescript', 'java', 'c', 'cpp', 'go', 'rust'],
        default: 'python',
      },

      /** Starter / boilerplate code shown in the editor */
      starterCode: {
        type: String,
        default: '',
      },

      /** Optional automated test cases (JSON or script) */
      testCases: {
        type: String,
        default: '',
      },
    },

    // ─── Written-specific config (only relevant when type === 'written') ────
    writtenConfig: {
      /** Maximum character limit for the essay */
      maxCharacters: {
        type: Number,
        min: 100,
        max: 50000,
        default: 5000,
      },

      /** Whether paste/copy is blocked during submission */
      disablePaste: {
        type: Boolean,
        default: true,
      },

      /** Whether tab-switch tracking is enabled */
      trackFocusLoss: {
        type: Boolean,
        default: true,
      },
    },

    // ─── Scheduling ─────────────────────────────────────────────────────────
    deadline: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  },
);

// ── Indexes ──────────────────────────────────────────────────────────────────
AssignmentSchema.index({ instructor: 1, status: 1 });
AssignmentSchema.index({ course: 1, status: 1 });
AssignmentSchema.index({ type: 1 });

// ── Virtual: submission count (populated separately) ─────────────────────────
AssignmentSchema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'assignment',
  count: true,
});

AssignmentSchema.set('toJSON', { virtuals: true });
AssignmentSchema.set('toObject', { virtuals: true });

// ── Export ────────────────────────────────────────────────────────────────────
const Assignment = model('Assignment', AssignmentSchema);
export default Assignment;
