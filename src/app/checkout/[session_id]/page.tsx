import { Navbar } from "@/components/ui/Navbar";
import { CheckoutView } from "@/components/checkout/CheckoutView";

interface Props {
  params: Promise<{ session_id: string }>;
}

export default async function CheckoutPage({ params }: Props) {
  const { session_id } = await params;

  return (
    <>
      <Navbar />
      <CheckoutView sessionId={session_id} />
    </>
  );
}
