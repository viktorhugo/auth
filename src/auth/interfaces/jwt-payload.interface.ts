export interface JwtPayload {
  email: string;
  name: string;
  userId: string;
}
export interface JwtVerifyData extends JwtPayload {
  sub: string;
  iat: string;
  exp: string;
}
