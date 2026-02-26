const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || '';

export const isAdminUser = (email?: string): boolean => {
  if (!ADMIN_EMAIL) return false;
  return email === ADMIN_EMAIL;
};

export const ADMIN_SESSION_KEYS = {
  SELECTED_USER_ID: 'admin_selected_user_id',
} as const;
