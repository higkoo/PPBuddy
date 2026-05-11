import { type Response, type NextFunction } from 'express'
import tenantService from '../services/TenantService.js'
import type { AuthRequest } from './auth.js'

export const validateTenant = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const tenantId = req.user?.tenant_id

  if (!tenantId) {
    res.status(401).json({
      success: false,
      error: 'No tenant associated with user'
    })
    return
  }

  const tenant = tenantService.findById(tenantId)

  if (!tenant) {
    res.status(404).json({
      success: false,
      error: 'Tenant not found'
    })
    return
  }

  next()
}

export const validateTenantAccess = (paramName: string = 'tenant_id') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userTenantId = req.user?.tenant_id
    const paramTenantId = req.params[paramName]

    if (!userTenantId) {
      res.status(401).json({
        success: false,
        error: 'No tenant associated with user'
      })
      return
    }

    if (paramTenantId && paramTenantId !== userTenantId) {
      res.status(403).json({
        success: false,
        error: 'Access denied to this tenant'
      })
      return
    }

    next()
  }
}

export default { validateTenant, validateTenantAccess }
