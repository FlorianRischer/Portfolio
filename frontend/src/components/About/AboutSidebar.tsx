import './AboutSidebar.css';

interface SkillDot {
  name: string;
  icon: string;
}

interface AboutSidebarProps {
  techSkills: SkillDot[];
  designSkills: SkillDot[];
  activeSkill: string | null;
  onSkillClick: (name: string) => void;
}

export default function AboutSidebar({
  techSkills,
  designSkills,
  activeSkill,
  onSkillClick,
}: AboutSidebarProps) {
  return (
    <nav className="about-sidebar" aria-label="Skill navigation" data-animate>
      <div className="about-sidebar__group">
        <span className="about-sidebar__label">Tech</span>
        <ul className="about-sidebar__list">
          {techSkills.map((skill) => (
            <li key={skill.name}>
              <button
                className={`about-sidebar__link ${activeSkill === skill.name ? 'about-sidebar__link--active' : ''}`}
                onClick={() => onSkillClick(skill.name)}
              >
                <span className="about-sidebar__dot" />
                <span className="about-sidebar__name">{skill.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="about-sidebar__group">
        <span className="about-sidebar__label">Design</span>
        <ul className="about-sidebar__list">
          {designSkills.map((skill) => (
            <li key={skill.name}>
              <button
                className={`about-sidebar__link ${activeSkill === skill.name ? 'about-sidebar__link--active' : ''}`}
                onClick={() => onSkillClick(skill.name)}
              >
                <span className="about-sidebar__dot" />
                <span className="about-sidebar__name">{skill.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
