import { useState, useEffect } from "react";

export function useIsMobile(query = "(max-width: 768px)") {
  const read = () => typeof window !== "undefined" && window.matchMedia(query).matches;
  const [isMobile, setIsMobile] = useState(read);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return isMobile;
}
