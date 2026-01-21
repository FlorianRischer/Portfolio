// Author: Florian Rischer
import { useState, useEffect } from 'react';
import './About.css';
import { imagesAPI } from '../../services/api';
import { PageDescription } from '../common/PageDescription';

// All images from API
const aboutImage = imagesAPI.getUrl('aboutimage');

type AboutView = 'resume' | 'tech-skills' | 'design-skills' | 'education' | 'mini-job' | null;

interface Skill {
  name: string;
  level: number; // 1-5
  icon: string;
  description?: string;
}

interface Education {
  title: string;
  year: string;
  description: string;
}

interface MiniJob {
  company: string;
  year: string;
  description: string;
}

const techSkills: Skill[] = [
  { 
    name: 'Git / GitLab GitHub', 
    level: 5, 
    icon: imagesAPI.getUrl('skill-git'),
    description: 'Throughout the first two semesters of my studies, Git became a central tool for collaborative project work. Rather than being treated as a purely technical system, version control was integrated into the overall design and development process.\n\nFor most code-based (group-) projects, we worked with GitHub or GitLab to organize workflows, manage iterations, and collaborate efficiently within interdisciplinary teams. This setup allowed design decisions, changes, and experiments to be clearly documented and traced over time.\n\nWorking with Git-based collaboration tools strengthened my understanding of structured teamwork, iterative design, and transparent project management. It enabled a smooth collaboration between design and development, ensuring that creative processes remained flexible while still being reliably organized.'
  },
  { 
    name: 'Visual Studio Code', 
    level: 5, 
    icon: imagesAPI.getUrl('skill-vscode'),
    description: 'For coding and prototyping, I primarily work with Visual Studio Code as my development environment. Its flexibility and extensibility allow me to adapt the editor to different project requirements, from quick prototypes to more complex, code-driven design systems.\n\nI also work with Copilot as part of my workflow to support code writing, refactoring, and problem solving. This enables a faster, more intuitive workflow and strengthens the connection between design thinking and technical implementation.\n\nUsing Visual Studio Code together with AI-assisted tools supports an efficient, exploratory workflow and strengthens the connection between design thinking and technical implementation.'
  },
  { 
    name: 'Python', 
    level: 3, 
    icon: imagesAPI.getUrl('skill-python'),
    description: 'Through a module in the first semester of my studies, I developed a foundational understanding of Python and basic programming principles. The focus was on learning how code works conceptually — including logic and data structures — rather than on deep technical specialization.\n\nThis knowledge helps me better understand and communicate with technical systems, prototype ideas, and approach code-driven design tasks with confidence.\n\nHaving a basic understanding of Python strengthens my ability to collaborate with developers and think more structurally when working on data-driven or interactive design projects.'
  },
  { 
    name: 'Html/css', 
    level: 4, 
    icon: imagesAPI.getUrl('skill-html'),
    description: 'I have an advanced working knowledge of HTML and CSS, which I primarily developed through designing and building this portfolio website. Creating this site allowed me to directly connect layout, typography, and interaction design with their technical implementation.\n\nWorking hands-on with HTML and CSS helped me better understand how design decisions translate into responsive structures, spacing systems, and visual hierarchies in the browser.\n\nThis knowledge supports a more informed design process and enables clearer communication with developers when working on web-based projects.'
  },
  { 
    name: 'JavaScript/TypeScript', 
    level: 3, 
    icon: imagesAPI.getUrl('skill-javascript'),
    description: 'My experience with JavaScript and TypeScript is rooted in designing interactive and dynamic digital experiences. Through hands-on projects, I gained a basic working knowledge of both languages, mainly in the context of web-based interfaces and data visualizations.\n\nWorking with these languages enables me to move beyond static layouts and approach design as an interactive system, considering states, transitions, and user feedback as integral parts of the experience.\n\nThis understanding supports the creation of functional, interactive prototypes and facilitates effective collaboration between design and development in more technically complex projects.'
  },
  { 
    name: 'n8n', 
    level: 3, 
    icon: imagesAPI.getUrl('skill-n8n'),
    description: 'I have basic experience working with n8n for workflow automation and system integration. Using the tool, I have connected and coordinated different external services through APIs to automate data flows and simplify repetitive processes.\n\nWorking with APIs of external tools helped me understand how data is exchanged between systems and how automated workflows can support more efficient project structures.\n\nThis experience expanded my perspective beyond individual tools and strengthened my ability to think in connected, system-based processes.'
  }
];

const designSkills: Skill[] = [
  { 
    name: 'Adobe Photoshop', 
    level: 3, 
    icon: imagesAPI.getUrl('skill-photoshop'),
    description: 'I have hands-on experience with Adobe Photoshop, primarily through private photography projects and image editing work. This includes basic retouching, color correction, and preparing images for digital use.\n\nThrough regular use, I have developed a confident and intuitive workflow in Photoshop and feel comfortable navigating the software to achieve precise visual results.\n\nThis experience supports my overall design practice and strengthens my attention to detail when working with images and visual compositions.'
  },
  { 
    name: 'Adobe Illustrator', 
    level: 3, 
    icon: imagesAPI.getUrl('skill-illustrator'),
    description: 'I work confidently with Adobe Illustrator and have a solid understanding of vector-based design principles. Through projects such as the Slice of Paradise logo, I developed a strong sense for scalable design systems, precise form construction, and clean visual execution.\n\nIn addition to logo design, I have used Illustrator for illustration work and the development of various posters.\n\nThis experience strengthened my understanding of composition, typography, and visual hierarchy within a vector-based workflow, and supports a flexible approach to both branding and editorial design.'
  },
  { 
    name: 'Adobe InDesign', 
    level: 2, 
    icon: imagesAPI.getUrl('skill-indesign'),
    description: 'I have basic experience working with Adobe InDesign, which I used to design and produce my semester documentation in the form of a magazine showcasing my work.\n\nThis project involved structuring content, developing page layouts, and creating a cohesive visual system across multiple pages. Through this process, I gained a practical understanding of editorial design, grid systems, and typography within longer-form documents.\n\nWorking with InDesign supported a structured, detail-oriented approach to presenting design work in a clear and consistent format.'
  },
  { 
    name: 'Figma', 
    level: 4, 
    icon: imagesAPI.getUrl('skill-figma'),
    description: 'Figma is my primary tool for digital prototyping and for structuring research throughout the design process. I use it to organize insights, map ideas, and translate complex concepts into clear, visual systems that can be discussed, tested, and iterated on.\n\nI work fluently with Figma and can reliably translate almost any concept into a visual representation, ranging from early wireframes and user flows to detailed, high-fidelity prototypes.\n\nUsing Figma allows me to bridge research, concept development, and visual design within a single environment. This makes it an essential tool for exploring ideas, communicating design decisions, and developing well-structured digital experiences.'
  }
];

const education: Education[] = [
  {
    title: 'Abitur',
    year: '2017 - 2024',
    description: 'I completed my general university entrance qualification (Abitur) at Max-Born-Gymnasium in Germering, where I also took the advanced art course (Kunst Additum) and successfully graduated with an average grade of 2.7.'
  },
  {
    title: 'Munich University of applied sciences',
    year: '2024 - now',
    description: 'I\'m currently studying Computer Science and Design at the Munich University of Applied Sciences, where I\'m in my third semester with a current average grade of 1.7.'
  }
];

const miniJobs: MiniJob[] = [
  {
    company: 'REBIKE Mobility GMBH',
    year: '2021-2023',
    description: 'Between 2021 and 2023, I occasionally supported the sales and marketing team at REBIKE Mobility, assisting with various tasks, such as promoting products and preparing team events.'
  },
  {
    company: 'Netto Marken-Discount',
    year: '2023 - 2024',
    description: 'From December 2023 to March 2024, I worked as a store assistant at a local Netto supermarket, assisting with day-to-day store operations and customer service.'
  }
];

export default function About() {
  const [activeView, setActiveView] = useState<AboutView>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [displayedSkill, setDisplayedSkill] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [delayedButtonPosition, setDelayedButtonPosition] = useState<AboutView>(null);
  const [hasBeenActive, setHasBeenActive] = useState<{ [key: string]: boolean }>({
    resume: false,
    'tech-skills': false,
    'design-skills': false,
    'education': false,
    'mini-job': false,
  });

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
            <span className="about__skill-rating">{skill.level}/5</span>
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
            <span className="about__skill-level">{skill.level}/5</span>
            <span className="about__skill-rating">{skill.level}/5</span>
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
          className={`about__image-img ${activeView === 'design-skills' ? 'about__image-img--faded' : ''} ${(activeView === 'resume' || activeView === 'education' || activeView === 'mini-job') ? 'about__image-img--very-faded' : ''}`} 
        />
      </div>
      <h1 className="about__title">ABOUT</h1>

        <div className={`about__filters ${getButtonPositionClass()}`}>
          <button
            className={`about__filter-btn about__filter-btn--${getViewSize('resume')} ${
              isViewActive('resume') ? 'about__filter-btn--active' : ''
            }`}
            onClick={() => setActiveView(isViewActive('resume') ? null : 'resume')}
          >
            Resume
          </button>
          
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

      <PageDescription isFiltered={hasActiveView} className="about__description" data-skill-selected={selectedSkill ? 'true' : 'false'}>
        I'm a UX/UI designer currently studying Web Design & Development. In my work, I combine visual design with a structured, user-focused approach. My goal is to create clear and functional designs that are both aesthetically pleasing and easy to understand.
      </PageDescription>

      {displayedSkill && getSelectedSkillData() && (
        <div className={`about__skill-description ${isExiting ? 'about__skill-description--exiting' : ''}`} key={`skill-${displayedSkill}`}>
          <p>
            {getSelectedSkillData()?.description}
          </p>
        </div>
      )}

      {/* Resume Section */}
      <div className={`about__section about__resume-section ${activeView === 'resume' || activeView === 'education' || activeView === 'mini-job' ? 'about__section--visible' : ''} ${(hasBeenActive.resume || hasBeenActive.education || hasBeenActive['mini-job']) && activeView !== 'resume' && activeView !== 'education' && activeView !== 'mini-job' ? 'about__section--exiting' : ''}`}>
        {/* Resume Sub-filters */}
        {activeView === 'resume' || activeView === 'education' || activeView === 'mini-job' ? (
          <div className={`about__resume-filters ${activeView === 'education' || activeView === 'mini-job' ? 'about__resume-filters--active' : ''}`}>
            <button
              className={`about__resume-filter-btn ${activeView === 'education' ? 'about__resume-filter-btn--active' : ''}`}
              onClick={() => setActiveView(activeView === 'education' ? 'resume' : 'education')}
            >
              Education
            </button>
            <button
              className={`about__resume-filter-btn ${activeView === 'mini-job' ? 'about__resume-filter-btn--active' : ''}`}
              onClick={() => setActiveView(activeView === 'mini-job' ? 'resume' : 'mini-job')}
            >
              Mini-job Experiences
            </button>
          </div>
        ) : null}
        
      </div>

      {/* Education Section */}
      <div className={`about__section about__education-section ${activeView === 'education' ? 'about__section--visible' : ''} ${hasBeenActive.education && activeView !== 'education' ? 'about__section--exiting' : ''}`}>
        <div className="about__resume-items">
          {education.map((item, index) => (
            <div 
              key={item.title}
              className="about__resume-item"
              style={{ 
                '--stagger-delay': `${0.1 + index * 0.15}s`,
                '--stagger-delay-exit': `${(education.length - index) * 0.05}s`
              } as React.CSSProperties}
            >
              <div className="about__resume-header">
                <h3 className="about__resume-title">{item.title}</h3>
                <span className="about__resume-year">{item.year}</span>
              </div>
              <p className="about__resume-description">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mini-job Section */}
      <div className={`about__section about__mini-job-section ${activeView === 'mini-job' ? 'about__section--visible' : ''} ${hasBeenActive['mini-job'] && activeView !== 'mini-job' ? 'about__section--exiting' : ''}`}>
        <div className="about__resume-items">
          {miniJobs.map((item, index) => (
            <div 
              key={item.company}
              className="about__resume-item"
              style={{ 
                '--stagger-delay': `${0.1 + index * 0.15}s`,
                '--stagger-delay-exit': `${(miniJobs.length - index) * 0.05}s`
              } as React.CSSProperties}
            >
              <div className="about__resume-header">
                <h3 className="about__resume-title">{item.company}</h3>
                <span className="about__resume-year">{item.year}</span>
              </div>
              <p className="about__resume-description">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

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
