// Author: Florian Rischer
import { useState, useRef, useEffect, type FormEvent } from 'react';
import './Contact.css';
import { messagesAPI, imagesAPI } from '../../services/api';
import { PageDescription } from '../common/PageDescription';
import { FilterButtons, type FilterOption } from '../common/FilterButtons';

// Contact image from API
const contactImage = imagesAPI.getUrl('contactimage');

type ContactView = 'socials' | 'contact-form' | null;

const filterOptions: FilterOption<NonNullable<ContactView>>[] = [
  { id: 'socials', label: 'Socials' },
  { id: 'contact-form', label: 'Contact form' }
];

interface FormData {
  name: string;
  email: string;
  topic: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
}

export default function Contact() {
  const [activeView, setActiveView] = useState<ContactView>(null);
  const [delayedButtonPosition, setDelayedButtonPosition] = useState<ContactView>(null);
  const hasBeenActiveRef = useRef<{ socials: boolean; form: boolean }>({ socials: false, form: false });
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    topic: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Track if views have been active
  if (activeView === 'socials') hasBeenActiveRef.current.socials = true;
  if (activeView === 'contact-form') hasBeenActiveRef.current.form = true;

  // Delay button position when closing (wait for exit animation)
  useEffect(() => {
    if (activeView !== null) {
      // Opening: move buttons immediately
      setDelayedButtonPosition(activeView);
    } else {
      // Closing: wait for exit animation to complete (0.4s animation + 0.2s max delay)
      const timer = setTimeout(() => {
        setDelayedButtonPosition(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeView]);

  const hasActiveView = activeView !== null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    if (!formData.topic.trim()) {
      newErrors.topic = 'Topic is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const result = await messagesAPI.send({
        name: formData.name,
        email: formData.email,
        subject: formData.topic || 'Contact Form Message',
        message: formData.message
      });

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', topic: '', message: '' });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
        console.error('Failed to send message:', result.error);
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const socials = [
    {
      name: 'flo._.rsr',
      platform: 'instagram',
      url: 'https://instagram.com/flo._.rsr',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="contact__social-icon">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: 'Florian Rischer',
      platform: 'linkedin',
      url: 'https://www.linkedin.com/in/florian-rischer-b15329362/',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="contact__social-icon">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    }
  ];

  return (
    <section className={`contact ${hasActiveView ? 'contact--filtered' : ''}`}>
      <div className="contact__image">
        <img 
          src={contactImage} 
          alt="Contact" 
          className={`contact__image-img ${activeView === 'contact-form' ? 'contact__image-img--faded' : ''}`} 
        />
      </div>
      <h1 className="contact__title">CONTACT</h1>

      <div className={`contact__container ${hasActiveView ? 'contact__container--filtered' : ''}`}>
        <FilterButtons
          filters={filterOptions}
          activeFilter={activeView}
          onFilterChange={setActiveView}
          className={`contact__filters ${delayedButtonPosition === 'socials' ? 'contact__filters--socials-active' : ''} ${delayedButtonPosition === 'contact-form' ? 'contact__filters--form-active' : ''}`}
          baseClassName="contact__filters"
          isFiltered={delayedButtonPosition !== null}
        />
      </div>

      <PageDescription isFiltered={hasActiveView} className="contact__description">
        If you're looking for a website or visual concept that is modern, clear, and functional, I'd be happy to hear from you. Whether it's a digital product, a visual identity, or a conceptual design challenge, I'm always interested in collaborating on thoughtful projects and turning ideas into well-structured, impactful design solutions.
      </PageDescription>

      <div className={`contact__socials ${activeView === 'socials' ? 'contact__socials--visible' : ''} ${hasBeenActiveRef.current.socials && activeView !== 'socials' ? 'contact__socials--exiting' : ''}`}>
        {socials.map((social, index) => (
          <a 
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="contact__social-link"
            style={{ 
              '--stagger-delay': `${0.1 + index * 0.1}s`,
              '--stagger-delay-exit': `${(socials.length - 1 - index) * 0.05}s`
            } as React.CSSProperties}
          >
            {social.icon}
            <span className="contact__social-name">{social.name}</span>
          </a>
        ))}
      </div>

      <div className={`contact__form-section ${activeView === 'contact-form' ? 'contact__form-section--visible' : ''} ${hasBeenActiveRef.current.form && activeView !== 'contact-form' ? 'contact__form-section--exiting' : ''}`}>
        <form className="contact__form" onSubmit={handleSubmit}>
          <div className="contact__form-group" style={{ '--stagger-delay': '0.1s', '--stagger-delay-exit': '0.2s' } as React.CSSProperties}>
            <input
              type="text"
              name="name"
              placeholder=" Your name *"
              value={formData.name}
              onChange={handleInputChange}
              className={`contact__input ${errors.name ? 'contact__input--error' : ''}`}
            />
            {errors.name && <span className="contact__error">{errors.name}</span>}
          </div>

          <div className="contact__form-group" style={{ '--stagger-delay': '0.2s', '--stagger-delay-exit': '0.15s' } as React.CSSProperties}>
            <input
              type="text"
              name="email"
              placeholder=" Your email adress *"
              value={formData.email}
              onChange={handleInputChange}
              className={`contact__input ${errors.email ? 'contact__input--error' : ''}`}
            />
            {errors.email && <span className="contact__error">{errors.email}</span>}
          </div>

          <div className="contact__form-group" style={{ '--stagger-delay': '0.3s', '--stagger-delay-exit': '0.1s' } as React.CSSProperties}>
            <input
              type="text"
              name="topic"
              placeholder=" Topic *"
              value={formData.topic}
              onChange={handleInputChange}
              className={`contact__input ${errors.topic ? 'contact__input--error' : ''}`}
            />
          </div>

          <div className="contact__form-group" style={{ '--stagger-delay': '0.4s', '--stagger-delay-exit': '0.05s' } as React.CSSProperties}>
            <textarea
              name="message"
              placeholder=" Your message... *"
              value={formData.message}
              onChange={handleInputChange}
              className={`contact__textarea ${errors.message ? 'contact__textarea--error' : ''}`}
            />
            {errors.message && <span className="contact__error">{errors.message}</span>}
          </div>

          <div className="contact__form-footer" style={{ '--stagger-delay': '0.5s', '--stagger-delay-exit': '0s' } as React.CSSProperties}>
            <p className="contact__form-notice">
              All messages submitted through this, will be sent directly to florian.rischer@icloud.com
            </p>
            <button 
              type="submit" 
              className="contact__submit-btn"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'sending...' : 'submit'}</span>
              <span className="contact__submit-arrow">→</span>
            </button>
          </div>

          {submitStatus === 'success' && (
            <p className="contact__success">Message sent successfully!</p>
          )}
          {submitStatus === 'error' && (
            <p className="contact__error-msg">Something went wrong. Please try again.</p>
          )}
        </form>
      </div>
    </section>
  );
}
