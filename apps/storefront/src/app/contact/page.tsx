import { getManifest } from '@/lib/kv-manifest';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export const runtime = 'edge';

export default async function ContactPage() {
  const manifest = await getManifest();
  const store = manifest?.store || {
    businessName: 'Omkara',
    phone: '+918560078208',
    email: 'omkara.health.wellness@gmail.com',
    whatsappNumber: '+918560078208',
    address: 'Bikaner, Rajasthan, India',
  };

  const cleanPhone = (store.whatsappNumber || store.phone || '918560078208').replace(/\D/g, '');

  return (
    <div className=" max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20 space-y-8 text-[#4A2B18]\>
 <div className=\text-center space-y-3\>
 <h1 className=\font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#4A2B18]\>
 Contact Us
 </h1>
 <p className=\text-lg text-[#6B4C3A] max-w-xl mx-auto\>
 We would love to hear from you. Reach out for custom orders, queries, or wellness guidance.
 </p>
 </div>

 <div className=\grid grid-cols-1 md:grid-cols-2 gap-6\>
 <div className=\bg-white/80 border border-[#4A2B18]/10 rounded-2xl p-6 md:p-8 shadow-sm space-y-6\>
 <h2 className=\font-serif text-2xl font-bold text-[#4A2B18]\>Get In Touch</h2>
 
 <div className=\space-y-4\>
 <div className=\flex items-center gap-4\>
 <div className=\h-10 w-10 rounded-full bg-[#F0E4D1] flex items-center justify-center text-[#C05A3E]\>
 <Phone className=\h-5 w-5\ />
 </div>
 <div>
 <p className=\text-xs text-[#6B4C3A] font-semibold uppercase\>Phone</p>
 <a href={ el:} className=\text-base font-bold hover:text-[#C05A3E] transition-colors\>
 {store.phone}
 </a>
 </div>
 </div>

 <div className=\flex items-center gap-4\>
 <div className=\h-10 w-10 rounded-full bg-[#F0E4D1] flex items-center justify-center text-[#C05A3E]\>
 <Mail className=\h-5 w-5\ />
 </div>
 <div>
 <p className=\text-xs text-[#6B4C3A] font-semibold uppercase\>Email</p>
 <a href={mailto:} className=\text-base font-bold hover:text-[#C05A3E] transition-colors\>
 {store.email || 'omkara.health.wellness@gmail.com'}
 </a>
 </div>
 </div>

 <div className=\flex items-center gap-4\>
 <div className=\h-10 w-10 rounded-full bg-[#F0E4D1] flex items-center justify-center text-[#C05A3E]\>
 <MapPin className=\h-5 w-5\ />
 </div>
 <div>
 <p className=\text-xs text-[#6B4C3A] font-semibold uppercase\>Location</p>
 <p className=\text-base font-bold\>
 {store.address || 'Bikaner, Rajasthan, India'}
 </p>
 </div>
 </div>
 </div>
 </div>

 <div className=\bg-white/80 border border-[#4A2B18]/10 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between space-y-6\>
 <div className=\space-y-3\>
 <h2 className=\font-serif text-2xl font-bold text-[#4A2B18]\>Instant WhatsApp Chat</h2>
 <p className=\text-sm text-[#6B4C3A] leading-relaxed\>
 For instant ordering assistance, bulk diet consultations, or quick delivery updates, connect with us directly on WhatsApp.
 </p>
 </div>

 <a
 href={https://wa.me/}
 target=\_blank\
 rel=\noopener noreferrer\
 className=\w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#C05A3E] text-white font-bold rounded-xl hover:bg-[#A84A30] transition-colors shadow-md\
 >
 <MessageCircle className=\h-5 w-5\ />
 <span>Chat on WhatsApp</span>
 </a>
 </div>
 </div>
 </div>
 );
}