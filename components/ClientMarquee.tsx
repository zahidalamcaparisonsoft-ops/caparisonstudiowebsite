import { CLIENTS } from "@/lib/data";

export default function ClientMarquee() {
  return (
    <div className="px-5 sm:px-8">
      <div className="mx-auto flex max-w-[1240px] items-center gap-6 overflow-hidden border-y border-white/8 py-5 sm:gap-8">
        <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-white/35 sm:block">
          Trusted by
        </span>
        <div className="flex min-w-0 flex-1 overflow-hidden">
          <div className="marquee-track flex shrink-0 gap-10 whitespace-nowrap pr-10">
            {[...CLIENTS, ...CLIENTS].map((client, i) => (
              <span
                key={`${client}-${i}`}
                className="font-display text-lg font-bold text-white/25"
              >
                {client}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
