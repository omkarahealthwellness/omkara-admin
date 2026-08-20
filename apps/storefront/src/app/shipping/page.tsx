export const runtime = 'edge';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20 space-y-8 text-[#4A2B18]">
      <div className="text-center space-y-3">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#4A2B18]">
          Shipping & Delivery Policy
        </h1>
        <p className="text-sm text-[#6B4C3A]">Last updated: August 2026</p>
      </div>

      <div className="bg-white/80 border border-[#4A2B18]/10 rounded-2xl p-6 md:p-10 shadow-sm space-y-6 text-sm md:text-base leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-[#4A2B18]">1. Fresh Preparation & Dispatch</h2>
          <p className="text-[#6B4C3A]">
            All sprout bowls, daily preparations, and organic food items are made fresh to order. Orders placed before 12:00 PM are prepared and dispatched the same day.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-[#4A2B18]">2. Delivery Timelines</h2>
          <ul className="list-disc list-inside space-y-1 text-[#6B4C3A]">
            <li><strong>Local Delivery (Bikaner):</strong> Same-day delivery within 2–4 hours of order confirmation.</li>
            <li><strong>Regional / Outstation:</strong> Packaged dry mixes and roasted items are delivered in 2–4 business days via express courier.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-[#4A2B18]">3. Packaging & Quality Assurance</h2>
          <p className="text-[#6B4C3A]">
            Our items are vacuum-sealed or packaged in food-grade, biodegradable containers to preserve maximum crispness, nutritional integrity, and hygiene during transit.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-[#4A2B18]">4. Order Tracking</h2>
          <p className="text-[#6B4C3A]">
            Once your order is confirmed via WhatsApp, our support representative will share live delivery tracking and estimated dispatch times directly in your chat.
          </p>
        </section>
      </div>
    </div>
  );
}