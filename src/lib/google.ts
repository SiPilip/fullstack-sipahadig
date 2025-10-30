import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NODE_ENV === 'production' 
    ? 'https://your-production-url/api/auth/google/callback' 
    : 'http://localhost:3000/api/auth/google/callback'
);

export const scopes = [
  'https://www.googleapis.com/auth/drive.readonly',
];

export const getGoogleAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });
};

export default oauth2Client;
