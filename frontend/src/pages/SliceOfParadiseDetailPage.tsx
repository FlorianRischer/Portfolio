// Author: Florian Rischer
import { useEffect } from 'react';
import SliceOfParadiseDetail from '../components/SliceOfParadiseDetail';
import PageContainer from '../components/PageContainer';

export default function SliceOfParadiseDetailPage() {
  useEffect(() => {
    window.scrollTo(0, -1000);
  }, []);

  return (
    <main>
      <PageContainer>
        <SliceOfParadiseDetail />
      </PageContainer>
    </main>
  );
}
