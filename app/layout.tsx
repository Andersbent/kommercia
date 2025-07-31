
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kommercia',
  description: 'Your Commercial Department in the Cloud',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
