import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, ShieldCheck, Stethoscope, Video, FileText, Briefcase, Zap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-teal-600 p-2 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">DentSide Remote</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-teal-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-teal-600 transition-colors">How it Works</a>
              <a href="#pricing" className="hover:text-teal-600 transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors hidden sm:block">
                Log in
              </button>
              <button 
                onClick={onGetStarted}
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/dentist-office/1920/1080?blur=10')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/50 to-slate-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold tracking-wide uppercase mb-6 border border-teal-200">
                The Future of Dental Careers
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
                Your All-in-One <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Remote Career Hub</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                Stop jumping between platforms. DentSide Remote unifies teledentistry, insurance review, freelance gigs, and corporate roles into a single, powerful dashboard.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={onGetStarted}
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Start Earning Today <ArrowRight className="w-5 h-5" />
                </button>
                <button className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-full text-lg font-medium transition-all shadow-sm flex items-center justify-center gap-2">
                  <Video className="w-5 h-5 text-slate-400" /> Watch Demo
                </button>
              </div>
              <p className="mt-6 text-sm text-slate-500">
                Built for international dentists. Global payments supported.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Every Opportunity, One Login</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">We've consolidated the fragmented remote dental market so you can focus on what you do best: providing expertise.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Video className="w-8 h-8 text-blue-500" />}
              title="Teledentistry"
              description="Built-in HIPAA-compliant video. 5-30 min sessions for emergency advice, triage, and treatment planning. Earn $50-$150+ per consult."
              delay={0.1}
            />
            <FeatureCard 
              icon={<FileText className="w-8 h-8 text-emerald-500" />}
              title="Claims Vault"
              description="Review records remotely for major insurers. Submit expert opinions for prior authorizations and utilization management."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Briefcase className="w-8 h-8 text-purple-500" />}
              title="Freelance Gigs"
              description="Dental writing, online tutoring, and consulting. Bid on projects or post your own services. Zero fees on your first 5 gigs."
              delay={0.3}
            />
            <FeatureCard 
              icon={<Globe className="w-8 h-8 text-orange-500" />}
              title="Corporate Roles"
              description="Curated job board for remote roles at DSOs and tech companies. One-click apply with your pre-filled dentist profile."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Designed for the Modern Global Dentist</h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Whether you're based in the US or working internationally from Kenya, DentSide Remote breaks down borders. We handle the complex matching, you handle the expertise.
              </p>
              
              <ul className="space-y-6">
                <ListItem icon={<Zap className="w-6 h-6 text-yellow-400" />} title="Smart AI Matchmaker" desc="Upload your CV once. Our AI suggests the best-paying gigs based on your availability and skills." />
                <ListItem icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />} title="Automatic License Verification" desc="Seamless onboarding. Full support for non-U.S. licenses on non-clinical gigs." />
                <ListItem icon={<Globe className="w-6 h-6 text-blue-400" />} title="Global Payments" desc="Get paid weekly via PayPal, Wise, or direct to your local bank account." />
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-blue-500 rounded-2xl blur-2xl opacity-20"></div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 relative shadow-2xl">
                <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">AI Matchmaker</h3>
                      <p className="text-xs text-slate-400">Finding your next gig...</p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-500/30">Active</span>
                </div>
                
                <div className="space-y-4">
                  <MatchCard title="UHC Claims Review" type="Insurance" rate="$85/hr" match="98%" />
                  <MatchCard title="Emergency Consult (UK)" type="Teledentistry" rate="$120/session" match="95%" />
                  <MatchCard title="Dental Blog Writer" type="Freelance" rate="$300/post" match="88%" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-600" />
            <span className="text-xl font-bold text-slate-900">DentSide Remote</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 DentSide Remote. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="text-slate-400 hover:text-teal-600 transition-colors">Terms</Link>
            <Link to="/privacy" className="text-slate-400 hover:text-teal-600 transition-colors">Privacy</Link>
            <a href="mailto:support@dentsideremote.com" className="text-slate-400 hover:text-teal-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-slate-50 border border-slate-100 p-8 rounded-2xl hover:shadow-xl hover:border-teal-100 transition-all group"
    >
      <div className="bg-white w-16 h-16 rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function ListItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <li className="flex gap-4">
      <div className="mt-1 bg-slate-800 p-2 rounded-lg h-fit border border-slate-700">
        {icon}
      </div>
      <div>
        <h4 className="text-white font-semibold text-lg mb-1">{title}</h4>
        <p className="text-slate-400">{desc}</p>
      </div>
    </li>
  );
}

function MatchCard({ title, type, rate, match }: { title: string, type: string, rate: string, match: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors cursor-pointer">
      <div>
        <h4 className="text-white font-medium mb-1">{title}</h4>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">{type}</span>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <span className="text-teal-400 font-medium">{rate}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-slate-400">Match</span>
        <span className="text-sm font-bold text-white bg-slate-800 px-2 py-1 rounded-md border border-slate-600">{match}</span>
      </div>
    </div>
  );
}
