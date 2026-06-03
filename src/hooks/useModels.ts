import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface ModelRecord {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  public_url: string;
  created_at: string;
}

export function useModels() {
  const [models, setModels] = useState<ModelRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  // 1. Fetch all models for the logged-in user
  const fetchMyModels = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchErr } = await supabase
        .from('models')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchErr) throw fetchErr
      setModels(data || [])
    } catch (err: any) {
      console.error('Error fetching models:', err)
      setError(err.message || 'Failed to fetch models')
    } finally {
      setLoading(false)
    }
  }, [])

  // 2. Fetch a single model (public access - used by the Viewer page)
  const fetchModelById = useCallback(async (id: string): Promise<ModelRecord | null> => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchErr } = await supabase
        .from('models')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchErr) throw fetchErr
      return data
    } catch (err: any) {
      console.error(`Error fetching model with ID ${id}:`, err)
      setError(err.message || 'Failed to fetch model')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // 3. Upload model file to storage and insert DB record (with progress tracking & type/size validations)
  const uploadModel = useCallback(async (file: File, userId: string): Promise<ModelRecord | null> => {
    setLoading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Validate file type
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (fileExt !== 'glb' && fileExt !== 'gltf') {
        throw new Error('Invalid file type. Only .glb and .gltf files are allowed.')
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error('File exceeds the maximum limit of 50MB.')
      }

      // Generate storage path: ${userId}/${crypto.randomUUID()}-${fileName}
      const storagePath = `${userId}/${crypto.randomUUID()}-${file.name}`

      // Upload file to the 'models' bucket with progress tracking callback
      const { error: uploadErr } = await supabase.storage
        .from('models')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress: any) => {
            const percent = Math.round((progress.loaded / progress.total) * 100)
            setUploadProgress(percent)
          }
        } as any)

      if (uploadErr) throw uploadErr

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('models')
        .getPublicUrl(storagePath)

      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to retrieve public URL for uploaded model.')
      }

      // Insert record into PostgreSQL 'models' table
      const { data: dbData, error: dbErr } = await supabase
        .from('models')
        .insert({
          user_id: userId,
          file_name: file.name,
          storage_path: storagePath,
          public_url: urlData.publicUrl,
        })
        .select()
        .single()

      if (dbErr) {
        // Rollback storage upload on database write failure
        await supabase.storage.from('models').remove([storagePath])
        throw dbErr
      }

      // Update state
      setModels((prev) => [dbData, ...prev])
      return dbData
    } catch (err: any) {
      console.error('Error uploading model:', err)
      setError(err.message || 'Failed to upload model')
      return null
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }, [])

  // 4. Delete model file from storage and database
  const deleteModel = useCallback(async (model: ModelRecord): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      // Remove from database first
      const { error: dbErr } = await supabase
        .from('models')
        .delete()
        .eq('id', model.id)

      if (dbErr) throw dbErr

      // Remove from storage bucket
      const { error: storageErr } = await supabase.storage
        .from('models')
        .remove([model.storage_path])

      if (storageErr) {
        console.warn('Database record deleted, but failed to delete file in storage:', storageErr)
      }

      // Update state
      setModels((prev) => prev.filter((m) => m.id !== model.id))
      return true
    } catch (err: any) {
      console.error('Error deleting model:', err)
      setError(err.message || 'Failed to delete model')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    models,
    loading,
    error,
    uploadProgress,
    fetchMyModels,
    fetchModelById,
    uploadModel,
    deleteModel,
  }
}
