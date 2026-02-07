import type { AboutSection } from '@/lib/types'

/** Default sections for Our Story fallback and dashboard pre-fill. Single source of truth. */
export const DEFAULT_ABOUT_SECTIONS: Omit<AboutSection, 'id'>[] = [
  {
    title: 'Our Story',
    content:
      'We are two brothers hailing from Kovilpatti in the southern part of Tamil Nadu. From a middle-class family, our elder brother ran a small petty shop in our hometown. With those resources we started this cold-pressed oil firm in 2023. The initial two years were an absolute challenge. Once our customers came to know about our product quality and its goodness, our sales grew gradually. Today we sell 25+ products along with wood-pressed oil.',
    image: '/STN LOGO.png',
    imageLeft: false,
    order: 0,
  },
  {
    title: 'Our Vision and Mission',
    content:
      'With the 21st century witnessing ever-growing awareness on eating healthy, we concentrate on giving traditional oil to people the same way our ancients used it. At STN GOLDEN HEALTHY FOODS, we are dedicated to producing pure, natural, and traditionally extracted wood-pressed oils that preserve the true goodness of nature. Rooted in age-old methods and modern quality standards, our oils deliver authentic taste, nutrition, and wellness.',
    image: '/stn loading image.png',
    imageLeft: true,
    order: 1,
  },
  {
    title: 'Why Wood Pressed Oil?',
    content:
      'We source premium-grade seeds from trusted farmers and process them using wooden cold-press techniques without heat or chemicals. Essential nutrients, natural aroma, and original flavor remain intact. Quality and purity are at the heart of everything we do. Every step follows strict hygiene and quality controls. Our oils are free from additives and preservatives—ideal for healthy cooking and traditional wellness.',
    image: '/STN LOGO.png',
    imageLeft: false,
    order: 2,
  },
]

/** Fallback list for Our Story page when API returns empty (with ids for keys). */
export function getDefaultAboutSectionsWithIds(): AboutSection[] {
  return DEFAULT_ABOUT_SECTIONS.map((s, i) => ({ ...s, id: String(i + 1) }))
}

/** Template for dashboard Add form (title, content, imageLeft) by current section count. */
export function getAboutTemplateForIndex(index: number): {
  title: string
  content: string
  imageLeft: boolean
} {
  const section = DEFAULT_ABOUT_SECTIONS[Math.min(index, DEFAULT_ABOUT_SECTIONS.length - 1)]
  return {
    title: section.title,
    content: section.content,
    imageLeft: section.imageLeft,
  }
}
