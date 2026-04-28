// Author: Florian Rischer
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useTransition } from '../PageTransition/TransitionContext';
import { usePageEntrance } from '../../hooks/usePageEntrance';
import './Hero.css';
import { imagesAPI } from '../../services/api';

const profileImg = imagesAPI.getUrl('profile-svg');

const Hero = () => {
  const { navigateWithTransition } = useTransition();
  const containerRef = usePageEntrance<HTMLElement>();
  const arrowRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = arrowRef.current;
    if (!svg) return;

    const paths = svg.querySelectorAll<SVGPathElement>('.arrow-path');

    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        fillOpacity: 0,
      });
    });

    const tl = gsap.timeline({ delay: 0.3 });

    tl.to(paths[0], {
      strokeDashoffset: 0,
      duration: 0.8,
      ease: 'power3.out',
    });

    tl.to(paths[1], {
      strokeDashoffset: 0,
      duration: 1.4,
      ease: 'power2.out',
    }, '-=0.2');

    tl.to(paths, {
      fillOpacity: 1,
      duration: 0.5,
      ease: 'power2.out',
    }, '-=0.3');
  }, []);

  return (
    <section id="home" className="hero" ref={containerRef}>
      <div className="hero__container">
        {/* Left Side - Image Composition */}
        <div className="hero__image-section" data-animate>
          <div className="hero__composition">
            <svg
              ref={arrowRef}
              className="hero__arrow"
              viewBox="0 0 970 767.5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <path
                  className="arrow-path"
                  fill="#000000"
                  stroke="#000000"
                  strokeMiterlimit={10}
                  d="M387.4,245.3c30.2-25.4,49.1-47.6,65.3-83.6,15.9-35.1,13.4-75.8-8.6-107.6-21.6-31.3-62.7-43.9-99-48.2-65.9-7.6-137.5,9.6-199.2,33.2C96.9,57.9,50.2,80.7,6.3,107.8c63-21.2,124.3-39.3,188.2-50.7,63.1-11.3,157-21.9,213.9,11.5,19.2,11.2,33.9,28,40.5,49.3,9.1,28.9-37,69.6-57.2,86.5-12.1,10.1-4.29,3.66-16.86,13.41l14.65,3.99-2.09,23.5h0Z"
                />
                <path
                  className="arrow-path"
                  fill="#000000"
                  stroke="#000000"
                  strokeMiterlimit={10}
                  d="M963.7,541.2c-11.8,13.9-22.6,25.4-35.7,36.7l-85.7,74-140.3,111.5c46-63.7,98.8-119.3,157.1-170.5-95.5,20.3-190.4,38.2-287,52.4-107,15.7-231,29.1-338.3,24.8-43.1-1.7-91.8-7.1-132.1-22.4-13.4-5.1-25.6-11.6-36.8-20.2-11.8-9.1-19.7-20.4-25.2-34.2-12.2-30.6-11.9-63.5,1.6-93.8,12.4-27.9,28.9-50.5,51.3-70.8l36.8-35.4,13.3,6.81-9,27.94-2,1.55c-29,23.5-68.5,56.4-82.2,91.8-12.8,33.1,9.6,59.9,37,75,33.3,18.3,77.5,25.8,115.4,29.3,122.1,11.3,286.5-8.1,409.4-27,76.1-11.7,151.1-25.5,226.3-41-52.9-17.1-106.6-41.5-155.1-67-15.5-8.2-29.6-16.3-44.9-26-1.4-1,.2-1.1,1.7-1l64.7,13.8,141.5,30.3v-.2c30,6.4,57.8,13.6,86.6,21.9,11,3.2,20.8,6.7,31.6,11.7h0Z"
                />
              </g>
            </svg>

            <img
              src={profileImg}
              alt="Florian Rischer"
              className="hero__profile"
            />
          </div>
        </div>

        {/* Right Side - Navigation Buttons */}
        <div className="hero__content" data-animate>
          <div className="hero__nav-buttons">
            <button
              className="hero__nav-btn"
              onClick={() => navigateWithTransition('/about')}
            >
              ABOUT
            </button>
            <button
              className="hero__nav-btn"
              onClick={() => navigateWithTransition('/works')}
            >
              WORKS
            </button>
          </div>
        </div>

        <div className="hero__intro" data-animate>
          <p className="hero__intro-text">
            Hey there, nice to meet you! I'm Florian, a computer science and design student form Munich, Germany. Welcome to my portfolio page where you can get to know more about me and my work.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
