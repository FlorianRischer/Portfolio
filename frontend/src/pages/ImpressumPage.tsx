import { BaseLayout } from '../layouts';
import Impressum from '../components/Impressum';

export default function ImpressumPage() {
  return (
    <BaseLayout scrollable fullBleed className="impressum-layout">
      <Impressum />
    </BaseLayout>
  );
}
