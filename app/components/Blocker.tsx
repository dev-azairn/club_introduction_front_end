import { useEffect } from 'react';
import { useBlocker } from 'react-router'; // Use 'react-router-dom' if not using Remix/RR7 framework

export function useConfirmLeave(shouldBlock: boolean = true) {
  
  // 1. Handle Browser Refresh / Close Tab
  useEffect(() => {
    if (!shouldBlock) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldBlock]);

  // 2. Handle React Router Navigation (Clicking links inside the app)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      shouldBlock && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      // You can replace window.confirm with a custom Modal here if you want
      const proceed = window.confirm("Are you sure you want to leave? You will lose your spot.");
      
      if (proceed) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);
}