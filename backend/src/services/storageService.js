import supabase from '../lib/supabase.js'
import { assertSupabase, ApiError } from '../utils/errors.js'

const BUCKET = 'student-photos'

export const storageService = {
  /**
   * Upload a file buffer to Supabase Storage.
   * @param {string}  path        — storage path, e.g. 'students/abc123.jpg'
   * @param {Buffer}  fileBuffer  — raw file data
   * @param {string}  mimeType    — e.g. 'image/jpeg'
   * @returns {{ path, publicUrl }}
   */
  async upload(path, fileBuffer, mimeType) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, fileBuffer, {
        contentType: mimeType,
        upsert: true, // overwrite if the file already exists
      })

    if (error) assertSupabase({ data, error }, 'storage.upload')

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return { path: data.path, publicUrl: urlData.publicUrl }
  },

  /**
   * Download a file from Supabase Storage.
   * @param {string} path  — storage path
   * @returns {Blob}
   */
  async download(path) {
    const { data, error } = await supabase.storage.from(BUCKET).download(path)
    if (error) assertSupabase({ data, error }, 'storage.download')
    return data
  },

  /**
   * Get a signed (temporary) URL for private files.
   * @param {string} path       — storage path
   * @param {number} expiresIn  — seconds until expiry (default 1 hour)
   */
  async getSignedUrl(path, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresIn)
    if (error) assertSupabase({ data, error }, 'storage.getSignedUrl')
    return data.signedUrl
  },

  /**
   * Delete a file from storage.
   * @param {string|string[]} paths  — one or multiple storage paths
   */
  async remove(paths) {
    const list = Array.isArray(paths) ? paths : [paths]
    const { data, error } = await supabase.storage.from(BUCKET).remove(list)
    if (error) assertSupabase({ data, error }, 'storage.remove')
    return data
  },

  /**
   * List all files in a folder.
   * @param {string} folder  — e.g. 'students'
   */
  async list(folder) {
    const { data, error } = await supabase.storage.from(BUCKET).list(folder)
    if (error) assertSupabase({ data, error }, 'storage.list')
    return data
  },
}
