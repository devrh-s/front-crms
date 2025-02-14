import UserProfile from '@/components/default/talents/Users/User/User';

export default async function UserPage({ params }: { params: { id: string } }) {
  return <UserProfile id={params.id} />;
}
