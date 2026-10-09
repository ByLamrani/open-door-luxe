export const OWNER_EMAIL = "adil.lamrani.ejjouti@gmail.com";

// Presentation only: authorization continues to use server-validated roles.
export const isOwnerProfile = (profile: { email?: string | null }) =>
  profile.email?.toLowerCase() === OWNER_EMAIL;

export const canAdvanceFulfillment = (requiredComplete: boolean, exception: string) =>
  requiredComplete || exception.trim().length > 0;