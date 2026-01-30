import { PrismaClient } from '@prisma/client'
import productsData from '../product list online.json'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding products...')

  for (const product of productsData) {
    try {
      await prisma.product.upsert({
        where: { itemCode: product['ITEM CODE'] },
        update: {
          name: product['Product Name'],
          category: product.CATEGORY,
          weight: product.Weight,
          mrp: product.MRP,
          salePrice: product['SALE PRICE'],
          gst: product.GST,
          hsnCode: product['HSN CODE'].toString(),
        },
        create: {
          name: product['Product Name'],
          category: product.CATEGORY,
          itemCode: product['ITEM CODE'],
          weight: product.Weight,
          mrp: product.MRP,
          salePrice: product['SALE PRICE'],
          gst: product.GST,
          hsnCode: product['HSN CODE'].toString(),
          inStock: true,
        },
      })
      console.log(`✓ ${product['Product Name']}`)
    } catch (error) {
      console.error(`✗ Error seeding ${product['Product Name']}:`, error)
    }
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
