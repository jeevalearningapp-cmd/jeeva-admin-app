export interface HeroSection {
  id: number
  headline: string
  subheadline: string
  imageUrl: string
  buttonText: string
  buttonLink: string
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
  headline: string
  subheadline: string
  imageUrl: string
  buttonText: string
  buttonLink: string
  isActive?: boolean
  displayOrder?: number
  titleColor?: string
  subtitleColor?: string
  buttonTextColor?: string
  buttonBackgroundColor?: string
}

export interface UpdateHeroInput {
  headline?: string
  subheadline?: string
  imageUrl?: string
  buttonText?: string
  buttonLink?: string
  isActive?: boolean
  displayOrder?: number
  titleColor?: string
  subtitleColor?: string
  buttonTextColor?: string
  buttonBackgroundColor?: string
}
