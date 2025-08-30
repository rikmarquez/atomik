"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const identityGoals_1 = require("../controllers/identityGoals");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authMiddleware);
// GET /api/v1/identity-goals - Get all identity goals for user (optionally filtered by identity area)
router.get('/', identityGoals_1.getIdentityGoals);
// GET /api/v1/identity-goals/:id - Get specific identity goal
router.get('/:id', identityGoals_1.getIdentityGoal);
// POST /api/v1/identity-goals - Create new identity goal
router.post('/', identityGoals_1.createIdentityGoal);
// PUT /api/v1/identity-goals/:id - Update identity goal
router.put('/:id', identityGoals_1.updateIdentityGoal);
// PATCH /api/v1/identity-goals/:id/progress - Update goal progress (currentValue and achievement)
router.patch('/:id/progress', identityGoals_1.updateGoalProgress);
// DELETE /api/v1/identity-goals/:id - Delete identity goal (soft delete)
router.delete('/:id', identityGoals_1.deleteIdentityGoal);
// POST /api/v1/identity-goals/reorder/:identityAreaId - Reorder goals within an identity area
router.post('/reorder/:identityAreaId', identityGoals_1.reorderIdentityGoals);
exports.default = router;
