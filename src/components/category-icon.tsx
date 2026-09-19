import type { TestCategory } from "@/lib/test-category";

// A classic side-view airplane silhouette — reads as "aviation" at a glance.
const PLANE_PATH =
  "M21,16V14L13,9V3.5C13,2.67 12.33,2 11.5,2C10.67,2 10,2.67 10,3.5V9L2,14V16L10,13.5V19L7.5,20.5V22L11.5,21L15.5,22V20.5L13,19V13.5L21,16Z";

// A briefcase — reads as "business/corporate" more clearly than an office
// building silhouette does at small sizes.
const BRIEFCASE_PATH =
  "M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z";

const PERSON_PATH =
  "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z";

const GEAR_PATH =
  "M19.14,12.94c0.04,-0.3,0.06,-0.61,0.06,-0.94c0,-0.32,-0.02,-0.64,-0.07,-0.94l2.03,-1.58c0.18,-0.14,0.23,-0.41,0.12,-0.61l-1.92,-3.32c-0.12,-0.22,-0.37,-0.29,-0.59,-0.22l-2.39,0.96c-0.5,-0.38,-1.03,-0.7,-1.62,-0.94L14.4,2.81c-0.04,-0.24,-0.24,-0.41,-0.48,-0.41h-3.84c-0.24,0,-0.43,0.17,-0.47,0.41L9.25,5.35c-0.59,0.24,-1.13,0.57,-1.62,0.94L5.24,5.33c-0.22,-0.08,-0.47,0,-0.59,0.22L2.74,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14,-0.23,0.41,-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39,-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44,-0.17,0.47,-0.41l0.36,-2.54c0.59,-0.24,1.13,-0.56,1.62,-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59,-0.22l1.92,-3.32c0.12,-0.22,0.07,-0.47,-0.12,-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6,-1.62-3.6,-3.6s1.62,-3.6,3.6,-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z";

export function CategoryIcon({
  category,
  className,
}: {
  category: TestCategory;
  className?: string;
}) {
  if (category === "pilote") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d={PLANE_PATH} fill="currentColor" />
      </svg>
    );
  }

  if (category === "grande-entreprise") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d={BRIEFCASE_PATH} fill="currentColor" />
      </svg>
    );
  }

  // personnalite: a profile head with a gear that keeps turning, standing
  // in for "understanding what makes you tick".
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d={PERSON_PATH} fill="currentColor" opacity={0.55} />
      <circle cx="17.5" cy="6.5" r="6" fill="currentColor" opacity={0.25} />
      <svg
        x="12.5"
        y="1.5"
        width="10"
        height="10"
        viewBox="0 0 24 24"
        className="animate-[spin_6s_linear_infinite]"
        style={{ transformOrigin: "17.5px 6.5px" }}
      >
        <path d={GEAR_PATH} fill="currentColor" />
      </svg>
    </svg>
  );
}
