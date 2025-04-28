import React from 'react';
import '../App.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} CrisprBuilder. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;