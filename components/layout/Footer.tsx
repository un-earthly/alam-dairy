import Link from 'next/link'
import { Milk, Phone, MapPin } from 'lucide-react'

export default function Footer({ locale }: { locale: string }) {
  const base = `/${locale}`
  const isBn = locale === 'bn'

  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 font-bold text-green-700 mb-3">
              <Milk className="h-5 w-5" />
              <span>{isBn ? 'আলম ডেইরি ফার্ম' : 'Alam Dairy Firm'}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {isBn
                ? 'বাংলাদেশের বিশ্বস্ত ডেইরি ব্র্যান্ড।'
                : "Bangladesh's trusted dairy brand."}
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              {isBn ? 'দোকান' : 'Shop'}
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href={`${base}/shop`} className="hover:text-green-700">{isBn ? 'দুগ্ধ পণ্য' : 'Dairy Products'}</Link></li>
              <li><Link href={`${base}/farm`} className="hover:text-green-700">{isBn ? 'খামার সরবরাহ' : 'Farm Supplies'}</Link></li>
              <li><Link href={`${base}/farm?type=cattle`} className="hover:text-green-700">{isBn ? 'গরু কিনুন' : 'Buy Cattle'}</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              {isBn ? 'তথ্য' : 'Info'}
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href={`${base}/about`} className="hover:text-green-700">{isBn ? 'আমাদের সম্পর্কে' : 'About Us'}</Link></li>
              <li><Link href={`${base}/account/orders`} className="hover:text-green-700">{isBn ? 'আমার অর্ডার' : 'My Orders'}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              {isBn ? 'যোগাযোগ' : 'Contact'}
            </h3>
            <ul className="space-y-2 text-xs text-gray-500">
              <li className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>01700-000000</span>
              </li>
              <li className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{isBn ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Alam Dairy Firm. {isBn ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
        </div>
      </div>
    </footer>
  )
}
