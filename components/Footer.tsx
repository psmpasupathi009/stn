import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Shop</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/home/products" className="hover:text-white">
                  Shop All
                </Link>
              </li>
              <li>
              </li>
              <li>
                <Link href="/home/our-story" className="hover:text-white">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/home/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/home/track-order" className="hover:text-white">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Social</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">Facebook</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Instagram</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">YouTube</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <p className="text-gray-400 mb-2">
              <strong>Email:</strong> info@stngoldenhealthyfoods.com
            </p>
            <p className="text-gray-400 mb-4">
              <strong>Phone:</strong> +919942590202
            </p>
            <p className="text-gray-400 text-sm">
              <strong>Address:</strong> 46/1, Kongu Nagar, Opp. Power House, Pollachi Main Road, Dharapuram, Tiruppur - 638 656
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Payment methods</h3>
            <div className="flex gap-2 flex-wrap">
              <div className="bg-white text-black px-3 py-2 rounded text-xs font-semibold">VISA</div>
              <div className="bg-white text-black px-3 py-2 rounded text-xs font-semibold">MASTERCARD</div>
              <div className="bg-white text-black px-3 py-2 rounded text-xs font-semibold">UPI</div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026, STN Golden Healthy Foods
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/privacy-policy" className="hover:text-white">Privacy policy</Link>
              <Link href="/refund-policy" className="hover:text-white">Refund policy</Link>
              <Link href="/terms-of-service" className="hover:text-white">Terms of service</Link>
              <Link href="/shipping-policy" className="hover:text-white">Shipping policy</Link>
              <Link href="/home/contact" className="hover:text-white">Contact information</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

