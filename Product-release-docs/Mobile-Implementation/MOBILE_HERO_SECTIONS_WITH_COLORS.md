# Mobile Hero Sections with Color Support

**Jeeva Learning Platform - Mobile Application**

**Date:** November 24, 2025  
**Version:** 1.0  
**Target:** React Native (iOS & Android)

---

## Overview

The admin dashboard now supports custom color selection for hero sections (banners/promotional content). This guide shows how to integrate color-customizable hero sections into your mobile app.

## Color Fields

Each hero section supports these color customizations:

```typescript
interface HeroSection {
  id: string
  headline: string
  subheadline: string
  imageUrl: string
  buttonText: string
  buttonLink: string
  isActive: boolean
  displayOrder: number
  
  // Color customization
  titleColor?: string        // Headline text color (hex)
  subtitleColor?: string     // Subheadline text color (hex)
  buttonTextColor?: string   // Button text color (hex)
  buttonBackgroundColor?: string // Button background color (hex)
  
  createdAt: string
  updatedAt: string
}
```

---

## Implementation Steps

### Step 1: Create Hook - Direct Supabase Query

The mobile app can fetch hero sections directly from Supabase without needing a backend endpoint:

```typescript
// src/hooks/useHeroSections.ts
import { useQuery } from 'react-query'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface HeroSection {
  id: string
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
}

export function useHeroSections() {
  return useQuery<HeroSection[]>(
    'heroSections',
    async () => {
      const { data, error } = await supabase
        .from('dashboard_hero')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw new Error(error.message)

      // Map snake_case to camelCase
      return (data || []).map((hero: any) => ({
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
      }))
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  )
}
```

### Step 2: Create Hero Section Component

```typescript
// src/components/HeroSectionCard.tsx
import React from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface HeroSectionProps {
  headline: string
  subheadline: string
  imageUrl: string
  buttonText: string
  buttonLink: string
  titleColor?: string
  subtitleColor?: string
  buttonTextColor?: string
  buttonBackgroundColor?: string
  onButtonPress: () => void
}

export default function HeroSectionCard({
  headline,
  subheadline,
  imageUrl,
  buttonText,
  buttonLink,
  titleColor = '#FFFFFF',
  subtitleColor = '#FFFFFF',
  buttonTextColor = '#FFFFFF',
  buttonBackgroundColor = '#007AFF',
  onButtonPress,
}: HeroSectionProps) {
  const { width } = Dimensions.get('window')

  return (
    <View style={[styles.container, { width: width - 32 }]}>
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
      >
        {/* Overlay gradient for text readability */}
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
          style={styles.gradient}
        >
          <View style={styles.contentContainer}>
            {/* Headline */}
            <Text
              style={[
                styles.headline,
                { color: titleColor },
              ]}
              numberOfLines={2}
            >
              {headline}
            </Text>

            {/* Subheadline */}
            {subheadline && (
              <Text
                style={[
                  styles.subheadline,
                  { color: subtitleColor },
                ]}
                numberOfLines={3}
              >
                {subheadline}
              </Text>
            )}

            {/* Action Button */}
            {buttonText && (
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: buttonBackgroundColor },
                ]}
                onPress={onButtonPress}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: buttonTextColor },
                  ]}
                >
                  {buttonText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    backgroundColor: '#F5F5F5',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  imageBackground: {
    width: '100%',
    height: 220,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 12,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  contentContainer: {
    gap: 8,
  },
  headline: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subheadline: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
})
```

### Step 3: Display Heroes in Dashboard

```typescript
// src/screens/DashboardScreen.tsx
import React from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from 'react-native'
import { useHeroSections } from '../hooks/useHeroSections'
import HeroSectionCard from '../components/HeroSectionCard'

export default function DashboardScreen() {
  const { data: heroes, isLoading, error } = useHeroSections()

  const handleHeroButtonPress = (link: string) => {
    if (link.startsWith('http')) {
      Linking.openURL(link)
    } else if (link === '/subscription') {
      // Navigate to subscription screen
      navigation.navigate('Subscription')
    } else {
      // Handle other app routes
      navigation.navigate(link)
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Other dashboard content */}
      <View style={styles.section}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : error ? (
          <Text style={styles.errorText}>Failed to load promotions</Text>
        ) : heroes && heroes.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.heroScroll}
          >
            {heroes.map((hero) => (
              <HeroSectionCard
                key={hero.id}
                headline={hero.headline}
                subheadline={hero.subheadline}
                imageUrl={hero.imageUrl}
                buttonText={hero.buttonText}
                buttonLink={hero.buttonLink}
                titleColor={hero.titleColor}
                subtitleColor={hero.subtitleColor}
                buttonTextColor={hero.buttonTextColor}
                buttonBackgroundColor={hero.buttonBackgroundColor}
                onButtonPress={() => handleHeroButtonPress(hero.buttonLink)}
              />
            ))}
          </ScrollView>
        ) : null}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heroScroll: {
    paddingRight: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
  },
})
```

---

## Color Customization from Admin Panel

Admins can set colors in the dashboard when creating/editing hero sections:

1. **Title Color** - Headline text color (default: #FFFFFF)
2. **Subtitle Color** - Subheadline text color (default: #FFFFFF)
3. **Button Text Color** - Button text color (default: #FFFFFF)
4. **Button Background Color** - Button background color (default: #007AFF)

These colors are stored in the database and fetched by the mobile app automatically.

---

## Example Usage

When an admin creates a hero section with custom colors:

**Admin Input:**
```
Headline: "Special Offer"
Subheadline: "Get 30% off yearly plans"
Button Text: "Upgrade Now"
Title Color: #FF6B6B (Red)
Subtitle Color: #FFE66D (Yellow)
Button Text Color: #FFFFFF (White)
Button Background Color: #FF6B6B (Red)
```

**Mobile Display:**
The hero section card displays with the exact colors specified by the admin - red headline, yellow subheadline, and red button with white text.

---

## Responsive Design

The component automatically adjusts to screen width:
- Scales to `window.width - 32px` (16px margin on each side)
- Height: 220px (adjustable via `imageBackground` height)
- Works on all device sizes

---

## Required Dependencies

Add to your `package.json`:

```json
{
  "react-query": "^3.39.3",
  "axios": "^1.4.0",
  "expo-linear-gradient": "^12.0.0"
}
```

---

## Testing

**Test Cases:**
- [ ] Heroes fetch on app load
- [ ] Custom colors display correctly
- [ ] Button press navigates to correct link
- [ ] Colors update when admin changes them
- [ ] Inactive heroes don't display
- [ ] Heroes sorted by displayOrder
- [ ] Handles missing color fields (uses defaults)
- [ ] Works in light and dark mode

---

## Direct Supabase Integration

The mobile app queries the `dashboard_hero` table directly via Supabase (no backend API needed).

**Environment Variables Required:**
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

**Database Query:**
```sql
-- Supabase RLS must allow public reads on active heroes
-- Table: dashboard_hero
-- Query: Select * WHERE is_active = true ORDER BY display_order ASC
```

**Response Data Structure:**
```json
{
  "heroes": [
    {
      "id": "uuid-1",
      "headline": "Special Offer",
      "subheadline": "Get 30% off yearly plans",
      "imageUrl": "https://...",
      "buttonText": "Upgrade Now",
      "buttonLink": "/subscription",
      "isActive": true,
      "displayOrder": 1,
      "titleColor": "#FF6B6B",
      "subtitleColor": "#FFE66D",
      "buttonTextColor": "#FFFFFF",
      "buttonBackgroundColor": "#FF6B6B"
    }
  ]
}
```

**Advantages:**
- No backend overhead - direct database queries
- Faster response times
- Automatic real-time updates if using Supabase subscriptions
- Less network latency

---

© 2025 Jeeva Learning. All Rights Reserved.
