import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#f7f9fb]/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            <span className="text-xl font-extrabold tracking-tighter font-headline">DentSide</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-on-surface-variant hover:text-primary font-bold text-sm uppercase tracking-widest transition-colors font-label">Features</a>
            <a href="#pricing" className="text-on-surface-variant hover:text-primary font-bold text-sm uppercase tracking-widest transition-colors font-label">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onGetStarted}
              className="text-primary font-bold text-sm tracking-widest uppercase hover:bg-surface-container transition-colors hidden sm:block px-4 py-2 rounded-xl"
            >
              Log In
            </button>
            <button 
              onClick={onGetStarted}
              className="bg-primary-gradient text-white px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide uppercase hover:opacity-90 shadow-[0_8px_16px_rgba(0,93,144,0.2)] hover:shadow-[0_12px_20px_rgba(0,93,144,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              Start Earning
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-secondary-container/50 text-primary font-bold text-xs tracking-widest uppercase mb-8 border border-primary/10">
              The Future of Dental Careers
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-[-0.04em] font-headline text-on-surface mb-8 leading-[1.1]">
              Your All-in-One <span className="text-primary">Remote Career Hub</span>
            </h1>
            <p className="text-xl text-on-surface-variant mb-12 leading-relaxed max-w-2xl mx-auto">
              Stop jumping between platforms. DentSide Remote unifies teledentistry, insurance review, freelance gigs, and corporate roles into a single dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto bg-primary-gradient text-white px-8 py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all shadow-[0_8px_20px_rgba(0,93,144,0.25)] hover:shadow-[0_12px_24px_rgba(0,93,144,0.35)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                Create Free Profile <span className="material-symbols-outlined">rocket_launch</span>
              </button>
              <button className="w-full sm:w-auto bg-surface-container-lowest hover:bg-surface-container-low text-on-surface border border-outline-variant/30 px-8 py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all shadow-sm flex items-center justify-center gap-2 group">
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">play_circle</span> Watch Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-background relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold font-headline mb-4">Every Opportunity, One Login</h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">We've consolidated the fragmented remote dental market so you can focus on what you do best: providing clinical expertise.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon="video_camera_front"
              title="Teledentistry"
              description="Built-in HIPAA-compliant video. 5-30 min sessions for emergency advice, triage, and treatment planning."
            />
            <FeatureCard 
              icon="plagiarism"
              title="Claims Vault"
              description="Review records remotely for major insurers. Submit expert opinions for prior authorizations."
            />
            <FeatureCard 
              icon="work"
              title="Freelance Gigs"
              description="Dental writing, online tutoring, and consulting. Bid on projects or post your own services."
            />
            <FeatureCard 
              icon="apartment"
              title="Corporate Roles"
              description="Curated job board for remote roles at DSOs and tech companies. One-click apply."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-surface-container-lowest border-y border-outline-variant/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-fixed/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold font-headline mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">Start exploring gigs for free. Upgrade to Consult Pro when you're ready to maximize your clinical earnings.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-surface-container flex flex-col p-8 rounded-2xl border border-transparent hover:border-outline-variant/30 transition-colors">
              <div className="mb-8">
                <span className="bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Base Profile</span>
                <h3 className="text-4xl font-extrabold font-headline mt-4 mb-2">Free</h3>
                <p className="text-on-surface-variant text-sm">Perfect for building your digital clinical presence.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-sm text-on-surface-variant font-medium">Access to freelance gigs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-sm text-on-surface-variant font-medium">Standard identity verification</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-sm text-on-surface-variant font-medium">Global wallet withdrawals</span>
                </li>
              </ul>
              <button onClick={onGetStarted} className="w-full bg-white border border-outline-variant/30 text-on-surface py-4 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-surface-container-lowest transition-colors shadow-sm">
                Get Started
              </button>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="bg-primary-gradient p-8 rounded-2xl text-white shadow-2xl relative shadow-primary/20 flex flex-col border border-primary-fixed/20 transform md:-translate-y-4">
              <div className="absolute top-0 right-0 p-6 pointer-events-none">
                <span className="material-symbols-outlined text-5xl opacity-20" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              </div>
              <div className="mb-8 relative z-10">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">Consult Pro</span>
                <h3 className="text-4xl font-extrabold font-headline mt-4 mb-2">$49<span className="text-lg font-normal opacity-80">/mo</span></h3>
                <p className="text-primary-fixed-dim text-sm">The ultimate toolkit for remote dental pioneers.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-1 relative z-10">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary-fixed text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-sm font-medium">Priority matching for high-rate consults</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary-fixed text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-sm font-medium">0% marketplace commission</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary-fixed text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-sm font-medium">Expedited clinical verification</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary-fixed text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-sm font-medium">Premium support network</span>
                </li>
              </ul>
              <button 
                onClick={onGetStarted} 
                className="w-full bg-white text-primary py-4 rounded-xl text-sm font-extrabold tracking-widest uppercase hover:bg-surface-container-low transition-all active:scale-95 shadow-[0_8px_16px_rgba(255,255,255,0.15)] relative z-10"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-low py-12 border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            <span className="text-xl font-extrabold text-on-surface font-headline tracking-tighter">DentSide Remote</span>
          </div>
          <p className="text-on-surface-variant text-sm text-center md:text-left">© 2026 DentSide Remote. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-bold uppercase tracking-wider">Terms</Link>
            <Link to="/privacy" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-bold uppercase tracking-wider">Privacy</Link>
            <a href="mailto:support@dentsideremote.com" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-bold uppercase tracking-wider">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/10 p-6 rounded-2xl hover:shadow-[0px_12px_32px_rgba(25,28,30,0.06)] transition-all group">
      <div className="bg-primary/5 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all text-primary">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h3 className="text-xl font-bold font-headline mb-3">{title}</h3>
      <p className="text-on-surface-variant text-sm leading-relaxed">{description}</p>
    </div>
  );
}
