import myOAuth2Client from "./gauth.service.js";
import {googleEmailConfig} from "../gmailOptions.js"
import { createTransport } from "nodemailer";

export const sendEmailService = async (
    to,
    subject,
    html
) => {
    try {
        myOAuth2Client.setCredentials({
            refresh_token: googleEmailConfig.refreshToken,
        });
        const accessToken = await myOAuth2Client.getAccessToken();
        const transportOptions = {
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: googleEmailConfig.email,
                clientId: googleEmailConfig.clientId,
                refreshToken: googleEmailConfig.refreshToken,
                accessToken: accessToken.token,
            },
        };
        const smtpTransport = createTransport(transportOptions);
        const mailOptions = {
            from: {
                name: "ChemU App Email Service",
                address: googleEmailConfig.email,
            },
            to,
            subject,
            html,
        };
        await smtpTransport.sendMail(mailOptions);
    } catch (error) {
        console.error(error);
    }
};

export const getEmailHTML = (code) => `<html>
<head>
    <title>RECOVERY CODE</title>
</head>
<body>
    <h1>YOUR RECOVERY CODE IS:</h1>
    <p>${code}</p>
</body>
</html>`;

export async function sendEmail (to, code){
    const html = getEmailHTML(code);
    await sendEmailService(to, "ChemU App Recovery Code", html);
};
