/**
 * src/routes/storage.js
 *
 * POST   /api/storage/upload        — upload a file (multipart/form-data)
 * GET    /api/storage/signed/:path* — get a signed URL
 * DELETE /api/storage/:path*        — delete a file
 *
 * Note: For large file uploads in production, use Supabase Storage directly
 * from the frontend with a signed upload URL instead of proxying through here.
 */

import { Router } from 'express'
import { storageService } from '../services/storageService.js'
import { requireAuth }    from '../middleware/auth.js'
import { ok, created }    from '../utils/response.js'
import { ApiError }       from '../utils/errors.js'

const router = Router()
router.use(requireAuth)

/**
 * Upload — expects raw body with headers:
 *   Content-Type: image/jpeg  (or other mime)
 *   X-File-Path:  students/abc123.jpg
 */
router.post('/upload', async (req, res) => {
  const path     = req.headers['x-file-path']
  const mimeType = req.headers['content-type']

  if (!path)     throw new ApiError('X-File-Path header is required', 400)
  if (!mimeType) throw new ApiError('Content-Type header is required', 400)

  // Collect raw body buffer
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const buffer = Buffer.concat(chunks)

  const data = await storageService.upload(path, buffer, mimeType)
  created(res, data)
})

// Get signed URL — path captured as wildcard
router.get('/signed/*', async (req, res) => {
  const path      = req.params[0]
  const expiresIn = Number(req.query.expiresIn) || 3600
  const url = await storageService.getSignedUrl(path, expiresIn)
  ok(res, { url })
})

// Delete file
router.delete('/*', async (req, res) => {
  const path = req.params[0]
  await storageService.remove(path)
  ok(res, { deleted: path })
})

export default router
