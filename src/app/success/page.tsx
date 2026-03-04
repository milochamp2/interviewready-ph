import { Navbar } from "@/components/ui/Navbar";
import { SuccessView } from "@/components/success/SuccessView";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return <div>Missing session. Please check your link.</div>;
  }

  return (
    <>
      <Navbar />
      <SuccessView sessionId={session_id} />
    </>
  );
}
