import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'আলম ডেইরি ফার্ম | Alam Dairy Firm',
  description: 'খাঁটি দুগ্ধজাত পণ্য ও খামার সরবরাহ — Fresh dairy products and farm supplies from Alam Dairy Firm, Bangladesh.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
