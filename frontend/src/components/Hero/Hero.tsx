// Author: Florian Rischer
import { useTransition } from '../PageTransition/TransitionContext';
import './Hero.css';
import { imagesAPI } from '../../services/api';

// Images from API
const arrowImg = imagesAPI.getUrl('arrow');
const profileImg = imagesAPI.getUrl('profile-svg');

const Hero = () => {
  const { navigateWithTransition } = useTransition();

  return (
    <section id="home" className="hero">
      <div className="hero__container">
        {/* Left Side - Image Composition */}
        <div className="hero__image-section">
          <div className="hero__composition">
            <img
              src={arrowImg}
              alt=""
              className="hero__arrow"
            />

            <img 
              src={profileImg} 
              alt="Florian Rischer" 
              className="hero__profile"
            />
          </div>
        </div>

        {/* Right Side - Navigation Buttons */}
        <div className="hero__content">
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
            <button
              className="hero__nav-btn"
              onClick={() => navigateWithTransition('/contact')}
            >
              CONTACT
            </button>
          </div>
        </div>

        <div className="hero__intro">
          <p className="hero__intro-text">
            HEY, NICE TO MEET YOU, I'M FLORIAN, A WEB- DESIGN AND DEVELOPMENT STUDENT, FROM GERMANY.
            WELCOME TO MY PORTFOLIO PAGE, DON'T BE SHY LOOK AROUND AND GET TO KNOW MORE ABOUT ME AND MY WORK!
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
