import l from "lodash";
import Mailgun, { MessagesSendResult } from "mailgun.js";
import { supportContacts } from "~/utils/support_contacts";
import UserDatabase from "../db/user_db";

export async function sendEmail({
    subject,
    to,
    cc,
    htmlMessage,
    includeSupport = false,
}: {
    subject: string;
    to: string[] | undefined;
    cc?: string[] | undefined;
    htmlMessage: string;
    includeSupport?: boolean;
}): Promise<MessagesSendResult> {
    const config = useRuntimeConfig();
    const mailgun = new Mailgun(FormData);
    const mgClient = mailgun.client({
        username: "robot.mentally.ai",
        key: config.mailgunApiKey,
        url: "https://api.eu.mailgun.net",
    });
    if (includeSupport) {
        cc ??= [];
        cc.push(...supportContacts());
    }
    console.log(`posting mailgun message to ${to}, cc: ${cc}`);
    return await mgClient.messages.create("robot.mentally.ai", {
        from: `Ade Mentally | ${subject} <notify@mentally.ai>`,
        to: to,
        cc: cc,
        subject: subject,
        html: htmlMessage,
    });
}

export async function notifyDriveConnection({
    driveType,
    cpaId,
    folderName,
}: {
    driveType: "google" | "onedrive";
    cpaId: string;
    folderName: string;
}): Promise<MessagesSendResult> {
    const endpoint = await UserDatabase.get();
    let r = await endpoint`SELECT * FROM customer_user WHERE customer_id = ${cpaId} AND email IS NOT NULL`;
    const htmlMessage = `
    Buongiorno,<br><br>
    Ti informiamo che la connessione al Drive cloud ${l.capitalize(driveType)} <b>è avvenuta con successo.</b><br>
    La cartella utilizzata è la seguente: <b>${folderName}</b>. Dentro la cartella puoi trovare la sincronizzazione di tutti i tuoi files.<br><br>
    Cordiali saluti
    `;
    return await sendEmail({
        subject: `Connessione al cloud ${l.capitalize(driveType)}`,
        to: r.map((e) => e.email.toString()),
        htmlMessage: htmlMessage,
        includeSupport: true,
    });
}

export async function notifyDriveDisconnection({
    driveType,
    cpaId,
    folderName,
}: {
    driveType: "google" | "onedrive";
    cpaId: string;
    folderName: string;
}): Promise<MessagesSendResult> {
    const endpoint = await UserDatabase.get();
    let r = await endpoint`SELECT * FROM customer_user WHERE customer_id = ${cpaId} AND email IS NOT NULL`;
    const htmlMessage = `
    Buongiorno,<br><br>
    Ti informiamo che la connessione al Drive cloud ${l.capitalize(driveType)} <b>è stata interrotta</b>.<br>
    La cartella disconnessa è la seguente: <b>${folderName}</b>. <br>
    <h3>Attenzione!</h3>
    A seguito della disconnessione, <b>i files non verranno più sincronizzati con il Drive.</b><br><br>
    Cordiali saluti
    `;
    return await sendEmail({
        subject: `Disconnessione dal cloud ${l.capitalize(driveType)}`,
        to: r.map((e) => e.email.toString()),
        htmlMessage: htmlMessage,
        includeSupport: true,
    });
}
