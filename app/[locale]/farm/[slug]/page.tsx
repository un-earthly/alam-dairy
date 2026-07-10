import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import AddToCartButton from '@/components/product/AddToCartButton'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export default async function FarmProductDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const tc = await getTranslations('common')
  const tf = await getTranslations('farm')

  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  const isBn = locale === 'bn'
  const name = isBn ? product.name_bn : product.name_en
  const description = isBn ? product.description_bn : product.description_en
  const price = product.sale_price ?? product.price
  const isCattle = product.type === 'cattle'
  const meta = product.meta as Record<string, string> | null

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={name}
                width={600}
                height={600}
                className="h-full w-full object-cover"
                priority
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-8xl">
                {isCattle ? '🐄' : '🌾'}
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.slice(1).map((img, i) => (
                <div key={i} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image src={img} alt="" width={64} height={64} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs capitalize">{product.type.replace('_', ' ')}</Badge>
              {isCattle && (
                <Badge className="bg-pasture/15 text-forest border-pasture/30 text-xs gap-1 dark:text-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  {isBn ? 'ভেট পরীক্ষিত' : 'Vet Inspected'}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-green-700">
              {tc('taka')}{price.toLocaleString('bn-BD')}
            </span>
            <span className="text-gray-400 text-sm">/{product.unit}</span>
          </div>

          {description && (
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          )}

          {/* Specs */}
          {meta && Object.keys(meta).length > 0 && (
            <div className="rounded-xl border overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {isBn ? 'বিস্তারিত তথ্য' : 'Specifications'}
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(meta).map(([key, value], i) => (
                    <tr key={key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 font-medium text-gray-600 w-2/5 capitalize">
                        {key.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-2 text-gray-800">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-2 mt-2">
            {isCattle ? (
              <>
                <Link href={`tel:01700000000`}>
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
                    <Phone className="h-5 w-5" />
                    {isBn ? 'কোটেশনের জন্য কল করুন' : 'Call for Quote'}
                  </Button>
                </Link>
                <AddToCartButton product={product} locale={locale} />
              </>
            ) : (
              <AddToCartButton product={product} locale={locale} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
