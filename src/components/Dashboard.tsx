import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  
  // BYOK State - strictly memory bound 
  const [apiKey, setApiKey] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
  };

  const handleAIMatch = async () => {
    if (!apiKey) {
      alert("Please enter your Gemini API Key first.");
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
            experience: profile?.experience || "General Dental Practitioner",
            licenses: profile?.licenses || ["Pending License Review"],
            availability: profile?.availability || "Open",
            interests: profile?.interests || ["General Consulting", "Teledentistry"]
          }
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch matches');
      }
      
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setMatches(data);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="text-on-surface bg-background min-h-screen font-body">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#f7f9fb]/80 backdrop-blur-xl shadow-sm flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <span className="text-xl font-extrabold text-[#0077B6] tracking-tighter font-headline">DentSide</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/dashboard" className="font-headline font-bold tracking-tight text-[#0077B6]">Dashboard</Link>
          <Link to="/opportunities" className="font-headline font-bold tracking-tight text-slate-500 hover:bg-[#f7f9fb] transition-colors px-3 py-1 rounded-lg">Gigs</Link>
          <Link to="/wallet" className="font-headline font-bold tracking-tight text-slate-500 hover:bg-[#f7f9fb] transition-colors px-3 py-1 rounded-lg">Wallet</Link>
          <Link to="/verification" className="font-headline font-bold tracking-tight text-slate-500 hover:bg-[#f7f9fb] transition-colors px-3 py-1 rounded-lg">Profile</Link>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="p-2 rounded-full hover:bg-surface-container transition-colors text-sm font-bold text-error"
          >
            Logout
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[#0077B6]">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/10">
            <img alt="User avatar" className="w-full h-full object-cover" src={profile?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} />
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        {/* Hero Welcome & Availability */}
        <section className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <p className="text-primary font-semibold tracking-wider text-sm mb-2 uppercase">Precision Hospitality</p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">Welcome back, {profile?.displayName || 'Dr.'}</h1>
            <p className="text-on-surface-variant text-lg max-w-lg leading-relaxed">Your clinical workspace is ready. You have 0 active consultations scheduled for today.</p>
          </div>
          <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</span>
              <span className="font-semibold text-on-surface">Available for Gigs</span>
            </div>
            <button className="relative inline-flex h-7 w-12 items-center rounded-full bg-primary-container">
              <span className="translate-x-6 inline-block h-5 w-5 transform rounded-full bg-white transition shadow-sm"></span>
            </button>
          </div>
        </section>

        {/* Bento Grid Stats & Earnings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Earnings Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-primary to-primary-container rounded-xl p-8 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-primary-fixed/80 font-medium mb-1">Total Earnings This Month</p>
                  <h2 className="text-5xl font-extrabold tracking-tighter font-headline">$0.00</h2>
                </div>
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">0% vs last month</span>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-primary-fixed/60 text-xs font-bold uppercase tracking-widest mb-1">Completed Gigs</p>
                  <p className="text-2xl font-bold font-headline">0</p>
                </div>
                <div>
                  <p className="text-primary-fixed/60 text-xs font-bold uppercase tracking-widest mb-1">Hours Logged</p>
                  <p className="text-2xl font-bold font-headline">0h</p>
                </div>
                <div className="ml-auto">
                  <Link to="/wallet" className="bg-white text-primary px-6 py-3 rounded-xl font-bold text-sm tracking-wide hover:bg-surface-container-low transition-all inline-block">WITHDRAW FUNDS</Link>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
              <span className="material-symbols-outlined text-[300px]">clinical_notes</span>
            </div>
          </div>

          {/* Profile Completion Card */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm flex flex-col border border-outline-variant/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg font-headline">Verification</h3>
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <div className="mb-auto">
              <div className="w-full bg-surface-container rounded-full h-2 mb-4">
                <div className="bg-tertiary-container h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">Your clinical credentials are <span className="font-bold text-on-surface">40% complete</span>. Add your license to unlock gigs.</p>
            </div>
            <Link to="/verification" className="w-full mt-6 outline outline-outline-variant/30 py-3 rounded-xl text-primary font-bold text-sm hover:bg-surface-container transition-colors text-center block">UPDATE LICENSE</Link>
          </div>
        </div>

        {/* Dashboard Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Active Gigs */}
          <div className="lg:col-span-7">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight font-headline">Active Gigs</h2>
              <Link to="/opportunities" className="text-primary font-semibold text-sm hover:underline">View All Schedule</Link>
            </div>
            <div className="space-y-4">
              <div className="bg-surface-container-lowest p-8 text-center rounded-xl shadow-sm border border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">event_busy</span>
                <h4 className="font-bold text-lg mb-1 font-headline">No Active Gigs</h4>
                <p className="text-on-surface-variant text-sm">You don't have any active gigs scheduled for today.</p>
              </div>
            </div>
          </div>

          {/* Recommended Opportunities & AI Matchmaker */}
          <div className="lg:col-span-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight font-headline">AI Matchmaker</h2>
              <button className="p-2 rounded-full hover:bg-surface-container">
                <span className="material-symbols-outlined text-outline">filter_list</span>
              </button>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-4 space-y-4">
              
              <div className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20">
                <span className="material-symbols-outlined text-outline ml-2">key</span>
                <input 
                  type="password" 
                  placeholder="Enter Gemini API Key" 
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  className="bg-transparent border-none text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-0 flex-1"
                />
                <button 
                  onClick={handleAIMatch}
                  disabled={isMatching || !apiKey}
                  className="bg-primary hover:bg-primary/90 disabled:bg-surface-container-highest disabled:text-on-surface-variant text-on-primary px-3 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center gap-2"
                >
                  {isMatching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find Gigs'}
                </button>
              </div>

              {matches.length > 0 ? (
                matches.map((match, idx) => (
                  <div key={idx} className="bg-surface-container-lowest p-5 rounded-xl border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="font-bold font-headline">{match.title}</h5>
                      <span className="text-primary font-bold text-sm">{match.rate}</span>
                    </div>
                    <p className="text-on-surface-variant text-xs mb-4 line-clamp-2">{match.company} • {match.match} Match</p>
                    <div className="flex flex-wrap gap-2">
                      {match.tags.map((tag: string, i: number) => (
                        <span key={i} className="bg-secondary-container/40 text-on-secondary-container px-2 py-1 rounded text-[10px] font-bold uppercase">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-3xl text-outline mb-2">auto_awesome</span>
                  <p className="text-sm text-on-surface-variant">Enter your API key to get personalized gig recommendations.</p>
                </div>
              )}

              <Link to="/opportunities" className="block text-center w-full py-4 text-primary font-bold text-sm tracking-widest uppercase hover:bg-surface-container-high transition-colors rounded-xl">EXPLORE ALL GIGS</Link>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-3xl bg-white/80 backdrop-blur-xl border-t border-slate-100/10 shadow-[0px_-12px_32px_rgba(25,28,30,0.06)] flex justify-around items-center px-4 h-20 pb-safe">
        <Link to="/dashboard" className="flex flex-col items-center justify-center bg-[#0077B6]/10 text-[#0077B6] rounded-xl px-4 py-1">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Dashboard</span>
        </Link>
        <Link to="/opportunities" className="flex flex-col items-center justify-center text-slate-400 hover:text-[#0077B6] transition-all">
          <span className="material-symbols-outlined">work_outline</span>
          <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Gigs</span>
        </Link>
        <Link to="/wallet" className="flex flex-col items-center justify-center text-slate-400 hover:text-[#0077B6] transition-all">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Wallet</span>
        </Link>
        <Link to="/verification" className="flex flex-col items-center justify-center text-slate-400 hover:text-[#0077B6] transition-all">
          <span className="material-symbols-outlined">person</span>
          <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
