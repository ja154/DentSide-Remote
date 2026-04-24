import {
  ArrowRight,
  Briefcase,
  ChevronDown,
  CirclePlus,
  Search,
  SearchX,
  SlidersHorizontal,
  User,
  Wallet,
  Bell,
  LayoutDashboard,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type FilterPillProps = {
  label: string;
  value: string;
  icon?: ReactNode;
};

function FilterPill({ label, value, icon }: FilterPillProps) {
  return (
    <div className="bg-surface-container-lowest px-4 h-11 flex items-center gap-2 rounded-lg cursor-pointer hover:bg-white transition-colors shadow-sm">
      <span className="text-xs font-bold uppercase tracking-wider text-outline font-label">{label}</span>
      <span className="text-sm font-semibold text-on-surface">{value}</span>
      {icon}
    </div>
  );
}

const TRENDING_SKILLS = [
  { name: 'Invisalign', accent: 'bg-primary' },
  { name: 'iTero Scanning', accent: 'bg-primary' },
  { name: 'Dental AI', accent: 'bg-tertiary-container' },
  { name: 'Sleep Apnea', accent: 'bg-primary' },
];

export default function OpportunityEngine() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-background text-on-surface font-body min-h-screen pb-24 md:pb-0">
      <header className="fixed top-0 w-full z-50 bg-[#f7f9fb]/80 backdrop-blur-xl shadow-sm h-16 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-xl font-extrabold text-[#0077B6] tracking-tighter font-headline">DentSide</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/dashboard" className="text-slate-500 hover:text-[#0077B6] font-semibold text-sm font-label transition-colors">Dashboard</Link>
          <Link to="/opportunities" className="text-[#0077B6] font-semibold text-sm font-label transition-colors">Gigs</Link>
          <Link to="/wallet" className="text-slate-500 hover:text-[#0077B6] font-semibold text-sm font-label transition-colors">Wallet</Link>
          <Link to="/verification" className="text-slate-500 hover:text-[#0077B6] font-semibold text-sm font-label transition-colors">Profile</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full text-[#0077B6] hover:bg-[#f7f9fb] transition-colors scale-95 active:duration-100" aria-label="Open notifications">
            <Bell size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden">
            <img alt="User avatar" src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} />
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">Opportunity Engine</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">Find your next clinical challenge. Filter through verified dental gigs, specialist consults, and remote opportunities.</p>
        </div>

        <section className="bg-surface-container-low rounded-xl p-4 mb-8 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-surface-container-lowest border-none rounded-lg pl-10 h-11 text-sm focus:ring-2 focus:ring-primary"
              placeholder="Search by role or clinic name..."
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterPill label="Type" value="All Opportunities" icon={<ChevronDown size={16} />} />
            <FilterPill label="Location" value="Remote Only" icon={<ChevronDown size={16} />} />
            <FilterPill label="Rate" value="$100+/hr" icon={<SlidersHorizontal size={16} />} />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-surface-container-lowest p-12 text-center rounded-xl shadow-sm border border-dashed border-outline-variant flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                <SearchX size={32} className="text-outline" />
              </div>
              <h4 className="font-bold text-xl mb-2 font-headline">No matching gigs found</h4>
              <p className="text-on-surface-variant max-w-md mx-auto mb-6">There are currently no active opportunities matching your profile criteria. Check back later or adjust your filters.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="bg-primary/10 text-primary px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide hover:bg-primary/20 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-container p-6 rounded-xl">
              <h4 className="text-sm font-bold uppercase tracking-widest text-outline mb-4">Your Reach</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Profile Visibility</span>
                  <span className="bg-tertiary-container text-on-tertiary-container px-2 py-1 rounded-full text-[10px] font-bold">TOP 5%</span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[85%] rounded-full"></div>
                </div>
                <p className="text-xs text-on-surface-variant">Your profile was viewed by 12 dental clinics in the last 24 hours.</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/10 p-6 rounded-xl">
              <h4 className="text-sm font-bold uppercase tracking-widest text-outline mb-4">Trending Skills</h4>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SKILLS.map((skill) => (
                  <div key={skill.name} className="px-3 py-2 bg-surface-container-low rounded-lg flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${skill.accent}`}></span>
                    <span className="text-xs font-bold">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-primary h-48 group">
              <img alt="Consulting" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9pgYMxzufi-afq7d2dPKd5_hv8xSLWqSnEj_DSwYT21vmrrwnXqa0CF4ufWQXUmhJ6TCSBV-kmcqTwPmAbSFS36IYsReSvYmnWUkhWS5ZUPmH7Tr13VWgffyI_dHbwvouPGp_pcqBx3gDZVxlzIeciBDIA3qX9MsR_L7W_futaLf36H9YqnRx3t-E-A9S3wu86KtYXspNXeq3D0wdplnIZk63gEhIhTmkawR61Jw8neW0EDOFaVg1r0mVw6rNhyOZj0ATIW98zvU" />
              <div className="relative h-full p-6 flex flex-col justify-end">
                <h5 className="text-white font-headline font-bold text-xl leading-tight mb-2">Upgrade to Consult Pro</h5>
                <p className="text-on-primary-container text-xs mb-4">Get priority access to high-value specialist consults and daily rate guarantees.</p>
                <Link to="/verification" className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  Learn More <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-white/80 backdrop-blur-xl rounded-t-3xl shadow-[0px_-12px_32px_rgba(25,28,30,0.06)] border-t border-slate-100/10 h-20 px-4 pb-safe flex justify-around items-center">
        <Link to="/dashboard" className="flex flex-col items-center justify-center text-slate-400 font-inter text-[11px] font-semibold tracking-wide uppercase">
          <LayoutDashboard size={18} className="mb-1" />
          Dashboard
        </Link>
        <Link to="/opportunities" className="flex flex-col items-center justify-center bg-[#0077B6]/10 text-[#0077B6] rounded-xl px-4 py-1 font-inter text-[11px] font-semibold tracking-wide uppercase scale-110 duration-200">
          <Briefcase size={18} className="mb-1" />
          Gigs
        </Link>
        <Link to="/wallet" className="flex flex-col items-center justify-center text-slate-400 font-inter text-[11px] font-semibold tracking-wide uppercase">
          <Wallet size={18} className="mb-1" />
          Wallet
        </Link>
        <Link to="/verification" className="flex flex-col items-center justify-center text-slate-400 font-inter text-[11px] font-semibold tracking-wide uppercase">
          <User size={18} className="mb-1" />
          Profile
        </Link>
      </nav>

      <button
        onClick={() => navigate('/opportunities')}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 bg-primary-gradient text-white w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-40"
        aria-label="Create opportunity alert"
      >
        <CirclePlus size={22} />
      </button>
    </div>
  );
}
