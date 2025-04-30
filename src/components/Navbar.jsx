import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>N-gram Insights</div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/stats" style={styles.link}>Stats</Link>
        <Link to="/predict" style={styles.link}>Predict</Link>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    backgroundColor: '#ffffff',
    padding: '1rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  brand: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: '#6c5ce7',
    fontFamily: 'Segoe UI, sans-serif'
  },
  links: {
    display: 'flex',
    gap: '1.5rem'
  },
  link: {
    textDecoration: 'none',
    color: '#1e293b',
    fontWeight: 500,
    transition: 'color 0.3s',
    fontFamily: 'Segoe UI, sans-serif'
  },
  linkHover: {
    color: '#6c5ce7'
  }
};
