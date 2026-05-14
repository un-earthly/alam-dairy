import Link from 'next/link'
import { Leaf, Phone, MapPin } from 'lucide-react'

export default function Footer({ locale }: { locale: string }) {
  const base = `/${locale}`
  const isBn = locale === 'bn'

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="font-semibold text-foreground text-sm leading-tight">
                {isBn ? 'আলম ডেইরি ফার্ম' : 'Alam Dairy Firm'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isBn
                ? 'বাংলাদেশের বিশ্বস্ত ডেইরি ব্র্যান্ড।'
                : "Bangladesh's trusted dairy brand."}
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              {isBn ? 'দোকান' : 'Shop'}
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href={`${base}/shop`} className="hover:text-primary transition-colors duration-150">
                  {isBn ? 'দুগ্ধ পণ্য' : 'Dairy Products'}
                </Link>
              </li>
              <li>
                <Link href={`${base}/farm`} className="hover:text-primary transition-colors duration-150">
                  {isBn ? 'খামার সরবরাহ' : 'Farm Supplies'}
                </Link>
              </li>
              <li>
                <Link href={`${base}/farm?type=cattle`} className="hover:text-primary transition-colors duration-150">
                  {isBn ? 'গরু কিনুন' : 'Buy Cattle'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              {isBn ? 'তথ্য' : 'Info'}
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href={`${base}/about`} className="hover:text-primary transition-colors duration-150">
                  {isBn ? 'আমাদের সম্পর্কে' : 'About Us'}
                </Link>
              </li>
              <li>
                <Link href={`${base}/account/orders`} className="hover:text-primary transition-colors duration-150">
                  {isBn ? 'আমার অর্ডার' : 'My Orders'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              {isBn ? 'যোগাযোগ' : 'Contact'}
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>01700-000000</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                <span>{isBn ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 flex flex-col items-center gap-1.5 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Alam Dairy Firm.{' '}
            {isBn ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
          </p>
          <p className="text-xs text-muted-foreground/50">
            {isBn ? 'বাংলাদেশে তৈরি' : 'Made in Bangladesh'} 🇧🇩
          </p>
        </div>
      </div>
    </footer>
  )
}
