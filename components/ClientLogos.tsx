import type { ClientLogo } from "@/lib/data";

/**
 * Who the studio has worked for.
 *
 * A section of its own rather than a strip at the foot of the client stories.
 * It is answering a different question — the stories say what one client
 * thought, this says how many there have been — and a claim about the whole
 * client list reads as a footnote when it is set as one.
 *
 * A still grid, deliberately. The team wall loops and the testimonial picker
 * rolls; a third moving band on the same page stops reading as life and starts
 * reading as noise. This is the one block that holds still.
 *
 * Every cell is the same size and every mark is capped inside it, so a wide
 * wordmark and a tall roundel carry the same weight. Sizing logos by width
 * alone is what makes one client look like the important one.
 *
 * Marks are muted at rest and take their own colour under the pointer. Logos
 * arrive in whatever colours their owners chose, and a row of them at full
 * strength competes with itself and with the page; muted, the row reads as one
 * thing, and the colour is still there for anyone who looks.
 *
 * Renders nothing when there is nothing to show. A section headed "trusted by"
 * with an empty grid under it is worse than no section.
 */
export default function ClientLogos({
  marks,
  label,
  more,
}: {
  marks?: ClientLogo[];
  label?: string;
  more?: string;
}) {
  const list = marks ?? [];
  if (!list.length) return null;

  return (
    <section
      id="clients"
      aria-label={label || "Clients"}
      className="seam-top relative overflow-hidden py-16 md:py-20"
    >
      <div className="shell">
        {label ? (
          <p
            data-reveal="1"
            className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted"
          >
            {label}
          </p>
        ) : null}

        {/* Two across on a phone, five on a desktop. The cells carry the
            spacing rather than a rule between them: a hairline grid leaves a
            ragged edge wherever the last row does not fill, and the number of
            clients is not going to divide neatly by three counts of column. */}
        <ul
          data-reveal="1"
          className="mt-8 grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-3 md:mt-10 lg:grid-cols-5"
        >
          {list.map((m) => {
            const body = m.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.logo}
                alt={m.name}
                loading="lazy"
                /* Capped both ways: `object-contain` inside a fixed box is
                   what keeps a letterbox wordmark and a square badge at the
                   same optical size. */
                className="max-h-10 w-auto max-w-full object-contain opacity-70 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
              />
            ) : (
              /* No mark uploaded yet. The name set in the display face still
                 reads as a logo rather than as a gap, and the cell keeps its
                 size either way so the grid does not go ragged while the
                 files are still coming in. */
              <span className="text-center font-display text-base font-extrabold leading-tight tracking-[-0.02em] text-ink/55 transition-colors duration-300 group-hover:text-ink sm:text-lg">
                {m.name}
              </span>
            );

            const cell =
              "group flex h-20 items-center justify-center rounded-xl px-4 transition-colors duration-300 hover:bg-white sm:h-24";

            return (
              <li key={m.id}>
                {m.href ? (
                  <a
                    href={m.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cell}
                  >
                    {body}
                  </a>
                ) : (
                  <div className={cell}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>

        {more ? (
          <p
            data-reveal="1"
            className="mt-8 text-center font-mono text-[11px] text-muted"
          >
            {more}
          </p>
        ) : null}
      </div>
    </section>
  );
}
