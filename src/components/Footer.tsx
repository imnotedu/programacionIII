import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8 mt-auto border-t">
      <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Fitness Fuel Store. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
