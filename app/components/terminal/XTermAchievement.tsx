"use client";

import { useEffect, useState } from "react";
import type { Achievement } from "./achievements";
import { playSound } from "./sound-manager";

interface AchievementNotificationProps {
  achievement: Achievement;
  onDismiss: () => void;
}

function AchievementNotification({ achievement, onDismiss }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Play achievement sound
    playSound("achievement");

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, 4000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`
        fixed top-4 right-4 z-[9999]
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 shadow-lg shadow-green-500/20 max-w-sm">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="text-3xl">{achievement.icon}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-green-400 text-xs font-mono uppercase tracking-wider mb-1">
              Achievement Unlocked!
            </div>
            <div className="text-green-300 font-mono font-bold truncate">
              {achievement.name}
            </div>
            <div className="text-green-500/70 text-sm font-mono truncate">
              {achievement.description}
            </div>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="mt-3 h-1 bg-green-900/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full animate-progress"
            style={{ animation: "progress 4s linear" }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

export default function XTermAchievementManager() {
  const [notifications, setNotifications] = useState<Achievement[]>([]);

  useEffect(() => {
    const handleAchievementUnlocked = (event: CustomEvent<{ achievement: Achievement }>) => {
      const { achievement } = event.detail;
      setNotifications((prev) => [...prev, achievement]);
    };

    window.addEventListener(
      "achievement-unlocked",
      handleAchievementUnlocked as EventListener
    );

    return () => {
      window.removeEventListener(
        "achievement-unlocked",
        handleAchievementUnlocked as EventListener
      );
    };
  }, []);

  const dismissNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {notifications.map((achievement, index) => (
        <AchievementNotification
          key={`${achievement.id}-${index}`}
          achievement={achievement}
          onDismiss={() => dismissNotification(index)}
        />
      ))}
    </>
  );
}
