import { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  Briefcase,
  LayoutDashboard,
  Loader2,
  LogOut,
  Sparkles,
  UserCircle2,
  Wallet,
  X,
} from 'lucide-react';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
  }`;

export default function Dashboard() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const [apiKey, setApiKey] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileStrength = useMemo(() => {
    const points = [profile?.displayName, profile?.email, profile?.photoURL].filter(Boolean).length;
    return Math.round((points / 3) * 100);
  }, [profile]);

  const handleAIMatch = async () => {
    if (!apiKey) {
      alert('Please enter your Gemini API Key first.');
      return;
    }

    setIsMatching(true);
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          profile: {
            experience: profile?.experience || 'General Dental Practitioner',
            licenses: profile?.licenses || ['Pending License Review'],
            availability: profile?.availability || 'Open',
            interests: profile?.interests || ['General Consulting', 'Teledentistry'],
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch matches');
      }

      const data = await response.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <header className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/dashboard" className="text-xl font-extrabold tracking-tight text-primary">DentSide</Link>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </NavLink>
            <NavLink to="/opportunities" className={navLinkClass}>
              <Briefcase className="h-4 w-4" /> Gigs
            </NavLink>
            <NavLink to="/wallet" className={navLinkClass}>
              <Wallet className="h-4 w-4" /> Wallet
            </NavLink>
            <NavLink to="/verification" className={navLinkClass}>
              <UserCircle2 className="h-4 w-4" /> Profile
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNotifications((current) => !current)}
              className="relative rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100"
              aria-label="Toggle notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary text-[10px] font-semibold text-white">1</span>
            </button>

            {showNotifications && (
              <div className="absolute right-20 top-14 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-bold">Notifications</h4>
                  <button type="button" onClick={() => setShowNotifications(false)} aria-label="Close notifications">
                    <X className="h-4 w-4 text-slate-500" />
                  </button>
                </div>
                <p className="text-xs text-slate-600">Your profile is almost complete. Finish verification to increase your match rate.</p>
              </div>
            )}

            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="hidden items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 md:inline-flex"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>

            <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-primary/20">
              <img alt="User avatar" className="h-full w-full object-cover" src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-24 md:px-6">
        <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">Remote command center</p>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Welcome back, {profile?.displayName || 'Doctor'}</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Stay on top of gigs, complete profile verification, and improve your AI match quality from one dashboard.</p>
          </div>
          <Link
            to="/verification"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" /> Improve Profile
          </Link>
        </section>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
            <p className="text-sm font-semibold text-slate-500">Monthly earnings</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight">$0.00</h2>
            <p className="mt-3 text-sm text-slate-600">No payouts yet this month. Completing verification unlocks premium consult opportunities.</p>
            <Link to="/wallet" className="mt-5 inline-flex rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
              Open wallet
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Profile strength</p>
            <p className="mt-2 text-3xl font-extrabold">{profileStrength}%</p>
            <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${profileStrength}%` }} />
            </div>
            <p className="mt-3 text-xs text-slate-600">Complete your verification checklist to improve this score.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h3 className="mb-4 text-2xl font-bold">Active Gigs</h3>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
              <h4 className="mt-3 text-lg font-bold">No active gigs</h4>
              <p className="mt-1 text-sm text-slate-600">You’re all clear right now. Explore opportunities and apply for new remote roles.</p>
              <Link to="/opportunities" className="mt-4 inline-flex rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                Browse opportunities
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <h3 className="mb-4 text-2xl font-bold">AI Matchmaker</h3>
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gemini API key (BYOK)</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-2">
                <input
                  type="password"
                  placeholder="Enter Gemini API key"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  className="flex-1 border-none bg-transparent px-2 text-sm outline-none"
                />
                <button
                  onClick={handleAIMatch}
                  disabled={isMatching || !apiKey}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isMatching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Find matches'}
                </button>
              </div>

              {matches.length > 0 ? (
                <div className="space-y-3">
                  {matches.map((match, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{match.title}</h4>
                        <span className="text-sm font-bold text-primary">{match.rate}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{match.company} • {match.match} Match</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Add your API key to generate personalized opportunities instantly.</p>
              )}
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
    </div>
  );
}
