import React, { useEffect, useState } from 'react';
import { ArrowRight, Loader2, MapPin, Search, SearchX, ShieldCheck, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';
import { apiRequest, type PublicDentistProfile } from '../lib/api';

export default function ClientNetwork() {
  const [query, setQuery] = useState('');
  const [dentists, setDentists] = useState<PublicDentistProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        setError('');
        const search = query.trim();
        const searchParams = new URLSearchParams();

        if (search) {
          searchParams.set('search', search);
        }

        const path = searchParams.size > 0 ? `/api/dentists?${searchParams.toString()}` : '/api/dentists';
        const data = await apiRequest<PublicDentistProfile[]>(path);

        if (!cancelled) {
          setDentists(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          const message =
            loadError instanceof Error ? loadError.message : 'Unable to load verified dentists right now.';
          setError(message);
          setDentists([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <ClientLayout title="Find a Dentist">
      <div className="ds-page-header">
        <p className="ds-page-eyebrow">Network</p>
        <h1 className="ds-page-title">Find a Dentist</h1>
        <p className="ds-page-subtitle">
          Browse verified professionals, review their clinical focus, and request a teledentistry consult in one step.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="ds-card p-4 sm:p-5 mb-7">
            <div className="relative">
              <Search
                size={14}
                color="var(--color-fog-4)"
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                className="ds-input pl-9"
                placeholder="Search by name, specialty, or interest…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="ds-card p-14 text-center">
              <Loader2
                size={28}
                className="mx-auto mb-4 animate-spin text-[var(--color-teal)]"
              />
              <p className="text-[13px] text-[var(--color-ink-4)]">
                Loading verified dentists…
              </p>
            </div>
          ) : dentists.length === 0 ? (
            <div className="ds-card p-14 text-center">
              <SearchX
                size={40}
                color="var(--color-fog-3)"
                style={{ margin: '0 auto 16px' }}
              />
              <h4 className="text-[16px] font-semibold text-[var(--color-ink)] mb-2">
                No matches found
              </h4>
              <p className="text-[13px] text-[var(--color-ink-4)] max-w-[420px] mx-auto leading-relaxed">
                Try a broader keyword or clear your search to see all approved dentists in the network.
              </p>
              <button
                onClick={() => setQuery('')}
                className="ds-btn ds-btn-ghost ds-btn-sm mt-5"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {dentists.map((dentist) => {
                const selectedDentistSearch = new URLSearchParams({
                  dentistId: dentist.id,
                  dentistName: dentist.displayName || 'Assigned dentist',
                });

                return (
                  <div key={dentist.id} className="ds-card p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="ds-avatar ds-avatar-md" style={{ width: 52, height: 52 }}>
                          <img
                            src={
                              dentist.photoURL ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${dentist.displayName || 'D'}`
                            }
                            alt={dentist.displayName || 'Dentist'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <p className="text-[16px] font-semibold text-[var(--color-ink)]">
                              {dentist.displayName || 'Verified dentist'}
                            </p>
                            <span className="ds-badge ds-badge-teal">
                              <ShieldCheck size={12} />
                              Approved
                            </span>
                          </div>

                          <p className="text-[13px] text-[var(--color-ink-4)] leading-relaxed">
                            {dentist.experience || 'General dentistry consults and remote case review.'}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 mt-4 text-[13px] text-[var(--color-ink-4)]">
                            <span className="inline-flex items-center gap-2">
                              <MapPin size={14} />
                              {dentist.availability || 'Remote availability not listed'}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Stethoscope size={14} />
                              {dentist.onboardingComplete ? 'Onboarding complete' : 'Profile in progress'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-3 lg:items-end">
                        <Link
                          to={`/client/appointments?${selectedDentistSearch.toString()}`}
                          className="ds-btn ds-btn-primary ds-btn-sm no-underline"
                        >
                          Request Consult
                          <ArrowRight size={14} />
                        </Link>
                        <p className="text-[12px] text-[var(--color-ink-4)]">
                          {dentist.interests?.length
                            ? `${dentist.interests.length} clinical interest area${dentist.interests.length === 1 ? '' : 's'}`
                            : 'Profile ready for first consult requests'}
                        </p>
                      </div>
                    </div>

                    {dentist.interests && dentist.interests.length > 0 ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {dentist.interests.slice(0, 6).map((interest) => (
                          <span key={interest} className="ds-tag">
                            {interest}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {error ? <p className="mt-4 text-[13px] text-[var(--color-ruby)]">{error}</p> : null}
        </div>

        <aside className="flex flex-col gap-5">
          <div className="ds-card p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-teal)] mb-3">
              Verified Directory
            </p>
            <h2 className="text-[18px] font-semibold text-[var(--color-ink)] mb-2">
              Approved clinicians only
            </h2>
            <p className="text-[13px] leading-relaxed text-[var(--color-ink-4)]">
              This directory is powered by the new server-side dentist endpoint, so clients only see practitioners whose verification has been approved.
            </p>
          </div>

          <div className="ds-card p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-4)] mb-3">
              What happens next
            </p>
            <div className="space-y-3 text-[13px] text-[var(--color-ink-4)] leading-relaxed">
              <p>Choose a dentist whose experience matches the consult you need.</p>
              <p>Send a reason for the visit and optionally suggest a time.</p>
              <p>The dentist can then confirm, complete, or cancel the appointment from their dashboard.</p>
            </div>
          </div>
        </aside>
      </div>
    </ClientLayout>
  );
}
