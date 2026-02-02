export interface Product {
  id: string
  name: string
  category: string
  salePrice: number
  mrp: number
  image?: string
  itemCode: string
  rating?: number
  reviewCount?: number
}

export interface HeroSlide {
  id?: string
  title: string
  description: string
  buttonText: string
  buttonLink: string
  image?: string
  icon?: string
}
