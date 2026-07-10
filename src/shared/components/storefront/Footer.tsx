import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
                <span className="text-lg font-extrabold text-white">R</span>
              </div>
              <span className="text-lg font-bold text-white">Raco</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              Quality products, competitive prices, and exceptional service. Your one-stop shop for everything you need.
            </p>
            {/* Payment icons */}
            <div className="mt-6 flex items-center gap-3">
              {['💳', '📱'].map((icon, i) => (
                <div key={i} className="flex h-8 w-12 items-center justify-center rounded-lg bg-gray-800 border border-gray-700 text-sm">
                  {icon}
                </div>
              ))}
              <span className="text-xs text-gray-500">Stripe · bKash</span>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white mb-4">Shop</h4>
            <ul className="space-y-3">
              {[
                { href: '/shop', label: 'All Products' },
                { href: '/shop?status=ACTIVE', label: 'New Arrivals' },
                { href: '/shop', label: 'Best Sellers' },
                { href: '/cart', label: 'My Cart' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white mb-4">Account</h4>
            <ul className="space-y-3">
              {[
                { href: '/auth/login', label: 'Login' },
                { href: '/auth/register', label: 'Register' },
                { href: '/account/orders', label: 'My Orders' },
                { href: '/account/profile', label: 'Profile' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white mb-4">Support</h4>
            <ul className="space-y-3">
              {[
                { label: 'Help Center', href: '#' },
                { label: 'Return Policy', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2026 Raco. All rights reserved.</p>
          <p className="text-xs text-gray-500">Made with ❤️ in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
