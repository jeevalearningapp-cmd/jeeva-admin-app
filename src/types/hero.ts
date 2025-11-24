export interface HeroSection {
  id: string
  title: string
  subtitle: string
  imageUrl: string
  ctaText: string
  ctaLink: string
  isActive: boolean
  displayOrder: number
  titleColor?: string
  subtitleColor?: string
  buttonTextColor?: string
  buttonBackgroundColor?: string
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
  titleColor?: string
  subtitleColor?: string
  buttonTextColor?: string
  buttonBackgroundColor?: string
}

export interface UpdateHeroInput {
  title?: string
  subtitle?: string
  imageUrl?: string
  ctaText?: string
  ctaLink?: string
  isActive?: boolean
  displayOrder?: number
  titleColor?: string
  subtitleColor?: string
  buttonTextColor?: string
  buttonBackgroundColor?: string
}
