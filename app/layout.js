import './globals.css'

export const metadata = {
  title: 'Chaarpaisa - Multi-Role Marketplace',
  description: 'Buy, sell, and rent items in your neighborhood. A comprehensive marketplace platform with renter, seller, and admin roles.',
  keywords: 'marketplace, rental, secondhand, buy, sell, rent, items, chaarpaisa',
  openGraph: {
    title: 'Chaarpaisa - Multi-Role Marketplace',
    description: 'Buy, sell, and rent items in your neighborhood',
    type: 'website',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}