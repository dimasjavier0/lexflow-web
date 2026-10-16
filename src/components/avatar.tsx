import { useState } from "react";
import { cn } from "../lib/cn";

const SIZES = {
  md: { box: "size-11 rounded-2xl", initial: "text-xl", pixels: 44 },
  lg: { box: "size-20 rounded-3xl", initial: "text-4xl", pixels: 80 },
};

/** A learner's picture, or their initial when there is none or it no longer loads. */
export function Avatar({ url, name, size = "lg" }: { url: string | null; name: string; size?: keyof typeof SIZES }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const { box, initial, pixels } = SIZES[size];
  if (!url || url === failedUrl) return <span aria-hidden="true" className={cn("grid shrink-0 place-items-center bg-teal-soft font-black text-teal-dark", box, initial)}>{name.slice(0, 1).toUpperCase()}</span>;
  // Google only serves account pictures to requests that do not say where they come from.
  return <img className={cn("shrink-0 bg-teal-soft object-cover", box)} src={url} alt="" width={pixels} height={pixels} referrerPolicy="no-referrer" onError={() => setFailedUrl(url)} />;
}
