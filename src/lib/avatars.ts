import type { EmotionKey } from "@/lib/types";

export interface Avatar {
  id: string;
  name: string;
  /** Default/thumbnail image, shown in the picker and used when no emotion match exists. */
  imageUrl: string;
  /** Per-emotion expression images. Not every avatar has every emotion. */
  emotions: Partial<Record<EmotionKey, string>>;
  /** When set, this avatar renders as a live 3D model (this GLB) instead of
   *  a flat image wherever it appears while narrating. No emotion variants —
   *  one static pose stands in for every emotion. */
  modelUrl?: string;
  /** When set, a template can render this avatar as a looping, muted video
   *  instead of the 3D model or flat image — an explicit per-template choice
   *  (see AvatarDisplay's `mode` prop), not a replacement for modelUrl.
   *  Multiple entries cycle across chunks/sections the same way avatars
   *  themselves alternate — see avatarVideoForIndex. */
  videoUrls?: string[];
}

export const AVATARS: Avatar[] = [
  {
    id: "avatar-1",
    name: "Avatar 1",
    imageUrl: "/avatars/avatar-1/neutral.png",
    modelUrl: "/models/avatar-1-robot.glb",
    videoUrls: ["/videos/avatar-1-lunar-explaining.mp4"],
    emotions: {
      neutral: "/avatars/avatar-1/neutral.png",
      confused: "/avatars/avatar-1/confused.png",
      happy: "/avatars/avatar-1/happy.png",
      idea: "/avatars/avatar-1/idea.png",
      solution: "/avatars/avatar-1/solution.png",
      // no dedicated "thinking" pose for this bot — falls back to confused.
    },
  },
  {
    id: "avatar-2",
    name: "Avatar 2",
    imageUrl: "/avatars/avatar-2/neutral.png",
    emotions: {
      neutral: "/avatars/avatar-2/neutral.png",
      confused: "/avatars/avatar-2/confused.png",
      happy: "/avatars/avatar-2/happy.png",
      idea: "/avatars/avatar-2/idea.png",
      solution: "/avatars/avatar-2/solution.png",
      thinking: "/avatars/avatar-2/thinking.png",
    },
  },
];

export function getAvatarById(id: string): Avatar | undefined {
  return AVATARS.find((avatar) => avatar.id === id);
}

/** Resolves an avatar's image for a given emotion, falling back sensibly if that avatar has no such pose. */
export function getAvatarImage(avatar: Avatar, emotion: EmotionKey | undefined): string {
  if (emotion && avatar.emotions[emotion]) return avatar.emotions[emotion]!;
  if (emotion === "thinking" && avatar.emotions.confused) return avatar.emotions.confused;
  return avatar.emotions.neutral ?? avatar.imageUrl;
}
