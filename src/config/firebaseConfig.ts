
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import * as dotenv from 'dotenv';

dotenv.config();

// configuracao do firebase carregada do .env sem expor diretamente o código
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// inicializando o firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 
