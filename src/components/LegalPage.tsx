import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';

type LegalSection = {
  heading: string;
  body?: string[];
  bullets?: string[];
};

export default function LegalPage({
  title,
  subtitle,
  updatedAt,
  icon,
  sections,
}: {
  title: string;
  subtitle: string;
  updatedAt: string;
  icon: React.ReactNode;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <header className="border-b border-[var(--color-fog-2)] bg-[rgba(250,248,245,0.92)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <BrandMark size={32} />
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)] no-underline transition-opacity hover:opacity-80"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </div>
      </header>

      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,rgba(77,179,160,0.22),transparent_55%),radial-gradient(circle_at_top_right,rgba(194,101,10,0.12),transparent_38%)]" />

        <main className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="ds-card overflow-visible">
            <div className="border-b border-[var(--color-fog-2)] px-6 py-8 sm:px-10">
              <p className="ds-page-eyebrow">Legal</p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--color-teal-light)] text-[var(--color-teal)]">
                  {icon}
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-3xl leading-tight tracking-[-0.03em] text-[var(--color-ink)] sm:text-[42px]">
                    {title}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-ink-4)] sm:text-[15px]">
                    {subtitle}
                  </p>
                  <div className="mt-5 inline-flex items-center rounded-full bg-[var(--color-fog)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-4)]">
                    Last updated {updatedAt}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
              {sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-lg font-semibold text-[var(--color-ink)] sm:text-xl">
                    {section.heading}
                  </h2>

                  {section.body?.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mt-3 text-sm leading-7 text-[var(--color-ink-4)] sm:text-[15px]"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets && (
                    <ul className="mt-4 space-y-3">
                      {section.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex gap-3 text-sm leading-7 text-[var(--color-ink-4)] sm:text-[15px]"
                        >
                          <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--color-teal)]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
