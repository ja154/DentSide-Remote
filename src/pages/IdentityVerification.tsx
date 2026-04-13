import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function IdentityVerification() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-surface min-h-screen font-body">
      {/* Top Navigation Bar */}
      <header className="bg-[#f7f9fb]/80 backdrop-blur-xl shadow-sm fixed top-0 w-full z-50">
        <div className="flex justify-between items-center px-6 h-16 w-full">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-xl font-extrabold text-[#0077B6] tracking-tighter font-headline">DentSide</Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-slate-500 hover:bg-[#f7f9fb] transition-colors p-2 rounded-full">notifications</button>
            <div className="w-8 h-8 rounded-full bg-primary-fixed overflow-hidden ring-2 ring-primary-container/20">
              <img className="w-full h-full object-cover" src={profile?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="User avatar" />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Header Section */}
        <section className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4 font-headline">Identity Verification</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">As a premier platform for dental professionals, we require a standard verification process to ensure the security and clinical integrity of our network.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Verification Progress */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm space-y-8">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold">1</div>
                  <div className="w-0.5 h-12 bg-primary-container/30"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-primary">Step 1</p>
                  <h3 className="text-lg font-bold text-on-surface font-headline">Personal Information</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Basic contact & dental residency details.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold">2</div>
                  <div className="w-0.5 h-12 bg-outline-variant/30"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Step 2</p>
                  <h3 className="text-lg font-bold text-on-surface font-headline">License Verification</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Official state licensure documentation.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold">3</div>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Step 3</p>
                  <h3 className="text-lg font-bold text-on-surface-variant font-headline">Verification Status</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Review and final confirmation.</p>
                </div>
              </div>
            </div>

            <div className="bg-primary-container/5 p-6 rounded-xl border border-primary-container/10">
              <div className="flex items-center gap-3 text-primary mb-3">
                <span className="material-symbols-outlined">security</span>
                <h4 className="font-bold font-headline">Privacy Guaranteed</h4>
              </div>
              <p className="text-sm text-on-secondary-container leading-relaxed">Your data is encrypted using clinical-grade security standards. We never share your license details with third parties.</p>
            </div>
          </aside>

          {/* Right Column: Verification Form Canvas */}
          <div className="lg:col-span-8">
            <div className="space-y-6">
              {/* Personal Info Card */}
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border-l-4 border-primary-container">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-extrabold tracking-tight font-headline">Personal Details</h2>
                  <span className="text-xs font-bold px-3 py-1 bg-tertiary-container/10 text-tertiary-container rounded-full">IN PROGRESS</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label">Legal Full Name</label>
                    <input type="text" defaultValue={profile?.displayName || ''} className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary-container transition-all text-on-surface placeholder:text-on-surface-variant/50" placeholder="Dr. Julianne Mercer" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label">Email Address</label>
                    <input type="email" defaultValue={profile?.email || ''} className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary-container transition-all text-on-surface placeholder:text-on-surface-variant/50" placeholder="j.mercer@dentalhub.com" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label">Current Clinic / Institution</label>
                    <input type="text" className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary-container transition-all text-on-surface placeholder:text-on-surface-variant/50" placeholder="St. Apollonia Dental Center" />
                  </div>
                </div>
              </div>

              {/* License Upload Bento Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* License Info */}
                <div className="bg-surface-container-low p-8 rounded-xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold font-headline">State Licensure</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label">Issuing State</label>
                        <select className="w-full bg-surface-container-lowest border-none rounded-lg p-4 focus:ring-2 focus:ring-primary-container">
                          <option>California</option>
                          <option>New York</option>
                          <option>Texas</option>
                          <option>Florida</option>
                          <option>Kenya</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label">License Number</label>
                        <input type="text" className="w-full bg-surface-container-lowest border-none rounded-lg p-4 focus:ring-2 focus:ring-primary-container" placeholder="DDS-XXXXXX-2024" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Area */}
                <div className="bg-surface-container-highest/40 border-2 border-dashed border-outline-variant p-8 rounded-xl flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-surface-container-highest/60 transition-all">
                  <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary-container text-3xl">upload_file</span>
                  </div>
                  <h4 className="font-bold text-on-surface font-headline">Upload License Photo</h4>
                  <p className="text-xs text-on-surface-variant mt-2 px-4 leading-relaxed">PDF, JPG, or PNG formats. Please ensure all text is legible and edges are visible.</p>
                  <button className="mt-6 text-sm font-bold text-primary underline decoration-2 underline-offset-4">Browse Files</button>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant font-bold hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined">arrow_back</span>
                  Back
                </button>
                <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-10 py-4 rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all">
                  Submit Verification
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Insights Section */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-low p-6 rounded-xl flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <span className="material-symbols-outlined text-blue-600">timer</span>
            </div>
            <div>
              <h5 className="font-bold text-on-surface font-headline">Fast Review</h5>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">Our clinical team typically verifies credentials within 24–48 business hours.</p>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <span className="material-symbols-outlined text-amber-600">verified_user</span>
            </div>
            <div>
              <h5 className="font-bold text-on-surface font-headline">Active Status</h5>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">Once verified, you'll receive a 'Clinical Pro' badge and full access to remote gigs.</p>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <span className="material-symbols-outlined text-emerald-600">help_center</span>
            </div>
            <div>
              <h5 className="font-bold text-on-surface font-headline">Need Help?</h5>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">Our credentialing specialists are available at support@dentside.com</p>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-3xl bg-white/80 backdrop-blur-xl shadow-[0px_-12px_32px_rgba(25,28,30,0.06)] border-t border-slate-100/10">
        <div className="flex justify-around items-center px-4 h-20 w-full pb-safe">
          <Link to="/dashboard" className="flex flex-col items-center justify-center text-slate-400">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Dashboard</span>
          </Link>
          <Link to="/opportunities" className="flex flex-col items-center justify-center text-slate-400">
            <span className="material-symbols-outlined">work_outline</span>
            <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Gigs</span>
          </Link>
          <Link to="/wallet" className="flex flex-col items-center justify-center text-slate-400">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Wallet</span>
          </Link>
          <Link to="/verification" className="flex flex-col items-center justify-center bg-[#0077B6]/10 text-[#0077B6] rounded-xl px-4 py-1">
            <span className="material-symbols-outlined">person</span>
            <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
