"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const atomicSystems_1 = require("../controllers/atomicSystems");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authMiddleware);
// GET /api/v1/atomic-systems - Get all atomic systems for user (optionally filtered by identityAreaId)
router.get('/', atomicSystems_1.getAtomicSystems);
// GET /api/v1/atomic-systems/:id - Get specific atomic system
router.get('/:id', atomicSystems_1.getAtomicSystem);
// POST /api/v1/atomic-systems - Create new atomic system
router.post('/', atomicSystems_1.createAtomicSystem);
// PUT /api/v1/atomic-systems/:id - Update atomic system
router.put('/:id', atomicSystems_1.updateAtomicSystem);
// DELETE /api/v1/atomic-systems/:id - Delete atomic system (soft delete)
router.delete('/:id', atomicSystems_1.deleteAtomicSystem);
// POST /api/v1/atomic-systems/:id/execute - Execute/complete atomic system
router.post('/:id/execute', atomicSystems_1.executeAtomicSystem);
exports.default = router;
