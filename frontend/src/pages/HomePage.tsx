// Author: Florian Rischer
import { BaseLayout } from '../layouts';
import Hero from '../components/Hero';

export default function HomePage() {
  return (
    <BaseLayout fullBleed>
      <Hero />
    </BaseLayout>
  );
}
