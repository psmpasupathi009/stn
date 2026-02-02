import { PrismaClient } from '@prisma/client'
import productsData from '../product list online.json'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding products...')
  let successCount = 0
  let errorCount = 0

  for (const product of productsData) {
    try {
      // Clean category name
      const category = product.CATEGORY.trim()
      
      await prisma.product.upsert({
        where: { itemCode: product['ITEM CODE'] },
        update: {
          name: product['Product Name'].trim(),
          category: category,
          weight: product.Weight || '',
          mrp: Number(product.MRP) || 0,
          salePrice: Number(product['SALE PRICE']) || 0,
          gst: Number(product.GST) || 0,
          hsnCode: product['HSN CODE']?.toString() || '',
          inStock: true,
        },
        create: {
          name: product['Product Name'].trim(),
          category: category,
          itemCode: product['ITEM CODE'],
          weight: product.Weight || '',
          mrp: Number(product.MRP) || 0,
          salePrice: Number(product['SALE PRICE']) || 0,
          gst: Number(product.GST) || 0,
          hsnCode: product['HSN CODE']?.toString() || '',
          inStock: true,
        },
      })
      successCount++
      if (successCount % 10 === 0) {
        console.log(`✓ Processed ${successCount} products...`)
      }
    } catch (error: unknown) {
      errorCount++
      console.error(`✗ Error seeding ${product['Product Name']}:`, error.message)
    }
  }

  console.log(`\nSeeding completed!`)
  console.log(`✓ Success: ${successCount} products`)
  if (errorCount > 0) {
    console.log(`✗ Errors: ${errorCount} products`)
  }

  // Get category summary
  const categories = await prisma.product.groupBy({
    by: ['category'],
    _count: {
      category: true,
    },
  })

  console.log('\nCategories seeded:')
  categories.forEach((cat) => {
    console.log(`  - ${cat.category}: ${cat._count.category} products`)
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
