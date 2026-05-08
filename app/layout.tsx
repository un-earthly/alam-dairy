import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'আলম ডেইরি ফার্ম | Alam Dairy Firm',
  description: 'খাঁটি দুগ্ধজাত পণ্য ও খামার সরবরাহ — Fresh dairy products and farm supplies from Alam Dairy Firm, Bangladesh.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
