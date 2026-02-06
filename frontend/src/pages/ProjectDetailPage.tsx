// Author: Florian Rischer
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import { MockupCarousel, type Screen } from '../components/common/MockupCarousel';
import { projectsAPI, imagesAPI, type Project } from '../services/api';

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, -1000);
  }, []);

  useEffect(() => {
    async function loadProject() {
      if (!slug) return;
      
      setLoading(true);
      const result = await projectsAPI.getBySlug(slug);
      
      if (result.success && result.data) {
        setProject(result.data);
        setError(null);
      } else {
        setError(result.error || 'Project not found');
      }
      setLoading(false);
    }
    
    loadProject();
  }, [slug]);

  if (loading) {
    return (
      <main>
        <PageContainer>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '50vh',
            fontSize: 'var(--font-xl)'
          }}>
            Loading...
          </div>
        </PageContainer>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main>
        <PageContainer>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '50vh',
            gap: '1rem'
          }}>
            <h1 style={{ fontSize: 'var(--font-3xl)' }}>Project Not Found</h1>
            <p style={{ fontSize: 'var(--font-base)', color: '#666' }}>{error}</p>
          </div>
        </PageContainer>
      </main>
    );
  }

  // Convert project screens to MockupCarousel format
  const screens: Screen[] = project.screens.map(screen => ({
    description: screen.description,
    screenImage: screen.imageUrl.startsWith('/api') 
      ? imagesAPI.getUrl(screen.imageUrl.replace('/api/images/', ''))
      : screen.imageUrl,
    scale: 1
  }));

  // Determine if zoom should be enabled based on category
  const enableZoom = project.category === 'ui-design' || project.category === 'ux-design';

  return (
    <main>
      <PageContainer>
        <MockupCarousel
          screens={screens}
          title={project.title}
          backRoute="/works"
          enableZoom={enableZoom}
        />
      </PageContainer>
    </main>
  );
}
