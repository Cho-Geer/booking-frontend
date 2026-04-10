import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'noBorder';
  animated?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  animated = true
}) => {
  const baseClasses = 'rounded-lg shadow-md bg-card';
  
  const variantClasses = {
    default: '',
    outlined: 'border border-border',
    noBorder: ''
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} p-4 ${className}`;
  
  if (!animated) {
    return (
      <div 
        id="card-container"
        className={classes}
      >
        {children}
      </div>
    );
  }
  
  return (
    <motion.div 
      id="card-container"
      className={classes}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;
