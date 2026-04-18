import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Wallet() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-surface min-h-screen font-body">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#f7f9fb]/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="text-xl font-extrabold text-[#0077B6] tracking-tighter font-headline">DentSide</div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/dashboard" className="text-slate-500 hover:text-[#0077B6] transition-colors font-semibold text-sm">Dashboard</Link>
              <Link to="/opportunities" className="text-slate-500 hover:text-[#0077B6] transition-colors font-semibold text-sm">Gigs</Link>
              <Link to="/wallet" className="text-[#0077B6] font-semibold text-sm">Wallet</Link>
              <Link to="/verification" className="text-slate-500 hover:text-[#0077B6] transition-colors font-semibold text-sm">Profile</Link>
            </nav>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-500 hover:bg-[#f7f9fb] p-2 rounded-full transition-colors cursor-pointer">notifications</span>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30">
                <img alt="User avatar" src={profile?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 pl-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">Wallet & Earnings</h1>
          <p className="text-on-surface-variant font-body text-lg max-w-2xl">Manage your clinical earnings, track pending settlements, and choose your preferred withdrawal method with clinical precision.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Financial Status */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Balance Card */}
            <div className="md:col-span-2 bg-gradient-to-br from-primary to-primary-container p-8 rounded-xl shadow-lg text-on-primary relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <p className="text-on-primary/70 uppercase tracking-widest text-xs font-bold mb-1">Available Balance</p>
                    <h2 className="text-5xl font-extrabold tracking-tighter font-headline">$0.00</h2>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                    <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-surface-container-lowest text-primary px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all scale-95 active:scale-100 hover:shadow-xl uppercase">Withdraw Now</button>
                  <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all hover:bg-white/20 uppercase">Add Funds</button>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* Pending Status Container */}
            <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between h-full min-h-[160px]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-tertiary">schedule</span>
                  <span className="text-on-surface-variant font-semibold text-sm">Pending Settlements</span>
                </div>
                <h3 className="text-2xl font-bold text-on-surface font-headline">$0.00</h3>
              </div>
              <div className="mt-4">
                <p className="text-xs text-on-surface-variant leading-relaxed">Payments currently in clearing from completed consultations.</p>
              </div>
            </div>

            {/* Next Payout Container */}
            <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between h-full min-h-[160px]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary">event_repeat</span>
                  <span className="text-on-surface-variant font-semibold text-sm">Automated Payout</span>
                </div>
                <h3 className="text-2xl font-bold text-on-surface font-headline">Not Scheduled</h3>
              </div>
              <div className="mt-4">
                <p className="text-xs text-on-surface-variant leading-relaxed">Scheduled for your linked Stripe account.</p>
              </div>
            </div>

            {/* Transaction History */}
            <div className="md:col-span-2 mt-4">
              <div className="flex items-end justify-between mb-6 px-2">
                <h3 className="text-2xl font-bold font-headline">Recent Activity</h3>
                <Link to="/wallet" className="text-primary font-bold text-sm hover:underline">View Full Ledger</Link>
              </div>
              <div className="space-y-4">
                <div className="bg-surface-container-low p-8 text-center rounded-xl border border-dashed border-outline-variant">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">receipt_long</span>
                  <h4 className="font-bold text-lg mb-1 font-headline">No Transactions Yet</h4>
                  <p className="text-on-surface-variant text-sm">Your recent earnings and withdrawals will appear here.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Methods & Security */}
          <div className="lg:col-span-4 space-y-8">
            {/* Payout Methods Selection */}
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/5">
              <h3 className="text-xl font-bold mb-6 font-headline">Payout Channels</h3>
              <div className="space-y-4">
                {/* Stripe Method */}
                <div className="relative cursor-pointer border-2 border-primary bg-primary/5 p-4 rounded-xl flex items-center gap-4 group transition-all">
                  <div className="w-12 h-12 bg-[#635BFF] rounded-lg flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined">credit_card</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-on-surface">Stripe Connect</p>
                      <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">Direct bank transfer. Global.</p>
                  </div>
                </div>

                {/* M-Pesa Method */}
                <div className="relative cursor-pointer border-2 border-transparent bg-surface-container-low p-4 rounded-xl flex items-center gap-4 group hover:bg-surface-container-high transition-all">
                  <div className="w-12 h-12 bg-[#4CAF50] rounded-lg flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined">smartphone</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-on-surface">M-Pesa Mobile</p>
                    <p className="text-xs text-on-surface-variant">Instant mobile wallet. Region: East Africa.</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 flex items-center justify-center gap-2 border border-outline-variant text-on-surface-variant p-3 rounded-xl text-sm font-bold hover:bg-surface-container-low transition-colors uppercase tracking-widest">
                <span className="material-symbols-outlined text-lg">add</span>
                Link New Account
              </button>
            </section>

            {/* Security Assurance */}
            <section className="bg-[#001d32] p-8 rounded-xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-primary-fixed-dim text-4xl mb-4">verified_user</span>
                <h3 className="text-xl font-bold mb-2 font-headline">Enterprise Grade Security</h3>
                <p className="text-primary-fixed-dim/70 text-sm leading-relaxed mb-6">Your financial data is protected with AES-256 encryption. We comply with PCI-DSS standards to ensure every gig settlement is secure.</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-xs font-semibold">
                    <span className="material-symbols-outlined text-primary-fixed-dim text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                    Encrypted Vault Access
                  </li>
                  <li className="flex items-center gap-2 text-xs font-semibold">
                    <span className="material-symbols-outlined text-primary-fixed-dim text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Multi-Factor Auth Required
                  </li>
                </ul>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
            </section>

            {/* Help/Support Well */}
            <div className="bg-surface-container-low p-6 rounded-xl">
              <h4 className="font-bold text-on-surface mb-2">Need assistance?</h4>
              <p className="text-xs text-on-surface-variant mb-4">Our financial compliance team is available 24/7 for dental practitioners.</p>
              <a href="mailto:support@dentsideremote.com" className="text-primary text-xs font-bold flex items-center gap-1 group">
                Contact Support 
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-3xl bg-white/80 backdrop-blur-xl shadow-[0px_-12px_32px_rgba(25,28,30,0.06)] border-t border-slate-100/10 h-20 px-4 pb-safe flex justify-around items-center">
        <Link to="/dashboard" className="flex flex-col items-center justify-center text-slate-400 hover:text-[#0077B6] transition-all">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Dashboard</span>
        </Link>
        <Link to="/opportunities" className="flex flex-col items-center justify-center text-slate-400 hover:text-[#0077B6] transition-all">
          <span className="material-symbols-outlined">work_outline</span>
          <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Gigs</span>
        </Link>
        <Link to="/wallet" className="flex flex-col items-center justify-center bg-[#0077B6]/10 text-[#0077B6] rounded-xl px-4 py-1 scale-110 duration-200">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
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
