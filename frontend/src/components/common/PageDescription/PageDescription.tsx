// Author: Florian Rischer
import './PageDescription.css';

interface PageDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageDescription({
  children,
  className = '',
}: PageDescriptionProps) {
  return (
    <div className={`page-description ${className}`}>
      <p>{children}</p>
    </div>
  );
}
