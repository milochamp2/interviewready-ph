import { Navbar } from "@/components/ui/Navbar";
import { ExpiredView } from "@/components/expired/ExpiredView";

interface Props {
  params: Promise<{ session_id: string }>;
}

export default async function ExpiredPage({ params }: Props) {
  const { session_id } = await params;

  return (
    <>
      <Navbar />
      <ExpiredView sessionId={session_id} />
    </>
  );
}
