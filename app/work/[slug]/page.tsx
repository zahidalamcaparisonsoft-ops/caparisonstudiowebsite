import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BeforeAfter from "@/components/BeforeAfter";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import RetentionChart from "@/components/RetentionChart";
import RevealProvider from "@/components/RevealProvider";
import { CATEGORY_LABEL, PROJECTS } from "@/lib/data";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return { title: "Not found" };

  const headline = project.study.results[0];
  return {
    title: `${project.title} — ${project.client}`,
    description: `${project.study.summary} ${headline.label}: ${headline.before} → ${headline.after} (${headline.delta}).`,
    openGraph: {
      title: `${project.title} — Caparison Studio`,
      description: project.study.summary,
    },
  };
}

export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) notFound();

  const others = PROJECTS.filter((p) => p.slug !== project.slug).slice(0, 3);

  return (
    <>
      <RevealProvider />
      <Header />

      <main className="scene px-5 pb-24 pt-32 sm:px-8 md:pt-40">
        <article className="mx-auto max-w-[900px]">
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 font-mono text-xs text-white/45 transition-colors hover:text-mint"
          >
            <span aria-hidden="true">←</span> All work
          </Link>

          <header className="mt-7">
            <span className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-mint">
              <span className="h-px w-7 bg-mint" />
              {CATEGORY_LABEL[project.cat]} · {project.client}
            </span>
            <h1 className="mt-5 font-display text-[clamp(2rem,6vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white">
              {project.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/60">
              {project.study.summary}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-white/40">
              <span>{project.duration}</span>
              <span>{project.format}</span>
            </div>
          </header>

          {/* Headline outcomes first — this is what a prospect reads. */}
          <dl
            data-reveal="1"
            className="mt-12 grid gap-5 rounded-3xl border border-mint/25 bg-mint/[0.05] p-7 sm:grid-cols-3"
          >
            {project.study.results.map((result) => (
              <div key={result.label}>
                <dd className="font-display text-3xl font-extrabold leading-none text-mint">
                  {result.delta}
                </dd>
                <dt className="mt-2 text-sm font-semibold text-white">
                  {result.label}
                </dt>
                <span className="mt-1 block font-mono text-xs text-white/40">
                  {result.before} → {result.after}
                </span>
              </div>
            ))}
          </dl>

          <section data-reveal="1" className="mt-14">
            <h2 className="font-display text-xl font-bold text-white">The problem</h2>
            <p className="mt-3 leading-relaxed text-white/60">
              {project.study.challenge}
            </p>
          </section>

          <section data-reveal="1" className="mt-10">
            <h2 className="font-display text-xl font-bold text-white">What we did</h2>
            <p className="mt-3 leading-relaxed text-white/60">
              {project.study.approach}
            </p>
          </section>

          <section data-reveal="1" className="mt-14">
            <h2 className="font-display text-xl font-bold text-white">
              Raw versus final
            </h2>
            <div className="mt-6">
              <BeforeAfter title={project.title} />
            </div>
          </section>

          <section
            data-reveal="1"
            className="mt-14 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
          >
            <RetentionChart
              before={project.study.retention.before}
              after={project.study.retention.after}
            />
          </section>

          <div
            data-reveal="1"
            className="mt-16 rounded-3xl border border-mint/25 p-8 text-center"
            style={{
              background:
                "radial-gradient(120% 140% at 50% 0%, rgba(27,237,172,.14), rgba(0,0,0,.9) 70%)",
            }}
          >
            <h2 className="font-display text-2xl font-extrabold text-white">
              Want numbers like these?
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-white/55">
              Four questions, and you&apos;ll see a price and a first-cut date on
              screen.
            </p>
            <Link
              href="/#onboarding"
              className="mt-7 inline-block rounded-full bg-mint px-7 py-3.5 text-sm font-bold text-black transition-all hover:bg-mint-bright"
            >
              Start a project →
            </Link>
          </div>

          <section className="mt-20">
            <h2 className="font-display text-lg font-bold text-white">More work</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {others.map((other) => (
                <Link
                  key={other.slug}
                  href={`/work/${other.slug}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-mint/35 hover:bg-white/[0.06]"
                >
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-mint">
                    {CATEGORY_LABEL[other.cat]}
                  </span>
                  <span className="mt-2 block text-sm font-bold text-white">
                    {other.title}
                  </span>
                  <span className="mt-1 block text-xs text-white/40">
                    {other.study.results[0].delta}{" "}
                    {other.study.results[0].label.toLowerCase()}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </>
  );
}
