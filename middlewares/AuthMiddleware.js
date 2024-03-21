const jsonwebtoken = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const jsonWebKeys = {
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
  console.log(req.header("x_auth_token"), `req.header("x_auth_token")`);
  console.log(req.cookies.x_auth_token, `req.cookies.x_auth_token`);
  console.log(req.header("Authorization"), `req.header("Authorization")`);
  console.log(req.cookies.Authorization, `req.cookies.Authorization`);
 
  const authorizationHeader = req.header("x_auth_token")
    ? req.header("x_auth_token")
    : req.cookies.x_auth_token;  

  const startsWith = authorizationHeader.startsWith("Bearer ") 
  if (!authorizationHeader || !startsWith) {
    return res
      .status(401)
      .json({ error: true, message: "Invalid authorization header" });
  } 
  
  const token =   authorizationHeader.replace("Bearer ", "") 

  if (!token) {
    return res
      .status(401)
      .json({ error: true, message: "Authorization token not found" });
  }

  const header = decodeTokenHeader(token);
  const jsonWebKey = getJsonWebKeyWithKID(header.kid);
  verifyJsonWebTokenSignature(token, jsonWebKey, (err, decodedToken) => {
    if (err?.expiredAt) {
      return res.status(401).json({ error: true
        , message: "Invalid token" });
    } else {
      req.loggedUser = decodedToken.email;
      next();
    }
  });
};
module.exports= authMiddleware;
