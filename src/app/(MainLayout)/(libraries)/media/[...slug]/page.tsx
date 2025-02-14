import MediaLibrary from '@/components/default/libraries/MediaLibrary/MediaLibrary';

export default async function MediaPage({ params }: { params: { slug: string[] } }) {
  return <MediaLibrary slug={params.slug} />;
}
