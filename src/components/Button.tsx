import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  icon: React.ReactNode;
  text: string;
  to?: string;
}

const Button: React.FC<ButtonProps> = ({ icon, text, to }) => {
  const buttonClass = "flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 w-full md:w-auto";

  if (to) {
    return (
      <Link to={to} className={buttonClass}>
        {icon}
        <span className="ml-2">{text}</span>
      </Link>
    );
  }

  return (
    <button className={buttonClass}>
      {icon}
      <span className="ml-2">{text}</span>
    </button>
  );
};

export default Button;