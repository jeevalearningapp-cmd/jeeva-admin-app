export interface HeroSection {
  id: string
  title: string
  subtitle: string
  imageUrl: string
  ctaText: string
  ctaLink: string
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateHeroInput {
  title: string
  subtitle: string
  imageUrl: string
  ctaText: string
  ctaLink: string
  isActive?: boolean
  displayOrder?: number
}

export interface UpdateHeroInput {
  title?: string
  subtitle?: string
  imageUrl?: string
  ctaText?: string
  ctaLink?: string
  isActive?: boolean
  displayOrder?: number
}
