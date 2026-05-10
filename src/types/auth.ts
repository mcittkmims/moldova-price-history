export type AuthUser = {
  username: string;
  permissions: string[];
};

export type AuthSession = {
  expiresAt: string;
  user: AuthUser;
};
