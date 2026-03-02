export type Gender = 'female' | 'male';

const femaleAvatarModules = import.meta.glob('/src/assets/female avatars/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const maleAvatarModules = import.meta.glob('/src/assets/male avatars/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

export const femaleAvatars = Object.values(femaleAvatarModules);
export const maleAvatars = Object.values(maleAvatarModules);

export function getAvatarsByGender(gender: Gender): string[] {
  return gender === 'female' ? femaleAvatars : maleAvatars;
}

export function getRandomAvatar(gender: Gender): string {
  const pool = getAvatarsByGender(gender);
  if (pool.length === 0) return '';
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}
