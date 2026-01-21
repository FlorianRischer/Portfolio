// Author: Florian Rischer
import { MockupCarousel, type Screen } from '../common/MockupCarousel';
import { imagesAPI } from '../../services/api';

// Images from API
const screenHome = imagesAPI.getUrl('project-soundcloud-home');
const screenHomeDropdown = imagesAPI.getUrl('project-soundcloud-homedropdown');
const screenHomePlayer = imagesAPI.getUrl('project-soundcloud-homeplayer');
const screenDiscover = imagesAPI.getUrl('project-soundcloud-discover');
const screenDiscoverPlayer = imagesAPI.getUrl('project-soundcloud-discoverplayer');
const screenPlaylist = imagesAPI.getUrl('project-soundcloud-playlist');
const screenPlaylistPlayer = imagesAPI.getUrl('project-soundcloud-playlistplayer');

const screens: Screen[] = [
  {
    description: 'This unofficial redesign project aims to improve the overall user experience of the SoundCloud website by modernizing the interface, clarifying navigation, and creating a visually cohesive system. The concept is based on an in-depth analysis of the existing platform, identifying usability issues such as inconsistent layouts, overloaded screens, and limited visibility of key features like playlists and user libraries.',
    screenImage: screenHome,
    scale: 1
  },
  {
    description: 'The dropdown menu is a key navigation element that provides quick access to different sections and user options. This redesign simplifies the dropdown structure, making it easier for users to find what they need without overwhelming them with too many choices. Clean typography and strategic spacing ensure that each menu item is easily scannable and clickable.',
    screenImage: screenHomeDropdown,
    scale: 1
  },
  {
    description: 'The player interface has been redesigned to be intuitive and visually prominent. Essential controls like play, pause, skip, and volume are positioned for easy access, while track information and artwork are displayed clearly. The refined design maintains functionality while reducing visual clutter, allowing users to focus on their music.',
    screenImage: screenHomePlayer,
    scale: 1
  },
  {
    description: 'Throughout the research phase, several UI challenges became apparent. For example, the home and discover pages often contained dense content blocks with minimal visual hierarchy, making it difficult for users to quickly understand where to find new releases, trending artists, or their personal playlists.',
    screenImage: screenDiscover,
    scale: 1
  },
  {
    description: 'The discover section with an active player overlay demonstrates how the redesign handles multiple content layers. The player remains accessible and functional while users browse new music. Thoughtful layering and transparency effects prevent the player from obscuring the content beneath, maintaining usability across different interaction patterns.',
    screenImage: screenDiscoverPlayer,
    scale: 1
  },
  {
    description: 'Playlists are a core feature of the SoundCloud experience. This redesigned playlist view provides better visual organization of tracks, making it easier to scan through large collections. Improved spacing between items, clearer visual hierarchy, and intuitive interaction patterns enhance the overall user experience when managing and enjoying playlists.',
    screenImage: screenPlaylist,
    scale: 1
  },
  {

    description: 'The combined playlist and player view demonstrates how all elements work together cohesively. The redesign shows how a modernized UI and thoughtful restructuring can enhance listening and discovery by simplifying complex screens, improving the visibility of key features, and enabling more fluid navigation—bringing greater usability and visual coherence to one of the world’s most iconic audio platforms.',
    screenImage: screenPlaylistPlayer,
    scale: 1
  }
];

export default function SoundcloudDetail() {
  return (
    <MockupCarousel
      screens={screens}
      title="Soundcloud"
      backRoute="/works"
      enableZoom={true}
    />
  );
}
