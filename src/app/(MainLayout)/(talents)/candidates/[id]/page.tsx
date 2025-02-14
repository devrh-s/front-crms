import CandidateProfile from '@/components/default/talents/Candidates/Candidate/Candidate';

export default async function CandidatePage({ params }: { params: { id: string } }) {
  return <CandidateProfile id={params.id} />;
}
