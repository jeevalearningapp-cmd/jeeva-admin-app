import { supabase } from '@/lib/supabase'
import { HeroSection, CreateHeroInput, UpdateHeroInput } from '@/types/hero'

const mapToHeroSection = (data: any): HeroSection => ({
  id: data.id,
  headline: data.headline,
  subheadline: data.subheadline,
  imageUrl: data.image_url,
  buttonText: data.button_text,
  buttonLink: data.button_link,
  isActive: data.is_active,
  displayOrder: data.display_order,
  titleColor: data.title_color,
  subtitleColor: data.subtitle_color,
  buttonTextColor: data.button_text_color,
  buttonBackgroundColor: data.button_background_color,
  createdAt: data.created_at,
  updatedAt: data.updated_at
})

export const heroAPI = {
  async getAll(): Promise<HeroSection[]> {
    const { data, error } = await supabase
      .from('dashboard_hero')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data || []).map(mapToHeroSection)
  },

  async getById(id: number): Promise<HeroSection> {
    const { data, error } = await supabase
      .from('dashboard_hero')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return mapToHeroSection(data)
  },

  async create(input: CreateHeroInput): Promise<HeroSection> {
    const { data, error } = await supabase
      .from('dashboard_hero')
      .insert([{
        headline: input.headline,
        subheadline: input.subheadline,
        image_url: input.imageUrl,
        button_text: input.buttonText,
        button_link: input.buttonLink,
        is_active: input.isActive ?? true,
        display_order: input.displayOrder ?? 0,
        title_color: input.titleColor || '#FFFFFF',
        subtitle_color: input.subtitleColor || '#FFFFFF',
        button_text_color: input.buttonTextColor || '#FFFFFF',
        button_background_color: input.buttonBackgroundColor || '#007AFF'
      }])
      .select()
      .single()

    if (error) throw error
    return mapToHeroSection(data)
  },

  async update(id: number, input: UpdateHeroInput): Promise<HeroSection> {
    const updateData: any = {}
    if (input.headline !== undefined) updateData.headline = input.headline
    if (input.subheadline !== undefined) updateData.subheadline = input.subheadline
    if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl
    if (input.buttonText !== undefined) updateData.button_text = input.buttonText
    if (input.buttonLink !== undefined) updateData.button_link = input.buttonLink
    if (input.isActive !== undefined) updateData.is_active = input.isActive
    if (input.displayOrder !== undefined) updateData.display_order = input.displayOrder
    if (input.titleColor !== undefined) updateData.title_color = input.titleColor
    if (input.subtitleColor !== undefined) updateData.subtitle_color = input.subtitleColor
    if (input.buttonTextColor !== undefined) updateData.button_text_color = input.buttonTextColor
    if (input.buttonBackgroundColor !== undefined) updateData.button_background_color = input.buttonBackgroundColor

    const { data, error } = await supabase
      .from('dashboard_hero')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapToHeroSection(data)
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('dashboard_hero')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async uploadImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('hero-images')
      .upload(fileName, file)

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('hero-images')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }
}
