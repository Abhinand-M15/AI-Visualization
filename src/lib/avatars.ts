import type { EmotionKey } from "@/lib/types";

export interface Avatar {
  id: string;
  name: string;
  /** Default/thumbnail image, shown in the picker and used when no emotion match exists. */
  imageUrl: string;
  /** Per-emotion expression images. Not every avatar has every emotion. */
  emotions: Partial<Record<EmotionKey, string>>;
}

export const AVATARS: Avatar[] = [
  {
    id: "avatar-1",
    name: "Avatar 1",
    imageUrl: "/avatars/avatar-1/neutral.png",
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
