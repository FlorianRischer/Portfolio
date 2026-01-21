// Author: Florian Rischer
import { useEffect } from 'react';
import SoundcloudDetail from '../components/SoundcloudDetail';
import PageContainer from '../components/PageContainer';

export default function SoundcloudDetailPage() {
  useEffect(() => {
    window.scrollTo(0, -1000);
  }, []);

  return (
    <main>
      <PageContainer>
        <SoundcloudDetail />
      </PageContainer>
    </main>
  );
}
