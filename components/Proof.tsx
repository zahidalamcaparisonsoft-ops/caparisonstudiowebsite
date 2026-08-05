"use client";

import Link from "next/link";
import BeforeAfter from "./BeforeAfter";
import RetentionChart from "./RetentionChart";
import { PROJECTS } from "@/lib/data";

const HERO_STUDY = PROJECTS[0];

export default function Proof() {
  return (
    <section
      id="proof"
      className="scene relative overflow-hidden py-24 md:py-32"
    >
      <span
        aria-hidden="true"
        className="orb left-[-12%] top-[10%] h-[480px] w-[480px] bg-mint/20"
      />

      <div className="shell relative">
        <div data-reveal="1" className="max-w-2xl">
          <h2 className="h-loud font-display font-extrabold text-ink">
            Same footage. Different film.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-body sm:text-lg">
            You already have the material. What you are buying is the decision about
            what stays, what goes, and in what order — and what that does to the
            people watching.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
          <div data-reveal="1">
            <BeforeAfter
              title={HERO_STUDY.title}
              caption="…and that's the part nobody tells you about deep-sky imaging."
            />
          </div>

          <div
            data-reveal="1"
            className="lit rounded-2xl p-6 sm:p-8"
            style={{ ["--mx" as string]: 0.5, ["--my" as string]: 0.5 }}
          >
            <RetentionChart
              before={HERO_STUDY.study.retention.before}
              after={HERO_STUDY.study.retention.after}
            />

            <dl className="mt-7 grid grid-cols-3 gap-4 border-t border-ink/10 pt-6">
              {HERO_STUDY.study.results.map((r) => (
                <div key={r.label}>
                  <dd className="font-display text-2xl font-extrabold leading-none text-brand">
                    {r.delta}
                  </dd>
                  <dt className="mt-1.5 text-[11px] leading-snug text-muted">
                    {r.label}
                  </dt>
                </div>
              ))}
            </dl>

            <Link
              href={`/work/${HERO_STUDY.slug}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-deep"
            >
              Read the {HERO_STUDY.client} case study
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
