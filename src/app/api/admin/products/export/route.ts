import { NextResponse } from 'next/server';
import { db } from '@/prisma/db';
import ExcelJS from 'exceljs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await db.orm.public.Product
      .include('category')
      .include('specifications')
      .include('variants', (v) => v.include('inventory'))
      .all();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    // Expected format for import (Read by index in worker)
    worksheet.columns = [
      { header: 'SKU\nشناسه یکتا', key: 'sku', width: 20 },
      { header: 'ProductSlug\nلینک محصول', key: 'productSlug', width: 25 },
      { header: 'ProductName\nنام محصول', key: 'productName', width: 35 },
      { header: 'CategorySlug\nلینک دسته‌بندی', key: 'categorySlug', width: 20 },
      { header: 'BasePrice\nقیمت پایه', key: 'basePrice', width: 15 },
      { header: 'Discount\nدرصد تخفیف', key: 'discount', width: 15 },
      { header: 'VariantName\nنام تنوع', key: 'variantName', width: 20 },
      { header: 'VariantPrice\nقیمت تنوع', key: 'variantPrice', width: 15 },
      { header: 'StockQuantity\nموجودی', key: 'stockQuantity', width: 15 },
      { header: 'Description\nتوضیحات محصول', key: 'description', width: 35 },
      { header: 'Introduction\nمعرفی محصول', key: 'introduction', width: 35 },
      { header: 'Weight\nوزن', key: 'weight', width: 15 },
      { header: 'Length\nطول', key: 'length', width: 15 },
      { header: 'Width\nعرض', key: 'width', width: 15 },
      { header: 'Height\nارتفاع', key: 'height', width: 15 },
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 35;
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    products.forEach((product: any) => {
      // Find specs safely
      const getSpec = (name: string) => product.specifications?.find((s: any) => s.name === name)?.value || '';

      const weight = getSpec('وزن');
      const length = getSpec('طول');
      const width = getSpec('عرض');
      const height = getSpec('ارتفاع');

      if (!product.variants || product.variants.length === 0) {
        worksheet.addRow({
          sku: '',
          productSlug: product.slug,
          productName: product.name,
          categorySlug: product.category?.slug || '',
          basePrice: product.basePrice,
          discount: product.discount,
          variantName: '',
          variantPrice: '',
          stockQuantity: 0,
          description: product.description || '',
          introduction: product.introduction || '',
          weight,
          length,
          width,
          height,
        });
      } else {
        product.variants.forEach((variant: any) => {
          worksheet.addRow({
            sku: variant.sku,
            productSlug: product.slug,
            productName: product.name,
            categorySlug: product.category?.slug || '',
            basePrice: product.basePrice,
            discount: product.discount,
            variantName: variant.name || '',
            variantPrice: variant.price || '',
            stockQuantity: variant.inventory?.stockQuantity || 0,
            description: product.description || '',
            introduction: product.introduction || '',
            weight,
            length,
            width,
            height,
          });
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export products' }, { status: 500 });
  }
}
