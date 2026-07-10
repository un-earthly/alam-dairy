import type { Metadata } from 'next'
import { Inter, Fraunces, Galada, Hind_Siliguri } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
const galada = Galada({ weight: '400', subsets: ['bengali', 'latin'], variable: '--font-galada', display: 'swap' })
const hindSiliguri = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-bangla',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'আলম ডেইরি | Alam Dairy',
  description: 'খাঁটি দুগ্ধজাত পণ্য ও খামার সরবরাহ। Fresh dairy products and farm supplies from Alam Dairy, Bangladesh, since 2015.',
  icons: {
    icon: [
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/favicon_io/apple-touch-icon.png',
  },
  manifest: '/favicon_io/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={`${inter.variable} ${fraunces.variable} ${galada.variable} ${hindSiliguri.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
