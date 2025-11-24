import { Router } from 'express'
import { supabase } from '../config/supabase'

const router = Router()

// Get all active hero sections for mobile app
router.get('/hero-sections', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dashboard_hero')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('❌ Error fetching hero sections:', error)
      return res.status(500).json({ error: 'Failed to fetch hero sections' })
    }

    // Map snake_case to camelCase for frontend
    const heroes = (data || []).map((hero: any) => ({
      id: hero.id,
      headline: hero.headline,
      subheadline: hero.subheadline,
      imageUrl: hero.image_url,
      buttonText: hero.button_text,
      buttonLink: hero.button_link,
      isActive: hero.is_active,
      displayOrder: hero.display_order,
      titleColor: hero.title_color,
      subtitleColor: hero.subtitle_color,
      buttonTextColor: hero.button_text_color,
      buttonBackgroundColor: hero.button_background_color,
      createdAt: hero.created_at,
      updatedAt: hero.updated_at,
    }))

    res.json(heroes)
  } catch (error) {
    console.error('❌ Server error fetching hero sections:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
