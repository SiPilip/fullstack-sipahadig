import { google } from "googleapis";

const baseUrl = process.env.NEXT_PUBLIC_URL
  ? process.env.NEXT_PUBLIC_URL.replace(/\/$/, "")
  : "http://localhost:3000";

const redirectUri =
  process.env.NODE_ENV === "production"
    ? baseUrl + "/api/auth/google/callback"
    : "http://localhost:3000/api/auth/google/callback";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri,
);

export const scopes = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.file",
];

export const getGoogleAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });
};

export default oauth2Client;
