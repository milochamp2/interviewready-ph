import { Navbar } from "@/components/ui/Navbar";
import { ResultsView } from "@/components/results/ResultsView";

interface Props {
  params: Promise<{ session_id: string }>;
}

export default async function ResultsPage({ params }: Props) {
  const { session_id } = await params;

  return (
    <>
      <Navbar />
      <ResultsView sessionId={session_id} />
    </>
  );
}
