import { useEffect, useState } from "react";
import { useAppStore } from "../stores/app-store";

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useAppStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}
