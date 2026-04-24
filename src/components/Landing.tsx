import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Briefcase, Building2, PlayCircle, ShieldCheck, Stethoscope, Video } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface">
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-primary">
            <Stethoscope className="h-6 w-6" />
            <span className="text-xl font-extrabold tracking-tight">DentSide</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-primary">Features</a>
            <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-primary">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onGetStarted} className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:block">
              Log in
            </button>
            <button onClick={onGetStarted} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary/90">
              Start earning <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden pb-24 pt-40">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mx-auto max-w-4xl">
            <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary">
              <BadgeCheck className="h-4 w-4" /> The Future of Dental Careers
            </span>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-7xl">
              Your all-in-one <span className="text-primary">remote career hub</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 md:text-xl">
              DentSide Remote unifies teledentistry, insurance review, freelance gigs, and corporate roles into one trusted dashboard.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button onClick={onGetStarted} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-md hover:bg-primary/90 sm:w-auto">
                Create free profile <ArrowRight className="h-4 w-4" />
              </button>
              <a href="#features" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto">
                <PlayCircle className="h-4 w-4 text-primary" /> Watch demo
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">Every opportunity, one login</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">Focus on clinical excellence while we centralize remote opportunities and credential trust.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={<Video className="h-6 w-6" />} title="Teledentistry" description="Built-in secure video for triage, consults, and treatment planning." />
            <FeatureCard icon={<ShieldCheck className="h-6 w-6" />} title="Claims Vault" description="Review records remotely and submit expert prior-authorization insights." />
            <FeatureCard icon={<Briefcase className="h-6 w-6" />} title="Freelance Gigs" description="Bid on writing, tutoring, and consulting projects in one place." />
            <FeatureCard icon={<Building2 className="h-6 w-6" />} title="Corporate Roles" description="Discover curated remote roles from DSOs and dental tech companies." />
          </div>
        </div>
      </section>

      <section id="pricing" className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto grid max-w-4xl gap-6 px-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h3 className="text-3xl font-extrabold">Free</h3>
            <p className="mt-2 text-sm text-slate-600">Perfect for getting started and building visibility.</p>
            <button onClick={onGetStarted} className="mt-8 w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Get started</button>
          </div>
          <div className="rounded-2xl bg-primary p-8 text-white shadow-xl">
            <h3 className="text-3xl font-extrabold">Consult Pro</h3>
            <p className="mt-2 text-sm text-white/90">Priority matching, expedited verification, and premium support.</p>
            <button onClick={onGetStarted} className="mt-8 w-full rounded-xl bg-white py-3 text-sm font-bold text-primary hover:bg-slate-100">Upgrade to Pro</button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">DentSide Remote</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 DentSide Remote. All rights reserved.</p>
          <div className="flex gap-5 text-sm font-semibold text-slate-600">
            <Link to="/terms" className="hover:text-primary">Terms</Link>
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
            <a href="mailto:support@dentsideremote.com" className="hover:text-primary">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">{icon}</div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}
