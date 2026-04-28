// Author: Florian Rischer
import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './About.css';
import { imagesAPI, skillsAPI } from '../../services/api';
import { usePageEntrance } from '../../hooks/usePageEntrance';
import type { Skill as APISkill } from '../../services/api';
import AboutSidebar from './AboutSidebar';

gsap.registerPlugin(ScrollTrigger);

const aboutImage = imagesAPI.getUrl('about-image');
const aboutMePortrait = imagesAPI.getUrl('about-me-portrait');

interface Skill {
  name: string;
  level: number;
  icon: string;
  description?: string;
  category: 'tech' | 'design';
}

const convertAPISkill = (apiSkill: APISkill): Skill => ({
  name: apiSkill.name,
  level: apiSkill.proficiency,
  icon: imagesAPI.getUrl(apiSkill.icon),
  description: apiSkill.description,
  category: apiSkill.category,
});

export default function About() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = usePageEntrance<HTMLDivElement>(!isLoading);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const landingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const loadSkills = async () => {
      const result = await skillsAPI.getAll();
      if (result.success && result.data) {
        const allSkills = result.data.map(convertAPISkill);
        const tech = allSkills.filter((s) => s.category === 'tech');
        const design = allSkills.filter((s) => s.category === 'design');
        setSkills([...tech, ...design]);
      }
      setIsLoading(false);
    };
    loadSkills();
  }, []);

  const techSkills = skills.filter((s) => s.category === 'tech');
  const designSkills = skills.filter((s) => s.category === 'design');

  useEffect(() => {
    if (!skills.length) return;

    const landingObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            setActiveIndex(-1);
          }
        }
      },
      { threshold: [0.3, 0.5, 0.7] },
    );

    const skillObserver = new IntersectionObserver(
      (entries) => {
        let bestId = '';
        let bestRatio = 0;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestId = entry.target.id;
            bestRatio = entry.intersectionRatio;
          }
        }
        if (!bestId) return;
        const idx = skills.findIndex((s) => s.name === bestId);
        if (idx !== -1) setActiveIndex(idx);
      },
      { threshold: [0.3, 0.5, 0.7, 1], rootMargin: '-40% 0px -40% 0px' },
    );

    if (landingRef.current) landingObserver.observe(landingRef.current);
    sectionRefs.current.forEach((el) => skillObserver.observe(el));
    return () => {
      landingObserver.disconnect();
      skillObserver.disconnect();
    };
  }, [skills]);

  const scrollToSkill = useCallback(
    (index: number) => {
      const skill = skills[index];
      if (!skill) return;
      const el = sectionRefs.current.get(skill.name);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    [skills],
  );

  const registerRef = useCallback((name: string, el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(name, el);
    else sectionRefs.current.delete(name);
  }, []);

  useEffect(() => {
    if (!skills.length) return;
    const cards = document.querySelectorAll('.about-me, .about-skill');
    if (!cards.length) return;

    gsap.set(cards, { scale: 0.9, y: 50 });

    const triggers: ScrollTrigger[] = [];
    cards.forEach((card) => {
      const tween = gsap.to(card, {
        scale: 1,
        y: 0,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          once: true,
        },
      });
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [skills]);

  if (isLoading) return null;

  return (
    <div className="about-page" ref={containerRef}>
      <div className="about-page__bg" data-animate>
        <img src={aboutImage} alt="" className="about-page__bg-img" />
      </div>

      <AboutSidebar
        techSkills={techSkills.map((s) => ({ name: s.name, icon: s.icon }))}
        designSkills={designSkills.map((s) => ({ name: s.name, icon: s.icon }))}
        activeSkill={activeIndex >= 0 ? skills[activeIndex]?.name ?? null : null}
        onSkillClick={(name) => {
          const idx = skills.findIndex((s) => s.name === name);
          if (idx !== -1) scrollToSkill(idx);
        }}
      />

      <div className="about-page__content">
        {/* Landing section */}
        <section id="about-landing" ref={landingRef} className="about-landing" data-animate>
          <h1 className="about-landing__title">ABOUT</h1>
          
        </section>

        {/* About Me section */}
        <section className="about-me">
          <div className="about-me__image">
            <img src={aboutMePortrait} alt="Florian Rischer" className="about-me__img" />
          </div>
          <div className="about-me__text">
            <h2 className="about-me__heading">About Me</h2>
            <p className="about-me__body">
              Hello again! As I already mentioned, my name is Florian Rischer. I'm 20 years old and from a small town in Germany near Munich. My interest and skills in UI/UX design and software development have been growing ever since. Aside from that, I love to get creative in my free time with activities such as painting and photography. Below you can find a list of my aquired skills.
            </p>
          </div>
        </section>

        {/* Skill cards */}
        {skills.map((skill, index) => (
          <article
            key={skill.name}
            id={skill.name}
            ref={(el) => registerRef(skill.name, el)}
            className="about-skill"
            data-animate
          >
            <div className="about-skill__info">
              <div className="about-skill__info-col about-skill__info-col--title">
                <span className="about-skill__number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="about-skill__name">{skill.name}</h2>
                <span className="about-skill__category">
                  {skill.category === 'tech' ? 'Tech Skill' : 'Design Skill'}
                </span>
              </div>

              <div className="about-skill__info-col">
                <span className="about-skill__label">About</span>
                <p className="about-skill__description">{skill.description || ''}</p>
              </div>

              <div className="about-skill__info-col">
                <span className="about-skill__label">Proficiency</span>
                <div className="about-skill__bar">
                  <div className="about-skill__bar-bg" />
                  <div
                    className="about-skill__bar-fill"
                    style={{ width: `${(skill.level / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="about-skill__hero">
              <img src={skill.icon} alt={skill.name} className="about-skill__icon" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
