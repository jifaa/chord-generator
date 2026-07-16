import { Suspense } from 'react';
import { ExplorerClient } from '@/components/explorer-client';

export default function ExplorerPage() {
  return (
    <Suspense fallback={null}>
      <ExplorerClient />
    </Suspense>
  );
}
