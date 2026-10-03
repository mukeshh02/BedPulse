import { DataSkeleton } from '@/components/LoadingFeedback';

export default function ManagementLoading() {
  return <div role="status" aria-label="Loading section"><DataSkeleton /></div>;
}