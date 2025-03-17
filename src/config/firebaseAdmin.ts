import admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const serviceAccountPath = process.env.FIREBASE_CREDENTIALS as string;

if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
    throw new Error("Arquivo de credenciais do Firebase não encontrado!");
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export default admin;
