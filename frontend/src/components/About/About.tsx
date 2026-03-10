// Author: Florian Rischer
import { useState, useEffect } from 'react';
import './About.css';
import { imagesAPI, skillsAPI } from '../../services/api';
import type { Skill as APISkill } from '../../services/api';
import { PageDescription } from '../common/PageDescription';
import { useScrollFilter } from '../../hooks/useScrollFilter';

// All images from API
const aboutImage = imagesAPI.getUrl('about-image');

type AboutView = 'tech-skills' | 'design-skills' | null;

// Filter order for scroll activation
const scrollFilterOrder = [
  { id: 'tech-skills' as const },
  { id: 'design-skills' as const }
];

interface Skill {
  name: string;
  level: number; // 1-5
  icon: string;
  description?: string;
}

// Convert API skill to local Skill interface
const convertAPISkill = (apiSkill: APISkill): Skill => ({
  name: apiSkill.name,
  level: apiSkill.proficiency,
  icon: imagesAPI.getUrl(apiSkill.icon),
  description: apiSkill.description
});

export default function About() {
  const [activeView, setActiveView] = useState<AboutView>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [displayedSkill, setDisplayedSkill] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [delayedButtonPosition, setDelayedButtonPosition] = useState<AboutView>(null);
  const [techSkills, setTechSkills] = useState<Skill[]>([]);
  const [designSkills, setDesignSkills] = useState<Skill[]>([]);
  const [hasBeenActive, setHasBeenActive] = useState<{ [key: string]: boolean }>({
    'tech-skills': false,
    'design-skills': false,
  });

  // Enable scroll-based filter activation
  useScrollFilter({
    filterOrder: scrollFilterOrder,
    activeFilter: activeView,
    setActiveFilter: setActiveView
  });

  // Load skills from API
  useEffect(() => {
    const loadSkills = async () => {
      const result = await skillsAPI.getAll();
      if (result.success && result.data) {
        const tech = result.data
          .filter(s => s.category === 'tech')
          .map(convertAPISkill);
        const design = result.data
          .filter(s => s.category === 'design')
          .map(convertAPISkill);
        setTechSkills(tech);
        setDesignSkills(design);
      }
    };
    loadSkills();
  }, []);

  // Track if views have been active
  useEffect(() => {
    if (activeView) {
      // Use microtask to avoid setState in effect warning
      Promise.resolve().then(() => {
        setHasBeenActive(prev => ({
          ...prev,
          [activeView]: true
        }));
      });
    } else {
      // Reset selected skill when leaving skills view
      Promise.resolve().then(() => {
        setSelectedSkill(null);
        setDisplayedSkill(null);
      });
    }
  }, [activeView]);

  // Handle skill selection and deselection with animation
  useEffect(() => {
    if (selectedSkill && selectedSkill !== displayedSkill) {
      // New skill selected - show immediately
      Promise.resolve().then(() => {
        setIsExiting(false);
        setDisplayedSkill(selectedSkill);
      });
    } else if (!selectedSkill && displayedSkill) {
      // Skill deselected - trigger exit animation
      Promise.resolve().then(() => {
        setIsExiting(true);
      });
      const timer = setTimeout(() => {
        setDisplayedSkill(null);
        setIsExiting(false);
      }, 500); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [selectedSkill, displayedSkill]);

  // Delay button position when closing (wait for exit animation)
  useEffect(() => {
    if (activeView !== null) {
      Promise.resolve().then(() => {
        setDelayedButtonPosition(activeView);
      });
    } else {
      const timer = setTimeout(() => {
        setDelayedButtonPosition(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeView]);

  const getViewSize = (view: AboutView): 'large' | 'small' => {
    return activeView === view ? 'large' : 'small';
  };

  const isViewActive = (view: AboutView): boolean => {
    return activeView === view;
  };

  const hasActiveView = activeView !== null;

  const getButtonPositionClass = (): string => {
    if (!delayedButtonPosition) return '';
    return `about__filters--${delayedButtonPosition}-active`;
  };

  const handleSkillClick = (skillName: string) => {
    setSelectedSkill(selectedSkill === skillName ? null : skillName);
  };

  const getSelectedSkillData = (): Skill | null => {
    if (!displayedSkill) return null;
    if (activeView === 'tech-skills') {
      return techSkills.find(skill => skill.name === displayedSkill) || null;
    } else if (activeView === 'design-skills') {
      return designSkills.find(skill => skill.name === displayedSkill) || null;
    }
    return null;
  };

  const renderSkillBar = (skill: Skill, index: number, isDesignSkill: boolean = false) => {
    const percentage = (skill.level / 5) * 100;
    const isSelected = selectedSkill === skill.name;
    
    // For design skills, render only icon and name without bar and level
    if (isDesignSkill) {
      return (
        <button
          key={skill.name} 
          className={`about__skill about__skill--simple ${isSelected ? 'about__skill--selected' : ''}`}
          onClick={() => handleSkillClick(skill.name)}
          style={{ 
            '--stagger-delay': `${0.1 + index * 0.1}s`,
            '--stagger-delay-exit': `${(4 - index) * 0.05}s`
          } as React.CSSProperties}
        >
          <div className="about__skill-icon">
            <img src={skill.icon} alt={skill.name} />
          </div>
          <div className="about__skill-name-line">
            <span className="about__skill-name">{skill.name}</span>
          </div>
        </button>
      );
    }
    
    return (
      <button
        key={skill.name} 
        className={`about__skill ${isSelected ? 'about__skill--selected' : ''}`}
        onClick={() => handleSkillClick(skill.name)}
        style={{ 
          '--stagger-delay': `${0.1 + index * 0.1}s`,
          '--stagger-delay-exit': `${(4 - index) * 0.05}s`
        } as React.CSSProperties}
      >
        <div className="about__skill-icon">
          <img src={skill.icon} alt={skill.name} />
        </div>
        <div className="about__skill-content">
          <div className="about__skill-bar">
            <div className="about__skill-bar-bg"></div>
            <div 
              className="about__skill-bar-fill" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="about__skill-info">
            <span className="about__skill-name">{skill.name}</span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <section className={`about ${hasActiveView ? 'about--filtered' : ''}`}>
      <div className="about__image">
        <img 
          src={aboutImage} 
          alt="About" 
          className={`about__image-img ${activeView === 'design-skills' ? 'about__image-img--faded' : ''}`} 
        />
      </div>
      <h1 className="about__title">ABOUT</h1>

        <div className={`about__filters ${getButtonPositionClass()}`}>
          <button
            className={`about__filter-btn about__filter-btn--${getViewSize('tech-skills')} ${
              isViewActive('tech-skills') ? 'about__filter-btn--active' : ''
            }`}
            onClick={() => setActiveView(isViewActive('tech-skills') ? null : 'tech-skills')}
          >
            Tech - skills
          </button>
          <button
            className={`about__filter-btn about__filter-btn--${getViewSize('design-skills')} ${
              isViewActive('design-skills') ? 'about__filter-btn--active' : ''
            }`}
            onClick={() => setActiveView(isViewActive('design-skills') ? null : 'design-skills')}
          >
            Design - skills
          </button>
      </div>

      <PageDescription isFiltered={hasActiveView} className="about__description" data-skill-selected={displayedSkill ? 'true' : 'false'}>
        I'm a UX/UI designer currently studying Web Design & Development at University of applied sciences in Munich, Germany. In my work, I combine visual design with a structured, user-focused approach. My goal is to create clear and functional designs that are both aesthetically pleasing and easy to understand.
      </PageDescription>

      {displayedSkill && getSelectedSkillData() && (
        <div className={`about__skill-description ${isExiting ? 'about__skill-description--exiting' : ''}`} key={`skill-${displayedSkill}`}>
          <p>
            {getSelectedSkillData()?.description}
          </p>
        </div>
      )}

      {/* Tech Skills Section */}
      <div className={`about__section about__tech-skills-section ${activeView === 'tech-skills' ? 'about__section--visible' : ''} ${selectedSkill ? 'about__section--skill-selected' : ''} ${hasBeenActive['tech-skills'] && activeView !== 'tech-skills' ? 'about__section--exiting' : ''}`}>
        <div className="about__skills-list">
          {techSkills.map((skill, index) => renderSkillBar(skill, index, true))}
        </div>
      </div>

      {/* Design Skills Section */}
      <div className={`about__section about__design-skills-section ${activeView === 'design-skills' ? 'about__section--visible' : ''} ${selectedSkill ? 'about__section--skill-selected' : ''} ${hasBeenActive['design-skills'] && activeView !== 'design-skills' ? 'about__section--exiting' : ''}`}>
        <div className="about__skills-list">
          {designSkills.map((skill, index) => renderSkillBar(skill, index, true))}
        </div>
      </div>
    </section>
  );
}
