/**
 * A section heading with the studio's chosen words set in green.
 *
 * Held apart from the heading rather than marked up inside it, so the heading
 * stays one plain sentence to write in the panel. The accent is matched
 * wherever it appears rather than only at the end — some of these sit in the
 * middle of the line. A heading that no longer contains it is drawn plainly,
 * which is the right answer to rewriting one and forgetting the other.
 */
export default function AccentHeading({
  text,
  accent,
}: {
  text: string;
  accent: string;
}) {
  const at = accent ? text.indexOf(accent) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="text-brand">{accent}</span>
      {text.slice(at + accent.length)}
    </>
  );
}
