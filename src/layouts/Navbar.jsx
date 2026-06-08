import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, ArrowRight, LogOut, ChevronDown } from 'lucide-react';

/* Navigation grouped by HR workflow stages */
const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/employees', label: 'Employees' },
  {
    label: 'Recruitment',
    children: [
      { path: '/vacancies', label: 'Vacancies' },
      { path: '/recruitment', label: 'Applications' },
      { path: '/interviews', label: 'Interviews' },
      { path: '/offers', label: 'Offers & Joining' },
    ],
  },
  { path: '/attendance', label: 'Attendance' },
  {
    label: 'HR Ops',
    children: [
      { path: '/performance', label: 'Performance' },
      { path: '/feedback', label: 'Feedback' },
      { path: '/grievances', label: 'Grievances' },
      { path: '/exits', label: 'Exits' },
    ],
  },
];

function NavDropdown({ item, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();
  const isChildActive = item.children?.some(c => location.pathname === c.path);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="nav-more-wrap" ref={ref}>
      <button
        className={`nav-link nav-more-btn ${isChildActive ? 'active' : ''}`}
        onClick={() => setOpen(!open)}
      >
        {item.label}
        <ChevronDown size={11} style={{ marginLeft: 3, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div className="nav-more-dropdown">
          {item.children.map(child => (
            <NavLink
              key={child.path}
              to={child.path}
              className={({ isActive }) => `nav-more-item ${isActive ? 'active' : ''}`}
              onClick={() => { setOpen(false); onNavigate?.(); }}
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-logo">
        <div className="logo-dot">H</div>
        <span>HR MIS</span>
      </div>

      <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {NAV_ITEMS.map(item =>
          item.children ? (
            <NavDropdown key={item.label} item={item} onNavigate={closeMenu} />
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          )
        )}

        {/* Mobile-only: flatten all dropdown items */}
        {menuOpen && NAV_ITEMS.filter(i => i.children).flatMap(group =>
          group.children.map(child => (
            <NavLink
              key={child.path}
              to={child.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
              style={{ paddingLeft: 28 }}
            >
              {child.label}
            </NavLink>
          ))
        )}

        {/* Mobile-only logout */}
        <button className="nav-link mobile-logout" onClick={handleLogout} style={{ display: menuOpen ? 'flex' : 'none' }}>
          <LogOut size={14} /> Logout
        </button>
      </div>

      <button className="navbar-cta" onClick={handleLogout} title="Logout">
        <span>Logout</span>
        <div className="arrow-icon"><LogOut size={12} /></div>
      </button>
    </nav>
  );
}
