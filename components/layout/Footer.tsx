import Link from 'next/link'
import { Phone, MapPin } from 'lucide-react'
import Logo from './Logo'
import EstdBadge from '@/components/landing/EstdBadge'
import CornerOrnament from '@/components/site/CornerOrnament'

export default function Footer({ locale }: { locale: string }) {
  const base = `/${locale}`
  const isBn = locale === 'bn'

  return (
    <footer className="relative mt-auto overflow-hidden border-t bg-muted/30">
      <CornerOrnament corner="tl" size={220} rotate={6} opacity={0.22} />
      {/* kantha texture, barely-there */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.06] mix-blend-multiply dark:opacity-[0.04] dark:invert dark:saturate-0 dark:mix-blend-screen"
        style={{ backgroundImage: 'url(/doodle-2.png)', backgroundSize: '460px' }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Logo height={32} className="shrink-0 dark:brightness-0 dark:invert" />
              <span className="font-display font-semibold text-foreground text-sm leading-tight">
                {isBn ? 'আলম ডেইরি' : 'Alam Dairy'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isBn
                ? 'বাংলাদেশের বিশ্বস্ত ডেইরি ব্র্যান্ড, ২০১৫ সাল থেকে।'
                : "Bangladesh's trusted dairy brand since 2015."}
            </p>
            <EstdBadge className="mt-6 h-24 w-24 text-muted-foreground/70" />
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

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              {isBn ? 'কোম্পানি' : 'Company'}
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {([
                [`${base}/about`, isBn ? 'আমাদের সম্পর্কে' : 'About Us'],
                [`${base}/our-story`, isBn ? 'আমাদের গল্প' : 'Our Story'],
                [`${base}/sustainability`, isBn ? 'টেকসই চর্চা' : 'Sustainability'],
                [`${base}/certifications`, isBn ? 'সার্টিফিকেশন' : 'Certifications'],
                [`${base}/gallery`, isBn ? 'গ্যালারি' : 'Gallery'],
                [`${base}/contact`, isBn ? 'যোগাযোগ' : 'Contact'],
                [`${base}/account/orders`, isBn ? 'আমার অর্ডার' : 'My Orders'],
              ] as const).map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-primary transition-colors duration-150">
                    {label}
                  </Link>
                </li>
              ))}
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
                <span>{isBn ? 'মাদারীপুর, বাংলাদেশ' : 'Madaripur, Bangladesh'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 flex flex-col items-center gap-1.5 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Alam Dairy.{' '}
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
