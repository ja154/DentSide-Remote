import {
  ArrowRight,
  Bell,
  Briefcase,
  ChevronDown,
  CirclePlus,
  LayoutDashboard,
  Search,
  SearchX,
  SlidersHorizontal,
  UserCircle2,
  Wallet,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type FilterPillProps = {
  label: string;
  value: string;
  icon?: ReactNode;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
  }`;

function FilterPill({ label, value, icon }: FilterPillProps) {
  return (
    <button className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 shadow-sm transition-colors hover:bg-slate-50">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
      {icon}
    </button>
  );
}

const TRENDING_SKILLS = ['Invisalign', 'iTero Scanning', 'Dental AI', 'Sleep Apnea'];

export default function OpportunityEngine() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background pb-24 text-on-surface font-body md:pb-0">
      <header className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/dashboard" className="text-xl font-extrabold tracking-tight text-primary">DentSide</Link>
          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/dashboard" className={navLinkClass}><LayoutDashboard className="h-4 w-4" />Dashboard</NavLink>
            <NavLink to="/opportunities" className={navLinkClass}><Briefcase className="h-4 w-4" />Gigs</NavLink>
            <NavLink to="/wallet" className={navLinkClass}><Wallet className="h-4 w-4" />Wallet</NavLink>
            <NavLink to="/verification" className={navLinkClass}><UserCircle2 className="h-4 w-4" />Profile</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <button className="rounded-xl p-2 text-slate-600 hover:bg-slate-100" aria-label="Open notifications"><Bell className="h-5 w-5" /></button>
            <div className="h-8 w-8 overflow-hidden rounded-full border border-slate-200">
              <img alt="User avatar" src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
        <div className="mb-10">
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">Opportunity Engine</h1>
          <p className="max-w-2xl text-lg text-slate-600">Find verified remote dental gigs, specialist consults, and high-trust opportunities that match your profile.</p>
        </div>

        <section className="mb-8 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 text-sm outline-none ring-primary focus:ring-2"
              placeholder="Search by role or clinic name..."
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterPill label="Type" value="All Opportunities" icon={<ChevronDown size={16} />} />
            <FilterPill label="Location" value="Remote Only" icon={<ChevronDown size={16} />} />
            <FilterPill label="Rate" value="$100+/hr" icon={<SlidersHorizontal size={16} />} />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 pb-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <SearchX className="h-8 w-8 text-slate-400" />
              </div>
              <h4 className="mb-2 text-xl font-bold">No matching gigs found</h4>
              <p className="mx-auto mb-6 max-w-md text-slate-600">No active opportunities match your current filters. Clear filters to discover more openings.</p>
              <button onClick={() => setSearchQuery('')} className="rounded-xl bg-primary/10 px-6 py-2.5 text-sm font-bold text-primary hover:bg-primary/20">Clear filters</button>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">Your Reach</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Profile Visibility</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">TOP 5%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-full w-[85%] rounded-full bg-primary" /></div>
                <p className="text-xs text-slate-600">Your profile was viewed by 12 dental clinics in the last 24 hours.</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">Trending skills</h4>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SKILLS.map((skill) => (
                  <div key={skill} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold">{skill}</div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-primary p-6 text-white shadow-md">
              <h5 className="text-xl font-bold">Upgrade to Consult Pro</h5>
              <p className="mb-4 mt-2 text-sm text-white/90">Get priority access to high-value specialist consults and daily rate guarantees.</p>
              <Link to="/verification" className="inline-flex items-center gap-2 text-sm font-bold">Learn more <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <NavLink to="/dashboard" className={navLinkClass}><LayoutDashboard className="h-4 w-4" />Home</NavLink>
          <NavLink to="/opportunities" className={navLinkClass}><Briefcase className="h-4 w-4" />Gigs</NavLink>
          <NavLink to="/wallet" className={navLinkClass}><Wallet className="h-4 w-4" />Wallet</NavLink>
          <NavLink to="/verification" className={navLinkClass}><UserCircle2 className="h-4 w-4" />Profile</NavLink>
        </div>
      </nav>

      <button
        onClick={() => navigate('/opportunities')}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xl transition-transform hover:scale-110 active:scale-95 md:bottom-8 md:right-8"
        aria-label="Create opportunity alert"
      >
        <CirclePlus className="h-6 w-6" />
      </button>
    </div>
  );
}
