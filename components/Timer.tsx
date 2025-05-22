import React, { useState, useEffect } from 'react';

const Timer = ({ duration }: any) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    if (timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const progress = (timeLeft / duration) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg className="transform -rotate-90" width="120" height="120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#3b82f6"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </svg>
      <div className="mt-4 text-2xl">
        {timeLeft}s
      </div>
    </div>
  );
};

export default Timer;