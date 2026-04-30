import { BaseLayout } from '../layouts';
import Datenschutz from '../components/Datenschutz';

export default function DatenschutzPage() {
  return (
    <BaseLayout scrollable fullBleed className="datenschutz-layout">
      <Datenschutz />
    </BaseLayout>
  );
}
