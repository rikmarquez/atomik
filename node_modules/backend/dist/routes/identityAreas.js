"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const identityAreas_1 = require("../controllers/identityAreas");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authMiddleware);
// GET /api/v1/identity-areas - Get all identity areas for user
router.get('/', identityAreas_1.getIdentityAreas);
// GET /api/v1/identity-areas/:id - Get specific identity area
router.get('/:id', identityAreas_1.getIdentityArea);
// POST /api/v1/identity-areas - Create new identity area
router.post('/', identityAreas_1.createIdentityArea);
// PUT /api/v1/identity-areas/:id - Update identity area
router.put('/:id', identityAreas_1.updateIdentityArea);
// DELETE /api/v1/identity-areas/:id - Delete identity area (soft delete)
router.delete('/:id', identityAreas_1.deleteIdentityArea);
// POST /api/v1/identity-areas/reorder - Reorder identity areas
router.post('/reorder', identityAreas_1.reorderIdentityAreas);
exports.default = router;
