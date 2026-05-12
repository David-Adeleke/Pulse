import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import styles from '../styles/logo.module.css';

// Brand icon path served from the public folder.
const brandIcon = '/favicon.svg';

// Centralized top-navigation links.
const navItems = [
  { to: '/dashboard', label: 'Home' },
  { to: '/portfolios', label: 'Portfolios' },
  { to: '/trends', label: 'Market Trends' },
  { to: '/watchlist', label: 'Watchlist' },
];

// Sticky top navigation with mobile menu support.
export default function Logo() {
  // Tracks whether the mobile menu is open.
  const [open, setOpen] = useState(false);
  // Points to the header root so outside-click detection can close the menu.
  const headerRef = useRef(null);
  // Read the current pathname so menu state can reset on route changes.
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Close the menu every time navigation changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // While open, close menu on outside click or Escape key.
  useEffect(() => {
    if (!open) return;

    // Close if a mousedown happens outside the header.
    function handleClickOutside(event) {
      if (!headerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    // Close if user presses Escape.
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    // Header is sticky and contains brand + nav controls.
    <header className={styles.logoNavbar} ref={headerRef}>
      {/* Brand link returns users to the landing page. */}
      <Link to='/' className={styles.brand} onClick={() => setOpen(false)}>
        <span className={styles.brandInner}>
          {/* Decorative brand icon. */}
          <img src={brandIcon} alt='' aria-hidden='true' className={styles.brandIcon} />
          {/* Brand text label. */}
          <span className={styles.brandText}>PULSE.NG</span>
        </span>
      </Link>

      {/* Mobile hamburger toggle button. */}
      <button
        type='button'
        className={`${styles.hamburger} ${open ? styles.open : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-label='Toggle navigation'
        aria-expanded={open}
        aria-controls='primary-navigation'
      >
        {/* Three lines of the hamburger icon. */}
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Primary navigation links (desktop and mobile). */}
      <nav
        id='primary-navigation'
        className={`${styles.navbarContainer} ${open ? styles.open : ''}`}
      >
        <ul className={styles.navbar}>
          {/* Render each nav item as a route-aware link. */}
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Clickable backdrop to close the menu on mobile. */}
      <button
        type='button'
        className={`${styles.backdrop} ${open ? styles.open : ''}`}
        onClick={() => setOpen(false)}
        aria-label='Close navigation'
        tabIndex={-1}
      />
    </header>
  );
}
