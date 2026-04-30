import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Briefcase,
  CircleAlert,
  FilePenLine,
  Loader2,
  PlusSquare,
  RefreshCcw,
  Search,
  Trash2,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import ClientLayout from '../components/ClientLayout';
import { useAuth } from '../contexts/AuthContext';
import {
  apiRequest,
  getDashboardPathForRole,
  type Gig,
  type GigStatus,
} from '../lib/api';

type GigFormState = {
  title: string;
  company: string;
  type: string;
  rateLabel: string;
  description: string;
  tagsText: string;
  remoteOnly: boolean;
  status: GigStatus;
};

const INITIAL_FORM: GigFormState = {
  title: '',
  company: '',
  type: '',
  rateLabel: '',
  description: '',
  tagsText: '',
  remoteOnly: true,
  status: 'draft',
};

export default function GigStudio() {
  const { profile } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [form, setForm] = useState<GigFormState>(INITIAL_FORM);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGigId, setEditingGigId] = useState<string | null>(null);
  const [closingGigId, setClosingGigId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);

  useEffect(() => {
    loadGigs(true);
  }, []);

  if (!profile) {
    return null;
  }

  if (profile.role !== 'client' && profile.role !== 'admin') {
    return <Navigate to={getDashboardPathForRole(profile.role)} replace />;
  }

  const isAdmin = profile.role === 'admin';
  const Layout = isAdmin ? AdminLayout : ClientLayout;
  const pageTitle = isAdmin ? 'Marketplace Studio' : 'Gig Studio';

  async function loadGigs(initialLoad = false) {
    setError('');
    setStatusMessage('');

    if (initialLoad) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const data = await apiRequest<Gig[]>('/api/gigs');
      setGigs(data);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Unable to load gig listings right now.';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  const managedGigs = useMemo(() => {
    if (isAdmin) {
      return gigs;
    }

    return gigs.filter((gig) => gig.createdBy === profile.uid);
  }, [gigs, isAdmin, profile.uid]);

  const visibleGigs = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    if (!query) {
      return managedGigs;
    }

    return managedGigs.filter((gig) =>
      [gig.title, gig.company, gig.type, gig.description || '', ...gig.tags, gig.createdBy]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [deferredSearch, managedGigs]);

  const counts = useMemo(
    () => ({
      total: managedGigs.length,
      open: managedGigs.filter((gig) => gig.status === 'open').length,
      draft: managedGigs.filter((gig) => gig.status === 'draft').length,
      closed: managedGigs.filter((gig) => gig.status === 'closed').length,
    }),
    [managedGigs],
  );

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingGigId(null);
  };

  const handleEdit = (gig: Gig) => {
    setForm({
      title: gig.title,
      company: gig.company,
      type: gig.type,
      rateLabel: gig.rateLabel,
      description: gig.description || '',
      tagsText: gig.tags.join(', '),
      remoteOnly: gig.remoteOnly,
      status: gig.status,
    });
    setEditingGigId(gig.id);
    setError('');
    setStatusMessage('');
  };

  const handleSubmit = async () => {
    setError('');
    setStatusMessage('');

    const tags = form.tagsText
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      type: form.type.trim(),
      rateLabel: form.rateLabel.trim(),
      description: form.description.trim() || undefined,
      tags,
      remoteOnly: form.remoteOnly,
      status: form.status,
    };

    setIsSubmitting(true);

    try {
      if (editingGigId) {
        const updated = await apiRequest<Gig>(`/api/gigs/${editingGigId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });

        setGigs((current) =>
          current.map((gig) => (gig.id === editingGigId ? updated : gig)),
        );
        setStatusMessage('Gig updated successfully.');
      } else {
        const created = await apiRequest<Gig>('/api/gigs', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        setGigs((current) => [created, ...current]);
        setStatusMessage('Gig created successfully.');
      }

      resetForm();
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Unable to save that gig right now.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseGig = async (gigId: string) => {
    setClosingGigId(gigId);
    setError('');
    setStatusMessage('');

    try {
      await apiRequest<{ id: string; deleted: boolean; status: GigStatus }>(`/api/gigs/${gigId}`, {
        method: 'DELETE',
      });

      setGigs((current) =>
        current.map((gig) =>
          gig.id === gigId
            ? {
                ...gig,
                status: 'closed',
                updatedAt: new Date().toISOString(),
              }
            : gig,
        ),
      );

      if (editingGigId === gigId) {
        resetForm();
      }

      setStatusMessage('Gig closed successfully.');
    } catch (closeError) {
      const message =
        closeError instanceof Error ? closeError.message : 'Unable to close that gig right now.';
      setError(message);
    } finally {
      setClosingGigId(null);
    }
  };

  return (
    <Layout title={pageTitle}>
      <div className="ds-page-header">
        <p className="ds-page-eyebrow">{isAdmin ? 'Marketplace Control' : 'Gig Marketplace'}</p>
        <h1 className="ds-page-title">{isAdmin ? 'Marketplace Studio' : 'Client Gig Studio'}</h1>
        <p className="ds-page-subtitle">
          {isAdmin
            ? 'Create listings, refine marketplace records, and close outdated opportunities without leaving the admin surface.'
            : 'Create and manage the remote roles you want dentists to discover, then publish or close them from one workflow.'}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <div className="ds-card">
            <div className="ds-card-header">
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
                  {editingGigId ? 'Edit Gig' : 'Create Gig'}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>
                  {editingGigId
                    ? 'Update the listing details and save the new marketplace state.'
                    : 'This form posts directly to the gig marketplace API.'}
                </p>
              </div>
              <span className="ds-badge ds-badge-teal">{editingGigId ? 'Editing' : 'Live API'}</span>
            </div>

            <div className="ds-card-body">
              <div className="ds-form-group">
                <label className="ds-label">Title</label>
                <input
                  type="text"
                  className="ds-input"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Remote Treatment Coordinator"
                />
              </div>

              <div className="ds-grid-2">
                <div className="ds-form-group">
                  <label className="ds-label">Company / Clinic</label>
                  <input
                    type="text"
                    className="ds-input"
                    value={form.company}
                    onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                    placeholder="Apollo Dental Group"
                  />
                </div>
                <div className="ds-form-group">
                  <label className="ds-label">Type</label>
                  <input
                    type="text"
                    className="ds-input"
                    value={form.type}
                    onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                    placeholder="Teledentistry"
                  />
                </div>
              </div>

              <div className="ds-grid-2">
                <div className="ds-form-group">
                  <label className="ds-label">Rate Label</label>
                  <input
                    type="text"
                    className="ds-input"
                    value={form.rateLabel}
                    onChange={(event) => setForm((current) => ({ ...current, rateLabel: event.target.value }))}
                    placeholder="$120/hr"
                  />
                </div>
                <div className="ds-form-group">
                  <label className="ds-label">Status</label>
                  <select
                    className="ds-select"
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as GigStatus,
                      }))
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="ds-form-group">
                <label className="ds-label">Description</label>
                <textarea
                  className="ds-input"
                  rows={5}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Outline the responsibilities, expected schedule, and ideal dentist profile."
                  style={{ resize: 'vertical', minHeight: 140 }}
                />
              </div>

              <div className="ds-form-group">
                <label className="ds-label">Tags</label>
                <input
                  type="text"
                  className="ds-input"
                  value={form.tagsText}
                  onChange={(event) => setForm((current) => ({ ...current, tagsText: event.target.value }))}
                  placeholder="Claims review, aligners, treatment planning"
                />
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  color: 'var(--color-ink)',
                  marginBottom: 20,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={form.remoteOnly}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, remoteOnly: event.target.checked }))
                  }
                />
                Remote only
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="ds-btn ds-btn-primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 size={14} className="spin" /> : <PlusSquare size={14} />}
                  {editingGigId ? 'Save Changes' : 'Create Gig'}
                </button>

                {editingGigId ? (
                  <button
                    type="button"
                    className="ds-btn ds-btn-ghost"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="ds-grid-2">
            <StatCard label="Visible Here" value={String(counts.total)} detail="Listings in your management scope." />
            <StatCard label="Open Now" value={String(counts.open)} detail="Listings discoverable by dentists." />
            <StatCard label="Drafts" value={String(counts.draft)} detail="Private listings not yet published." />
            <StatCard label="Closed" value={String(counts.closed)} detail="Soft-closed records kept for audit history." />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="ds-card" style={{ padding: '16px 20px' }}>
            <div className="flex flex-wrap items-center gap-3">
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Search
                  size={14}
                  color="var(--color-fog-4)"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  className="ds-input"
                  style={{ paddingLeft: 36 }}
                  placeholder={isAdmin ? 'Search all gig records…' : 'Search your listings…'}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <button
                type="button"
                className="ds-btn ds-btn-ghost ds-btn-sm"
                onClick={() => loadGigs(false)}
                disabled={isRefreshing}
              >
                {isRefreshing ? <Loader2 size={13} className="spin" /> : <RefreshCcw size={13} />}
                Refresh
              </button>
            </div>
          </div>

          {error ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--color-ruby)',
                background: 'var(--color-ruby-light)',
                color: 'var(--color-ruby)',
                fontSize: 13,
              }}
            >
              <CircleAlert size={15} />
              {error}
            </div>
          ) : null}

          {statusMessage ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--color-sage)',
                background: 'var(--color-sage-light)',
                color: 'var(--color-sage)',
                fontSize: 13,
              }}
            >
              <Briefcase size={15} />
              {statusMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="ds-card" style={{ padding: 56, textAlign: 'center' }}>
              <Loader2
                size={28}
                className="spin"
                color="var(--color-teal)"
                style={{ margin: '0 auto 12px' }}
              />
              <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>Loading gig records…</p>
            </div>
          ) : visibleGigs.length === 0 ? (
            <div className="ds-card" style={{ padding: 56, textAlign: 'center' }}>
              <Briefcase size={36} color="var(--color-fog-3)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>
                No gig records found
              </h4>
              <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>
                {searchQuery
                  ? 'Try a different search term or refresh the dataset.'
                  : isAdmin
                    ? 'Create the first marketplace listing to seed the opportunity engine.'
                    : 'Create your first listing to start attracting remote dental talent.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {visibleGigs.map((gig) => {
                const isClosing = closingGigId === gig.id;

                return (
                  <div key={gig.id} className="ds-card" style={{ padding: 24 }}>
                    <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-ink)' }}>
                            {gig.title}
                          </h3>
                          <StatusBadge status={gig.status} />
                          {gig.remoteOnly ? <span className="ds-tag">Remote only</span> : null}
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--color-ink-4)', marginBottom: 8 }}>
                          {gig.company} · {gig.type} · {gig.rateLabel}
                        </p>
                        {gig.description ? (
                          <p style={{ fontSize: 13, color: 'var(--color-ink-4)', lineHeight: 1.6 }}>
                            {gig.description}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="ds-btn ds-btn-ghost ds-btn-sm"
                          onClick={() => handleEdit(gig)}
                        >
                          <FilePenLine size={13} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="ds-btn ds-btn-ghost ds-btn-sm"
                          style={{ color: 'var(--color-ruby)' }}
                          onClick={() => handleCloseGig(gig.id)}
                          disabled={isClosing || gig.status === 'closed'}
                        >
                          {isClosing ? <Loader2 size={13} className="spin" /> : <Trash2 size={13} />}
                          Close
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2" style={{ marginBottom: 14 }}>
                      {gig.tags.map((tag) => (
                        <span key={tag} className="ds-tag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-[var(--color-ink-4)]">
                      <span>Updated {formatDate(gig.updatedAt)}</span>
                      <span>Created {formatDate(gig.createdAt)}</span>
                      {isAdmin ? <span>Creator: {gig.createdByRole} · {gig.createdBy}</span> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="ds-card" style={{ padding: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {label}
      </p>
      <p className="font-display" style={{ fontSize: 28, color: 'var(--color-ink)', letterSpacing: '-0.03em', marginBottom: 8 }}>
        {value}
      </p>
      <p style={{ fontSize: 12, color: 'var(--color-ink-4)', lineHeight: 1.5 }}>{detail}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: GigStatus }) {
  const tone =
    status === 'open'
      ? 'ds-badge-teal'
      : status === 'draft'
        ? 'ds-badge-amber'
        : 'ds-badge-ruby';

  return (
    <span className={`ds-badge ${tone}`} style={{ textTransform: 'capitalize' }}>
      {status}
    </span>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}
