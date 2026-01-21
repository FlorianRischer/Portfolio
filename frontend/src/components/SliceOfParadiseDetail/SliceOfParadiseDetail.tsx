// Author: Florian Rischer
import { MockupCarousel, type Screen } from '../common/MockupCarousel';
import { imagesAPI } from '../../services/api';

// Images from API
const screenCatMockup = imagesAPI.getUrl('project-slice-catmockup');
const screenInitialDesign = imagesAPI.getUrl('project-slice-initial-design');
const screenLogoDraft1 = imagesAPI.getUrl('project-slice-logodraft1');
const screenLogoDraft2 = imagesAPI.getUrl('project-slice-logodraft2');

const screens: Screen[] = [
  {
    description: 'The project aimed to create a new logo and visual identity for the catamaran Slice while preserving the original concept of capturing the dynamic motion of a hull cutting through water. Applied to the vessel itself, the refined visual system demonstrates the logo’s coherence, scalability, and impact on a large, moving surface. The result is a strong and recognizable brand presence that stands out clearly on the water.',
    screenImage: screenCatMockup,
    scale: 0.8
  },
  {
    description: 'The initial concept was based on a clear idea, but lacked visual coherence and harmony between its elements. The logo appeared static, as the intended sense of dynamism was only partially realized. The project focused on refining this idea by improving consistency, structure, and scalability while preserving the original concept.',
    screenImage: screenInitialDesign,
    scale: 1
  },
  {
    description: 'The first logo draft uses a geometric, angular design to emphasize motion and dynamism. Blue vector shapes represent displaced water, visualizing the bow of the catamaran cutting through the sea. This approach creates a sense of speed and energy while maintaining a modern, recognizable brand mark.',
    screenImage: screenLogoDraft1,
    scale: 1
  },
  {
    description: 'The second logo draft emphasizes the paradise aspect of the brand through a vectorized bird as a central element. Its organic forms add a sense of lightness and warmth, while the typography beneath the Slice wordmark introduces a more paradisiacal character. Together, these elements create a cohesive and expressive visual identity that refines the original concept.',
    screenImage: screenLogoDraft2,
    scale: 1
  }
];

export default function SliceOfParadiseDetail() {
  return (
    <MockupCarousel
      screens={screens}
      title="Slice of Paradise"
      backRoute="/works"
      enableZoom={false}
    />
  );
}
