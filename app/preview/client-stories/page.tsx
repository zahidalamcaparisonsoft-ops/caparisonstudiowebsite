import ClientStories from "@/components/ClientStories";

/** Both layouts on one page, for looking at. Delete when they are placed. */
export default function Page() {
  return (
    <main>
      <ClientStories variant="wide" />
      <ClientStories variant="reel" />
    </main>
  );
}
