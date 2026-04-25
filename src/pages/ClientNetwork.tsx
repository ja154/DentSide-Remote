import React, { useMemo, useState } from 'react';
import { ArrowRight, MapPin, Search, SearchX, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';

type DentistProfile = {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rateLabel: string;
};

const SAMPLE_DENTISTS: DentistProfile[] = [
  {
    id: 'd-1',
    name: 'Dr. Amina Patel',
    specialty: 'General Dentistry',
    location: 'Remote',
    rateLabel: '$85/hr',
  },
  {
    id: 'd-2',
    name: 'Dr. Julian Mercer',
    specialty: 'Orthodontics',
    location: 'Remote',
    rateLabel: '$120/hr',
  },
  {
    id: 'd-3',
    name: 'Dr. Sofia Nguyen',
    specialty: 'Oral Surgery',
    location: 'Remote',
    rateLabel: '$140/hr',
  },
];

export default function ClientNetwork() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAMPLE_DENTISTS;
    return SAMPLE_DENTISTS.filter((dentist) =>
      [dentist.name, dentist.specialty, dentist.location]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  return (
    <ClientLayout title="Find a Dentist">
      <div className="ds-page-header">
        <p className="ds-page-eyebrow">Network</p>
        <h1 className="ds-page-title">Find a Dentist</h1>
        <p className="ds-page-subtitle">
          Browse verified professionals for teledentistry consults and follow-ups.
        </p>
      </div>

      {/* Search */}
      <div className="ds-card p-4 sm:p-5 mb-7">
        <div className="relative">
          <Search
            size={14}
            color="var(--color-fog-4)"
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            className="ds-input pl-9"
            placeholder="Search by name or specialty…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
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
            Try a different keyword or clear your search to see all available dentists.
          </p>
          <button
            onClick={() => setQuery('')}
            className="ds-btn ds-btn-ghost ds-btn-sm mt-5"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="ds-grid-2">
          {results.map((dentist) => (
            <div key={dentist.id} className="ds-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className="ds-feature-icon"
                    style={{ marginBottom: 0, flexShrink: 0 }}
                  >
                    <Stethoscope size={18} color="var(--color-teal)" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[var(--color-ink)]">
                      {dentist.name}
                    </p>
                    <p className="text-[13px] text-[var(--color-ink-4)]">
                      {dentist.specialty}
                    </p>
                  </div>
                </div>
                <span className="ds-badge ds-badge-teal">{dentist.rateLabel}</span>
              </div>

              <div className="flex items-center gap-2 mt-4 text-[13px] text-[var(--color-ink-4)]">
                <MapPin size={14} />
                {dentist.location}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <Link
                  to="/client/appointments"
                  className="ds-btn ds-btn-primary ds-btn-sm no-underline"
                >
                  Request Consult
                  <ArrowRight size={14} />
                </Link>
                <Link
                  to="/client-dashboard"
                  className="text-[13px] text-[var(--color-teal)] font-semibold no-underline hover:opacity-80 transition-opacity"
                >
                  Back to dashboard
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </ClientLayout>
  );
}
