import React from 'react';

const Skeleton = ({ type = 'text', width, height, className = '', style = {}, count = 1 }) => {
  const skeletons = Array.from({ length: count }).map((_, index) => {
      let baseClasses = 'skeleton';
      if (type === 'circle') baseClasses += ' skeleton-circle';
      if (type === 'block') baseClasses += ' skeleton-block';
      if (type === 'text') baseClasses += ' skeleton-text';

      const computedStyle = {
          width: width,
          height: height,
          ...style
      };

      return (
        <div
            key={index}
            className={`${baseClasses} ${className}`}
            style={computedStyle}
        />
      );
  });

  return <>{skeletons}</>;
};

export default Skeleton;
