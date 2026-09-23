"use client";

import { Component, type ReactNode } from "react";

/**
 * Catches a hard WebGL failure (context creation refused, GPU disabled,
 * sandboxed browser, etc.) so one stubborn machine can't crash the whole
 * page with a Next.js error overlay — falls back to whatever the caller
 * passes instead (the original static avatar image).
 */
export class Avatar3DErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("3D avatar could not render, falling back to the static image:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
