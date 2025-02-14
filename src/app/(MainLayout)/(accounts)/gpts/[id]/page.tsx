import GPT from '@/components/default/accounts/GPTs/GPT/GPT';

export default async function GPTPage({ params }: { params: { id: number } }) {
  return <GPT id={params.id} />;
}
