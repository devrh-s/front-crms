import JobSite from '@/components/default/jobs/JobSites/JobSite/JobSite';

export default async function JobSitePage({ params }: { params: { id: string } }) {
  return <JobSite id={params.id} />;
}
