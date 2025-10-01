import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Story Reader Admin',
  description: 'Admin dashboard for Story Reader App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}