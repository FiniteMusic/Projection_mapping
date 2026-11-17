import { SignJWT, jwtVerify } from "jose";

const PLAYER_TOKEN_EXPIRATION_SECONDS = 60 * 60 * 12;

function getPlayerTokenSecret(): Uint8Array {
  const secret = process.env.JWT_PLAYER_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("INVALID_PLAYER_TOKEN_SECRET");
  }

  return new TextEncoder().encode(secret);
}

export async function createPlayerToken(
  sessionId: string
): Promise<{
  playerToken: string;
  expiresAt: string;
}> {
  const issuedAt = Math.floor(Date.now() / 1000);

  const expiresAt =
    issuedAt + PLAYER_TOKEN_EXPIRATION_SECONDS;

  const playerToken = await new SignJWT({
    role: "player",
    sessionId
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sessionId)
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAt)
    .sign(getPlayerTokenSecret());

  return {
    playerToken,
    expiresAt: new Date(expiresAt * 1000).toISOString()
  };
}

export async function verifyPlayerToken(
  token: string
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      getPlayerTokenSecret(),
      {
        algorithms: ["HS256"]
      }
    );

    if (
      payload.role !== "player" ||
      typeof payload.sessionId !== "string" ||
      payload.sub !== payload.sessionId
    ) {
      return null;
    }

    return payload.sessionId;
  } catch {
    return null;
  }
}

export async function createPlayerTokenAt(
  sessionId: string,
  issuedAt: Date
): Promise<{
  playerToken: string;
  expiresAt: string;
}> {
  const issuedAtSeconds = Math.floor(
    issuedAt.getTime() / 1000
  );

  const expiresAtSeconds =
    issuedAtSeconds + PLAYER_TOKEN_EXPIRATION_SECONDS;

  const playerToken = await new SignJWT({
    role: "player",
    sessionId
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sessionId)
    .setIssuedAt(issuedAtSeconds)
    .setExpirationTime(expiresAtSeconds)
    .sign(getPlayerTokenSecret());

  return {
    playerToken,
    expiresAt: new Date(
      expiresAtSeconds * 1000
    ).toISOString()
  };
}