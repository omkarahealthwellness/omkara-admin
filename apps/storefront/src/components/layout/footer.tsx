import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { getManifest } from '@/lib/kv-manifest';
import { ExternalLink } from 'lucide-react';

export async function Footer() {
  const manifest = await getManifest();
  const social = manifest?.store.social;
  return (
    <footer className="bg-sandstone/30 mt-16 pt-12 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.svg" alt="Omkara" className="h-9 w-9 rounded-full" width={36} height={36} />
              <h3 className="font-serif text-2xl font-bold text-primary">Omkara</h3>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Rooted in the heritage of Bikaner, delivering premium health and wellness directly to
              you.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-primary transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Our Story
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-lg mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-primary transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <Separator className="bg-primary/20 my-8" />
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground gap-4">
          <div className="flex items-center gap-4">
            <p>&copy; {new Date().getFullYear()} Omkara Health. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4">
            {social?.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Instagram</span>
              </a>
            )}
            {social?.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Facebook</span>
              </a>
            )}
            {social?.youtube && (
              <a
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                <span>YouTube</span>
              </a>
            )}
          </div>
          <p className="mt-2 md:mt-0">Made with ❤️ in Bikaner</p>
        </div>
      </div>
    </footer>
  );
}
