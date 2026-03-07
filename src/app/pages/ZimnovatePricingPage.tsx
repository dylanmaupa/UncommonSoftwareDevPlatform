import React, { useState } from 'react';
import { 
  LuCheck, 
  LuChevronDown, 
  LuChevronUp, 
  LuRocket, 
  LuZap, 
  LuGlobe, 
  LuMessageSquare, 
  LuMail, 
  LuPhone, 
  LuMapPin,
  LuArrowRight,
  LuMinus
} from 'react-icons/lu';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const packages = [
  {
    name: "Starter Website",
    price: "350",
    description: "Essential web presence for small businesses and personal brands.",
    timeline: "2 week delivery",
    features: [
      "3–5 Professional Pages",
      "Mobile Responsive Design",
      "Basic SEO Setup",
      "Standard Contact Form",
      "Social Media Integration",
      "1 Month Free Support"
    ],
    cta: "Get Started",
    highlight: false
  },
  {
    name: "Business Growth",
    price: "700",
    description: "Advanced custom solution for established SMEs looking to scale.",
    timeline: "3–4 week delivery",
    features: [
      "6–10 Custom Pages",
      "Full UI/UX Custom Design",
      "Blog/CMS Integration",
      "Advanced SEO Optimization",
      "Google Analytics Setup",
      "Priority Email Support"
    ],
    cta: "Scale Now",
    highlight: true
  },
  {
    name: "Startup MVP",
    price: "2,500",
    description: "Full functional product to validate your startup idea fast.",
    timeline: "4–6 week delivery",
    features: [
      "Custom Dashboard/Web App",
      "User Authentication",
      "Database Integration",
      "Admin Control Panel",
      "Third-party API Integration",
      "Launch Strategy Session"
    ],
    cta: "Build My MVP",
    highlight: false
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Bespoke automation and digital transformation for NGOs and large teams.",
    timeline: "Timeline on request",
    features: [
      "Custom Automation Workflows",
      "Mobile App Development",
      "Complex Digital Strategy",
      "Legacy System Migration",
      "Dedicated Project Manager",
      "24/7 Priority Support"
    ],
    cta: "Enquire Now",
    highlight: false
  }
];

const comparisonFeatures = [
  { name: "Number of Pages", starter: "3-5", growth: "6-10", mvp: "Unlimited", custom: "Custom" },
  { name: "Custom Design", starter: true, growth: true, mvp: true, custom: true },
  { name: "SEO Setup", starter: "Basic", growth: "Advanced", mvp: "Full", custom: "Full" },
  { name: "CMS / Blog", starter: false, growth: true, mvp: true, custom: true },
  { name: "User Auth", starter: false, growth: false, mvp: true, custom: true },
  { name: "API Integrations", starter: false, growth: "Basic", mvp: "Advanced", custom: "Custom" },
  { name: "Support Period", starter: "30 Days", growth: "90 Days", mvp: "6 Months", custom: "Unlimited" },
];

const faqs = [
  {
    q: "How long does a website take to build?",
    a: "Our Starter packages typically take 2 weeks, while Business Growth sites take 3-4 weeks. Startup MVPs and Custom Enterprise solutions vary between 4-12 weeks depending on complexity."
  },
  {
    q: "Do you offer payment plans?",
    a: "Yes, we understand the local market. We typically require a 50% deposit to start, with the remaining balance due upon completion. For larger projects, we can arrange milestone-based monthly payments."
  },
  {
    q: "Can you redesign my existing website?",
    a: "Absolutely. We specialize in taking dated or non-performing websites and transforming them into modern, high-converting digital assets that reflect your current brand."
  },
  {
    q: "Do you provide support after launch?",
    a: "Every project includes a dedicated support period (1-6 months). Post-launch, we offer maintenance packages for regular updates, security monitoring, and content changes."
  },
  {
    q: "Do you work with clients outside Zimbabwe?",
    a: "Yes! While we are based in Harare, we serve clients across Africa and the globe, using modern collaboration tools to ensure seamless project delivery regardless of location."
  },
  {
    q: "What information do you need to start a project?",
    a: "To give you an accurate quote and timeline, we initially need a brief overview of your business goals, target audience, and any specific features (like e-commerce or booking systems) you require."
  }
];

export default function ZimnovatePricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-indigo-50 rounded-full blur-[120px] opacity-60" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 bg-white/50 backdrop-blur-sm px-4 py-1 text-blue-600 border-blue-200">
            Digital Excellence in Harare
          </Badge>
          <h1 className="mb-6 text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Build the future of your <br className="hidden lg:block" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">business online.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg lg:text-xl text-slate-600 leading-relaxed font-medium">
            Zimnovate helps African startups, SMEs, and NGOs build professional websites, apps, and automation systems that drive real growth.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 rounded-full text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all hover:scale-105">
              Start Your Project
              <LuArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="ghost" size="lg" className="h-14 px-8 rounded-full text-lg font-medium text-slate-600 hover:bg-slate-100">
              View Our Work
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">Simple, Transparent Pricing</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Choose the perfect plan for your business stage. No hidden fees, just high-quality delivery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {packages.map((pkg, idx) => (
              <Card 
                key={idx} 
                className={`flex flex-col rounded-3xl border transition-all duration-300 ${
                  pkg.highlight 
                    ? 'border-blue-600 shadow-2xl shadow-blue-100 ring-4 ring-blue-50 scale-105 z-10' 
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-xl'
                }`}
              >
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="mb-6">
                    {pkg.highlight && (
                      <Badge className="mb-4 bg-blue-600 text-white border-0 py-1 px-3">
                        Most Popular
                      </Badge>
                    )}
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                    <p className="text-sm text-slate-500 mb-6 min-h-[40px] leading-relaxed italic">{pkg.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-slate-400">From</span>
                      <span className="text-4xl font-extrabold text-slate-900">
                        {pkg.price === "Custom" ? "" : "$"}
                        {pkg.price}
                      </span>
                    </div>
                  </div>

                  <div className="mb-8 flex-grow">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-4 flex items-center gap-2">
                       {pkg.timeline}
                    </p>
                    <ul className="space-y-4">
                      {pkg.features.map((feat, fidx) => (
                        <li key={fidx} className="flex items-start gap-3 text-sm text-slate-600">
                          <LuCheck className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    variant={pkg.highlight ? 'default' : 'outline'} 
                    className={`w-full py-6 rounded-2xl font-bold text-base transition-all ${
                      pkg.highlight 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-900'
                    }`}
                  >
                    {pkg.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-slate-50/50 border-t border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Compare Plans</h2>
            <p className="text-slate-500 mt-2">Find exactly what you need with our side-by-side breakdown.</p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="py-6 px-8 text-sm font-semibold text-slate-900">Feature</th>
                  <th className="py-6 px-6 text-sm font-bold text-slate-900 text-center">Starter</th>
                  <th className="py-6 px-6 text-sm font-bold text-blue-600 text-center">Growth</th>
                  <th className="py-6 px-6 text-sm font-bold text-slate-900 text-center">MVP</th>
                  <th className="py-6 px-6 text-sm font-bold text-slate-900 text-center">Custom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonFeatures.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30">
                    <td className="py-5 px-8 text-sm font-medium text-slate-600">{row.name}</td>
                    <td className="py-5 px-6 text-sm text-slate-500 text-center">
                      {typeof row.starter === 'boolean' ? (row.starter ? <LuCheck className="mx-auto h-5 w-5 text-blue-500" /> : <LuMinus className="mx-auto h-5 w-5 text-slate-200" />) : row.starter}
                    </td>
                    <td className="py-5 px-6 text-sm text-slate-900 font-semibold text-center border-x border-blue-50 bg-blue-50/10">
                      {typeof row.growth === 'boolean' ? (row.growth ? <LuCheck className="mx-auto h-5 w-5 text-blue-600" /> : <LuMinus className="mx-auto h-5 w-5 text-slate-200" />) : row.growth}
                    </td>
                    <td className="py-5 px-6 text-sm text-slate-500 text-center">
                      {typeof row.mvp === 'boolean' ? (row.mvp ? <LuCheck className="mx-auto h-5 w-5 text-blue-500" /> : <LuMinus className="mx-auto h-5 w-5 text-slate-200" />) : row.mvp}
                    </td>
                    <td className="py-5 px-6 text-sm text-slate-500 text-center">
                      {typeof row.custom === 'boolean' ? (row.custom ? <LuCheck className="mx-auto h-5 w-5 text-blue-500" /> : <LuMinus className="mx-auto h-5 w-5 text-slate-200" />) : row.custom}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
              <p className="text-slate-500 mt-2">Our streamlined process from concept to launch.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-[2.5rem] left-[10%] right-[10%] h-[1px] bg-slate-100 z-0" />
              {[
                { step: 1, title: "Tell us about your project", desc: "Share your business goals and requirements via our intro project form.", icon: LuMessageSquare },
                { step: 2, title: "Receive a proposal", desc: "Get a detailed scope of work and fixed-cost proposal within 24 hours.", icon: LuZap },
                { step: 3, title: "Launch your product", desc: "Experience a seamless build with constant updates and launch in 2-6 weeks.", icon: LuRocket },
              ].map((item, idx) => (
                <div key={idx} className="relative z-10 text-center group">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:shadow-xl group-hover:shadow-blue-100 transition-all duration-300">
                    <item.icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900 leading-tight md:px-4">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed md:px-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know about working with us.</p>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all shadow-sm hover:shadow-md"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-6 text-left selection:bg-transparent"
                >
                  <span className="text-base font-bold text-slate-800">{faq.q}</span>
                  {openFaq === idx ? <LuChevronUp className="h-5 w-5 text-blue-600" /> : <LuChevronDown className="h-5 w-5 text-slate-400" />}
                </button>
                <div className={`transition-all duration-300 ${openFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                  <p className="px-6 pb-6 text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden bg-slate-900 rounded-[3rem] mx-4 lg:mx-12 mb-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-blue-600/10 blur-[100px]" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="mb-6 text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Ready to transform your <br className="hidden lg:block" />
            business online?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-slate-400 font-medium">
            Contact Zimnovate today and let's start building your world-class digital presence in Harare.
          </p>
          
          <div className="flex flex-col items-center gap-8">
            <Button size="lg" className="h-16 px-12 rounded-full text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-900/40 transition-all hover:scale-105">
              Start Your Project
              <LuArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <div className="grid sm:grid-cols-3 gap-8 py-8 border-t border-white/5 w-full max-w-3xl mt-4">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 mb-1"><LuMail className="h-5 w-5 text-blue-400" /></div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Email</p>
                <p className="text-sm font-medium text-white/80">hello@zimnovate.co.zw</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 mb-1"><LuPhone className="h-5 w-5 text-blue-400" /></div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Phone</p>
                <p className="text-sm font-medium text-white/80">+263 77 753 0322</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 mb-1"><LuMapPin className="h-5 w-5 text-blue-400" /></div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Location</p>
                <p className="text-sm font-medium text-white/80">Harare, Zimbabwe</p>
              </div>
            </div>
            
            <p className="text-xs text-white/30 font-medium tracking-wide prose-sm">
              © 2026 Zimnovate Digital Agency. Build with Passion in Zimbabwe.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
