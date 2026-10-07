// Build-time stand-in for gsap in the published Showcase script (see build-showcase.mjs).
// narrationControl.ts imports gsap for a scroll tween that Showcase never calls.
const gsap = {
  to() {
    return { kill() {} };
  },
};
export default gsap;
