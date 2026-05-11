import { Router } from 'express'
import expertController from '../controllers/ExpertController.js'
import { authenticate } from '../middleware/auth.js'
import { validateTenant } from '../middleware/tenant.js'

const router = Router()

router.post(
  '/',
  authenticate,
  validateTenant,
  (req, res) => expertController.create(req, res)
)

router.get(
  '/',
  authenticate,
  validateTenant,
  (req, res) => expertController.getByTenant(req, res)
)

router.get(
  '/all',
  authenticate,
  (req, res) => expertController.getAll(req, res)
)

router.get(
  '/presets',
  authenticate,
  (req, res) => expertController.getPresets(req, res)
)

router.get(
  '/my-tenant',
  authenticate,
  validateTenant,
  (req, res) => expertController.getAllForTenant(req, res)
)

router.get(
  '/:id',
  authenticate,
  (req, res) => expertController.getById(req, res)
)

router.put(
  '/:id',
  authenticate,
  validateTenant,
  (req, res) => expertController.update(req, res)
)

router.delete(
  '/:id',
  authenticate,
  validateTenant,
  (req, res) => expertController.delete(req, res)
)

export default router
