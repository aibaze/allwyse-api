const jsonwebtoken = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const jsonWebKeysDev = {
  keys: [
    {
      alg: "RS256",
      e: "AQAB",
      kid: "QIb3NkaNlydPkO8iRyybwL24bH95dKFXXA2Bx4fe9Ak=",
      kty: "RSA",
      n: "_a3AiL47VIgVgx6z3cfQHKanjqForDfH6d5UIQjNPwpCe7Zm-DGWchjKE8m73NcbOxIgUTfuMFPphRqTVT8HNOrzl5CEKDx6RHJDLBQRLJyKvLoXaXdY5u1oDZGU6RA0njhEGHhUVn4MJXiN-cP4MDOZguIf17YghuWO6DwuXbdwDPNJQr0ia8Vj3nIOKlhjTP5-bSxHMBkZZeWIV8zBGWdZQPNt-JOwhct81W5eYRAaXfVSZj4yguIBz4cCfASdRfSB7A3mZY9CM0O4SEIFk1Mt6o1XEHxrmK-bGAPNAgiJjzLx0U3pU1liha1EHq0EUmSeRk1PzYXCqT0najvAZw",
      use: "sig",
    },
    {
      alg: "RS256",
      e: "AQAB",
      kid: "d66WtUXZudiUYOfakjgYZP3W44iiVGJZBqQGhilBWpE=",
      kty: "RSA",
      n: "q8uBORp-x2khYaAbPsFIjw577c2K3gMECao8sZUmvB_3S8CyR7MJBLPgUoogrcibcs_3wXIhNF67Q2byKtBTn8qhAEetq-cDvEpHbPsDsvLQwzYK4sTAERKpoo1FdHr0cav-lk2nl8RIHx2o9Mp1fp02IFhMylOuSL-wTjMKtVwx9c6Ij5EKoUkVxLh2Oz_kXi4BSoeUOEpcRMUmF7IvfervkJHHcpIOhYwYQ22y6P1Ii_E2xHdGcQMhSX2RnXMLzlKzsqRXfKSg8udMRpKl9zyHAroHEfQkUoFWsPdszCYUQRQ-7F5xG1woJVlNsbx_xK6KZJ3xr-z0wu-eOs1yEw",
      use: "sig",
    },
  ],
};

const jsonWebKeysProd = {
  keys: [
    {
      alg: "RS256",
      e: "AQAB",
      kid: "JvPgbBPxfxaqELAI/c++ILt/5sCYEeTM0DL/zHC35sA=",
      kty: "RSA",
      n: "sKCDgvmVLa_zImef2SgInIP6dUBEoS9HFovbJdXAL1_AoqrZPahMeXoDydlZgjweNtK9s1aIGxh4p5dAGnqLC0zl8hwOg7AIHKIvqTtFlFaYGOdyYbDMwTq9pi9I5CKfSP6R5ZqQnenFeYvOLq0lV_pmQYYfNe8t4JmADl77QgJwpYfZJqWl7Qfc8wdgqLAyHmFTXIobjFIFQU_ZDbFsz7RYV65x6jRvxLBYCvD-DrRPfhWvn4LYYRE-seaR0RbtrYApYnGT7TrULUnhwkH3kp7svBOa47I1--UcEsls5PUQUYXhdZs8S61ez229Qr4fuiR581igPcw6aktDFmwyxw",
      use: "sig",
    },
    {
      alg: "RS256",
      e: "AQAB",
      kid: "2wYWAq5V92pJZVlul4d2jsyC/VqAdJ+O5xYb/EiFClI=",
      kty: "RSA",
      n: "vzRqflo6zjaDMnRCBqMJJIeI4qJJ_ppIjVAiQDs8_cX118FImM75IitJl3266AH5NcPMO-tL27W1NlCq9aU4o7v1hZPFOf25jPphAQgjGd9Mluv01PlsaM4XxvX1xGU7EjCKrPUIdFNOq9DS7DulIxDcULc-JdEjLgsWYaF0Oy7oiGuIFMikRHIZSsXqm5DyvWplcezFSd9DSxHXAkI6n9iyThmh97Eo-zhxivxzko_3zqLhI15esmEg2Gb-l-gBeG2pwyuC8xJyeQ_ciiuEJnNKSTBTfgqmvV-DXLj61Gi6BdII3jPtMEPU8QScukX7kN3xA8yH8Y3Qu0boeQrx7w",
      use: "sig",
    },
  ],
};

const jsonWebKeys =
  process.env.ENVIRONMENT === "prod" ? jsonWebKeysProd : jsonWebKeysDev;

function decodeTokenHeader(token) {
  const [headerEncoded] = token.split(".");
  const buff = new Buffer(headerEncoded, "base64");
  const text = buff.toString("ascii");
  return JSON.parse(text);
}

function getJsonWebKeyWithKID(kid) {
  for (let jwk of jsonWebKeys.keys) {
    if (jwk.kid === kid) {
      return jwk;
    }
  }
  return null;
}

function verifyJsonWebTokenSignature(token, jsonWebKey, clbk) {
  const pem = jwkToPem(jsonWebKey);
  jsonwebtoken.verify(
    token,
    pem,
    { algorithms: ["RS256"] },
    (err, decodedToken) => clbk(err, decodedToken)
  );
}

const authMiddleware = (req, res, next) => {
  const authorizationHeader = req.header("x_auth_token")
    ? req.header("x_auth_token")
    : req.cookies.x_auth_token;

  const startsWith = authorizationHeader.startsWith("Bearer ");
  if (!authorizationHeader || !startsWith) {
    return res
      .status(401)
      .json({ error: true, message: "Invalid authorization header" });
  }

  const token = authorizationHeader.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ error: true, message: "Authorization token not found" });
  }
  const header = decodeTokenHeader(token);

  const jsonWebKey = getJsonWebKeyWithKID(header.kid);

  verifyJsonWebTokenSignature(token, jsonWebKey, (err, decodedToken) => {
    if (err?.expiredAt) {
      return res.status(401).json({ error: true, message: "Invalid token" });
    } else {
      req.loggedUser = decodedToken.email;
      next();
    }
  });
};
module.exports = authMiddleware;
