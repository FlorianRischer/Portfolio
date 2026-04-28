// Author: Florian Rischer
import { BaseLayout } from '../layouts';
import About from '../components/About';

export default function AboutPage() {
  return (
    <BaseLayout scrollable fullBleed className="about-layout">
      <About />
    </BaseLayout>
  );
}
