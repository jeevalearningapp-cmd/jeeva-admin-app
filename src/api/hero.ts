import { supabase } from '@/lib/supabase'
import { HeroSection, CreateHeroInput, UpdateHeroInput } from '@/types/hero'

const mapToHeroSection = (data: any): HeroSection => ({
  id: data.id,
  title: data.title,
  subtitle: data.subtitle,
  imageUrl: data.image_url,
  ctaText: data.cta_text,
  ctaLink: data.cta_link,
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
      .from('hero_sections')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data || []).map(mapToHeroSection)
  },

  async getById(id: string): Promise<HeroSection> {
    const { data, error } = await supabase
      .from('hero_sections')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return mapToHeroSection(data)
  },

  async create(input: CreateHeroInput): Promise<HeroSection> {
    const { data, error } = await supabase
      .from('hero_sections')
      .insert([{
        title: input.title,
        subtitle: input.subtitle,
        image_url: input.imageUrl,
        cta_text: input.ctaText,
        cta_link: input.ctaLink,
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

  async update(id: string, input: UpdateHeroInput): Promise<HeroSection> {
    const updateData: any = {}
    if (input.title !== undefined) updateData.title = input.title
    if (input.subtitle !== undefined) updateData.subtitle = input.subtitle
    if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl
    if (input.ctaText !== undefined) updateData.cta_text = input.ctaText
    if (input.ctaLink !== undefined) updateData.cta_link = input.ctaLink
    if (input.isActive !== undefined) updateData.is_active = input.isActive
    if (input.displayOrder !== undefined) updateData.display_order = input.displayOrder
    if (input.titleColor !== undefined) updateData.title_color = input.titleColor
    if (input.subtitleColor !== undefined) updateData.subtitle_color = input.subtitleColor
    if (input.buttonTextColor !== undefined) updateData.button_text_color = input.buttonTextColor
    if (input.buttonBackgroundColor !== undefined) updateData.button_background_color = input.buttonBackgroundColor

    const { data, error } = await supabase
      .from('hero_sections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapToHeroSection(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('hero_sections')
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
