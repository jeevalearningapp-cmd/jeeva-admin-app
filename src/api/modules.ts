import { supabase } from '@/lib/supabase'
import { Module, CreateModuleInput, UpdateModuleInput } from '@/types/content'

const mapToModule = (data: any): Module => ({
  id: data.id,
  title: data.title,
  description: data.description,
  thumbnailUrl: data.thumbnail_url,
  isActive: data.is_active,
  displayOrder: data.display_order,
  createdAt: data.created_at,
  updatedAt: data.updated_at
})

export const modulesAPI = {
  async getAll(): Promise<Module[]> {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data || []).map(mapToModule)
  },

  async getById(id: string): Promise<Module> {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return mapToModule(data)
  },

  async create(input: CreateModuleInput): Promise<Module> {
    const { data, error } = await supabase
      .from('modules')
      .insert([{
        title: input.title,
        description: input.description,
        thumbnail_url: input.thumbnailUrl,
        is_active: input.isActive ?? true,
        display_order: input.displayOrder ?? 0
      }])
      .select()
      .single()

    if (error) throw error
    return mapToModule(data)
  },

  async update(id: string, input: UpdateModuleInput): Promise<Module> {
    const updateData: any = {}
    if (input.title !== undefined) updateData.title = input.title
    if (input.description !== undefined) updateData.description = input.description
    if (input.thumbnailUrl !== undefined) updateData.thumbnail_url = input.thumbnailUrl
    if (input.isActive !== undefined) updateData.is_active = input.isActive
    if (input.displayOrder !== undefined) updateData.display_order = input.displayOrder

    const { data, error } = await supabase
      .from('modules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapToModule(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async uploadThumbnail(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('module-thumbnails')
      .upload(fileName, file)

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('module-thumbnails')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }
}
