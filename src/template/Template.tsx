import { ReactNode, useState, MouseEvent } from "react";
import "./Template.css";

export interface TemplateProps {
  children: ReactNode;
  sectionNav: ReactNode;
  title: ReactNode;
}

export function Template({ children, sectionNav, title }: TemplateProps) {
  const [mobileNav, setMobileNav] = useState<boolean>(false);

  function hideMobileNav(e: MouseEvent) {
    setMobileNav(false);
    e.preventDefault();
  }
  function toggleMobileNav(e: MouseEvent) {
    setMobileNav(!mobileNav);
    e.preventDefault();
  }

  return (
    <div
      className={"mobilenav-enabled " + (mobileNav ? "mobilenav-active" : "")}
    >
      <header role="banner" className="site-header">
        <a className="site-logo" href="/" title="U.S. Geological Survey">
          <img
            src="https://earthquake.usgs.gov/theme/images/usgs-logo.svg"
            alt=""
          />
        </a>
        <a className="jumplink-navigation" href="#site-sectionnav">
          Jump to Navigation
        </a>
      </header>

      <main role="main" className="page" aria-labelledby="page-header">
        <header className="page-header" id="page-header">
          <h1>{title}</h1>
        </header>

        <div className="page-content">{children}</div>

        <footer className="page-footer"></footer>
      </main>

      <nav className="mobilenav site-footer">
        <section
          id="site-sectionnav"
          className="site-sectionnav"
          aria-label="Section Navigation"
        >
          {sectionNav}
        </section>
      </nav>

      <footer className="site-commonnav">
        <a href="https://earthquake.usgs.gov">Home</a>
        <a href="https://www.usgs.gov/natural-hazards/earthquake-hazards/about">
          About Us
        </a>
        <a href="https://www.usgs.gov/natural-hazards/earthquake-hazards/connect">
          Contacts
        </a>
        <a href="https://www.usgs.gov/policies-and-notices">Legal</a>
      </footer>

      <div className="mobilenav-mask" onClick={hideMobileNav}></div>
      <button className="mobilenav-toggle" onClick={toggleMobileNav}>
        Menu
      </button>
    </div>
  );
}
