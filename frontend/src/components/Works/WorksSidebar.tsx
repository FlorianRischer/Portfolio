import './WorksSidebar.css';

interface WorksSidebarProps {
  projects: { id: string; title: string }[];
  activeIndex: number;
  onProjectClick: (index: number) => void;
}

export default function WorksSidebar({ projects, activeIndex, onProjectClick }: WorksSidebarProps) {
  return (
    <nav className="works-sidebar" aria-label="Project navigation">
      <ul className="works-sidebar__list">
        {projects.map((project, index) => (
          <li key={project.id}>
            <button
              className={`works-sidebar__link ${index === activeIndex ? 'works-sidebar__link--active' : ''}`}
              onClick={() => onProjectClick(index)}
              aria-current={index === activeIndex ? 'true' : undefined}
            >
              <span className="works-sidebar__dot" />
              <span className="works-sidebar__name">{project.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
