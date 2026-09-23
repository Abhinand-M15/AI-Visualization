import type { Chunk } from "@/lib/types";
import { getAvatarImage, type Avatar } from "@/lib/avatars";

export interface TemplateProps {
  title: string;
  chunks: Chunk[];
  avatars: Avatar[];
}

export function avatarForIndex(index: number, avatars: Avatar[]): Avatar | undefined {
  if (avatars.length === 0) return undefined;
  return avatars[index % avatars.length];
}

/** Cycles through an avatar's video clips the same way avatarForIndex cycles
 *  through avatars — with one clip, every section just gets that same clip. */
export function avatarVideoForIndex(index: number, avatar: Avatar | undefined): string | undefined {
  if (!avatar?.videoUrls || avatar.videoUrls.length === 0) return undefined;
  return avatar.videoUrls[index % avatar.videoUrls.length];
}

/** Picks which avatar's turn it is (alternating if 2 selected), then that avatar's
 * expression image matching this chunk's emotion. */
export function avatarImageForChunk(chunk: Chunk, index: number, avatars: Avatar[]): string | undefined {
  const avatar = avatarForIndex(index, avatars);
  if (!avatar) return undefined;
  return getAvatarImage(avatar, chunk.emotion);
}
