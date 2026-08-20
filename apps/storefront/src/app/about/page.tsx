import { getManifest } from '@/lib/kv-manifest';
import Link from 'next/link';

export const runtime = 'edge';

export default async function AboutPage() {
  const manifest = await getManifest();
  const storeName = manifest?.store.businessName || 'Omkara';

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20 space-y-8 text-[#4A2B18]">
      <div className="text-center space-y-3">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#4A2B18]">
          Our Story
        </h1>
        <p className="text-lg text-[#6B4C3A] max-w-xl mx-auto font-serif italic">
          Rooted in the authentic heritage of Bikaner, crafted with wellness in every bite.
        </p>
      </div>

      <div className="bg-white/80 border border-[#4A2B18]/10 rounded-2xl p-6 md:p-10 shadow-sm space-y-6 leading-relaxed text-base">
        <p>
          Welcome to <strong>{storeName}</strong>. Born in the royal city of Bikaner, Rajasthan, our journey began with a singular devotion: bringing minimally processed, nutrient-rich, and organically nurtured superfoods straight from the farm to your table.
        </p>
        <p>
          We specialize in premium sprouted grains, authentic micro-greens, traditional roasted grains, and wellness botanicals. Every batch is crafted in small batches using traditional sun-drying and natural soaking methods that preserve vital digestive enzymes and active micronutrients.
        </p>
        <p>
          Whether you are nourishing your morning routine with our signature sprout bowls or seeking pure organic nutrition, we take pride in delivering honest wellness without artificial preservatives or compromises.
        </p>

        <div className="pt-4 border-t border-[#4A2B18]/10 flex justify-center">
          <Link
            href="/#menu"
            className="inline-flex items-center justify-center px-8 py-3 bg-[#C05A3E] text-white font-bold rounded-full hover:bg-[#A84A30] transition-colors shadow-md"
          >
            Explore Our Menu
          </Link>
        </div>
      </div>
    </div>
  );
}