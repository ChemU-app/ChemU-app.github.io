import {googleEmailConfig} from "../gmailOptions.js"
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;
const id = googleEmailConfig.clientId;
const secret = googleEmailConfig.clientSecret;

const myOAuth2Client = new OAuth2(id, secret);
export default myOAuth2Client;
