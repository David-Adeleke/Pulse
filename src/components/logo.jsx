import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import styles from '../styles/logo.module.css';

const navItems = [
  { to: '/dashboard', label: 'Home' },
  { to: '/portfolios', label: 'Portfolios' },
  { to: '/trends', label: 'Market Trends' },
  { to: '/watchlist', label: 'Watchlist' },
];

export default function Logo() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event) {
      if (!headerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

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
    <header className={styles.logoNavbar} ref={headerRef}>
      <Link to='/' className={styles.brand} onClick={() => setOpen(false)}>
        PULSE.NG
      </Link>

      <button
        type='button'
        className={`${styles.hamburger} ${open ? styles.open : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-label='Toggle navigation'
        aria-expanded={open}
        aria-controls='primary-navigation'
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav
        id='primary-navigation'
        className={`${styles.navbarContainer} ${open ? styles.open : ''}`}
      >
        <ul className={styles.navbar}>
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
