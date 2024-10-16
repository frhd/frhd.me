import React from 'react';

const AnimatedComingSoon = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4 animate-pulse">
          Coming Soon
        </h1>
        <div className="flex justify-center space-x-2">
          {['Stay', 'Tuned', 'For', 'Something', 'Awesome'].map((word, index) => (
            <span
              key={index}
              className="inline-block text-2xl text-white opacity-0 animate-fadeIn"
              style={{ animationDelay: `${index * 0.5}s` }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedComingSoon;