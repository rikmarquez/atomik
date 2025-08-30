"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderIdentityAreas = exports.deleteIdentityArea = exports.updateIdentityArea = exports.createIdentityArea = exports.getIdentityArea = exports.getIdentityAreas = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
// Validation schemas
const createIdentityAreaSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    description: zod_1.z.string().optional(),
    color: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').optional(),
    order: zod_1.z.number().int().min(0).optional(),
});
const updateIdentityAreaSchema = createIdentityAreaSchema.partial();
/**
 * Get all identity areas for the authenticated user
 */
const getIdentityAreas = async (req, res) => {
    try {
        const userId = req.user.id;
        const identityAreas = await prisma.identityArea.findMany({
            where: {
                userId,
                isActive: true,
            },
            include: {
                systems: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        name: true,
                        isActive: true,
                    },
                },
                goals: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        title: true,
                        targetValue: true,
                        currentValue: true,
                        unit: true,
                        goalType: true,
                        targetDate: true,
                        isAchieved: true,
                        color: true,
                        order: true,
                    },
                    orderBy: [
                        { order: 'asc' },
                        { createdAt: 'desc' },
                    ],
                },
                _count: {
                    select: {
                        systems: {
                            where: { isActive: true },
                        },
                        goals: {
                            where: { isActive: true },
                        },
                    },
                },
            },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' },
            ],
        });
        const response = {
            success: true,
            data: identityAreas,
            message: 'Identity areas retrieved successfully',
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching identity areas:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch identity areas',
            code: 'FETCH_ERROR',
        });
    }
};
exports.getIdentityAreas = getIdentityAreas;
/**
 * Get a single identity area by ID
 */
const getIdentityArea = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const identityArea = await prisma.identityArea.findFirst({
            where: {
                id,
                userId,
                isActive: true,
            },
            include: {
                systems: {
                    where: { isActive: true },
                    orderBy: [
                        { order: 'asc' },
                        { createdAt: 'desc' },
                    ],
                },
                _count: {
                    select: {
                        systems: {
                            where: { isActive: true },
                        },
                    },
                },
            },
        });
        if (!identityArea) {
            return res.status(404).json({
                success: false,
                error: 'Identity area not found',
                code: 'NOT_FOUND',
            });
        }
        const response = {
            success: true,
            data: identityArea,
            message: 'Identity area retrieved successfully',
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching identity area:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch identity area',
            code: 'FETCH_ERROR',
        });
    }
};
exports.getIdentityArea = getIdentityArea;
/**
 * Create a new identity area
 */
const createIdentityArea = async (req, res) => {
    try {
        const userId = req.user.id;
        // Validate request body
        const validation = createIdentityAreaSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(422).json({
                success: false,
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: validation.error.errors,
            });
        }
        const { name, description, color, order } = validation.data;
        // Check for unique name per user
        const existingArea = await prisma.identityArea.findFirst({
            where: {
                userId,
                name,
                isActive: true,
            },
        });
        if (existingArea) {
            return res.status(409).json({
                success: false,
                error: 'An identity area with this name already exists',
                code: 'DUPLICATE_NAME',
            });
        }
        // Determine order if not provided
        let finalOrder = order;
        if (finalOrder === undefined) {
            const maxOrder = await prisma.identityArea.findFirst({
                where: { userId, isActive: true },
                orderBy: { order: 'desc' },
                select: { order: true },
            });
            finalOrder = (maxOrder?.order ?? -1) + 1;
        }
        const identityArea = await prisma.identityArea.create({
            data: {
                userId,
                name,
                description,
                color: color || '#3B82F6',
                order: finalOrder,
            },
            include: {
                _count: {
                    select: {
                        systems: {
                            where: { isActive: true },
                        },
                    },
                },
            },
        });
        const response = {
            success: true,
            data: identityArea,
            message: 'Identity area created successfully',
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating identity area:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create identity area',
            code: 'CREATE_ERROR',
        });
    }
};
exports.createIdentityArea = createIdentityArea;
/**
 * Update an identity area
 */
const updateIdentityArea = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        // Validate request body
        const validation = updateIdentityAreaSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(422).json({
                success: false,
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: validation.error.errors,
            });
        }
        const updates = validation.data;
        // Check if identity area exists and belongs to user
        const existingArea = await prisma.identityArea.findFirst({
            where: {
                id,
                userId,
                isActive: true,
            },
        });
        if (!existingArea) {
            return res.status(404).json({
                success: false,
                error: 'Identity area not found',
                code: 'NOT_FOUND',
            });
        }
        // Check for unique name if name is being updated
        if (updates.name && updates.name !== existingArea.name) {
            const duplicateArea = await prisma.identityArea.findFirst({
                where: {
                    userId,
                    name: updates.name,
                    isActive: true,
                    id: { not: id },
                },
            });
            if (duplicateArea) {
                return res.status(409).json({
                    success: false,
                    error: 'An identity area with this name already exists',
                    code: 'DUPLICATE_NAME',
                });
            }
        }
        const identityArea = await prisma.identityArea.update({
            where: { id },
            data: updates,
            include: {
                systems: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        name: true,
                        isActive: true,
                    },
                },
                _count: {
                    select: {
                        systems: {
                            where: { isActive: true },
                        },
                    },
                },
            },
        });
        const response = {
            success: true,
            data: identityArea,
            message: 'Identity area updated successfully',
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error updating identity area:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update identity area',
            code: 'UPDATE_ERROR',
        });
    }
};
exports.updateIdentityArea = updateIdentityArea;
/**
 * Delete an identity area (soft delete)
 */
const deleteIdentityArea = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        // Check if identity area exists and belongs to user
        const existingArea = await prisma.identityArea.findFirst({
            where: {
                id,
                userId,
                isActive: true,
            },
            include: {
                _count: {
                    select: {
                        systems: {
                            where: { isActive: true },
                        },
                    },
                },
            },
        });
        if (!existingArea) {
            return res.status(404).json({
                success: false,
                error: 'Identity area not found',
                code: 'NOT_FOUND',
            });
        }
        // Check if there are active systems linked to this area
        if (existingArea._count.systems > 0) {
            return res.status(409).json({
                success: false,
                error: 'Cannot delete identity area with active systems. Please delete or reassign systems first.',
                code: 'HAS_ACTIVE_SYSTEMS',
            });
        }
        // Soft delete the identity area
        await prisma.identityArea.update({
            where: { id },
            data: { isActive: false },
        });
        const response = {
            success: true,
            data: null,
            message: 'Identity area deleted successfully',
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error deleting identity area:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete identity area',
            code: 'DELETE_ERROR',
        });
    }
};
exports.deleteIdentityArea = deleteIdentityArea;
/**
 * Reorder identity areas
 */
const reorderIdentityAreas = async (req, res) => {
    try {
        const userId = req.user.id;
        const validation = zod_1.z.object({
            areas: zod_1.z.array(zod_1.z.object({
                id: zod_1.z.string().cuid(),
                order: zod_1.z.number().int().min(0),
            })).min(1, 'At least one area is required'),
        }).safeParse(req.body);
        if (!validation.success) {
            return res.status(422).json({
                success: false,
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: validation.error.errors,
            });
        }
        const { areas } = validation.data;
        // Verify all areas belong to the user
        const userAreas = await prisma.identityArea.findMany({
            where: {
                userId,
                id: { in: areas.map(a => a.id) },
                isActive: true,
            },
            select: { id: true },
        });
        if (userAreas.length !== areas.length) {
            return res.status(404).json({
                success: false,
                error: 'One or more identity areas not found',
                code: 'NOT_FOUND',
            });
        }
        // Update order for each area
        await Promise.all(areas.map(area => prisma.identityArea.update({
            where: { id: area.id },
            data: { order: area.order },
        })));
        // Fetch updated areas
        const updatedAreas = await prisma.identityArea.findMany({
            where: {
                userId,
                isActive: true,
            },
            include: {
                _count: {
                    select: {
                        systems: {
                            where: { isActive: true },
                        },
                    },
                },
            },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' },
            ],
        });
        const response = {
            success: true,
            data: updatedAreas,
            message: 'Identity areas reordered successfully',
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error reordering identity areas:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reorder identity areas',
            code: 'REORDER_ERROR',
        });
    }
};
exports.reorderIdentityAreas = reorderIdentityAreas;
