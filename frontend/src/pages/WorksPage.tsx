// Author: Florian Rischer
import { BaseLayout } from '../layouts';
import Works from '../components/Works/Works';

export default function WorksPage() {
  return (
    <BaseLayout scrollable fullBleed className="works-layout">
      <Works />
    </BaseLayout>
  );
}
