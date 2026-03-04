import { Navbar } from "@/components/ui/Navbar";
import { MockInterview } from "@/components/mock/MockInterview";

interface Props {
  params: Promise<{ session_id: string }>;
}

export default async function MockPage({ params }: Props) {
  const { session_id } = await params;

  return (
    <>
      <Navbar />
      <MockInterview sessionId={session_id} />
    </>
  );
}
