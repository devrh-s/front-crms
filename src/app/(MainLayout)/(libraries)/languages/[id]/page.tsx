import Language from '@/components/default/libraries/Languages/Language/Language';

export default async function LanguagePage({ params }: { params: { id: number } }) {
  return <Language id={params.id} />;
}
