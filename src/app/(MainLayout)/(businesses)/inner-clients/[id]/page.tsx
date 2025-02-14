import InnerClientProfile from '@/components/default/businesses/InnerClients/InnerClient/InnerClient';

export default async function InnerClientPage({ params }: { params: { id: string } }) {
  return <InnerClientProfile id={params.id} />;
}
