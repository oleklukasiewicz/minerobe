import { getApp, initializeApp } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import admin from "firebase-admin";
import { initializeFirestore } from "firebase-admin/firestore";
const firebaseConfig = {
  type: import.meta.env.VITE_SERVICE_TYPE,
  projectId: import.meta.env.VITE_PROJECT_ID,
  privateKeyId: import.meta.env.VITE_PRIVATE_KEY_ID,
  privateKey: import.meta.env.VITE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  clientEmail: import.meta.env.VITE_CLIENT_EMAIL,
  clientId: import.meta.env.VITE_CLIENT_ID,
  authUri: import.meta.env.VITE_AUTH_URI,
  tokenUri: import.meta.env.VITE_TOKEN_URI,
  authProviderX509CertUrl: import.meta.env.VITE_AUTH_PROVIDER_X509_CERT_URL,
  clientC509CertUrl: import.meta.env.VITE_CLIENT_X509_CERT_URL,
  universeDomain: import.meta.env.VITE_UNIVERSE_DOMAIN,
};
const app =
  global.firebaseApp ??
  admin.initializeApp(
    {
      credential: admin.credential.cert(firebaseConfig),
    },
    "minerobe-server"
  );
global.firebaseApp = app;

const db = initializeFirestore(app);

export const AuthorizeViaFirebaseToken = async (token: string) => {
  try {
    const decodedToken = await getAuth(app).verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    return null;
  }
};
export const GetSecret = async function (
  path: string,
  documentName: string,
  token: string,
  user: string
): Promise<any> {
  const auth = await AuthorizeViaFirebaseToken(token);
  if (auth != null) {
    const dataRef = db.doc(path + "/" + documentName);
    const dataSnap = await dataRef.get();
    const data = dataSnap.data();
    return data?.data;
  }
  return null;
};
export const SetSecret = async function (
  path: string,
  documentName: string,
  data: any,
  token: string
) {
  const auth = await AuthorizeViaFirebaseToken(token);
  if (auth != null) {
    const dataJson = JSON.parse(JSON.stringify(data));
    return await db.doc(path + "/" + documentName).set({ data: dataJson });
  }
  return null;
};
export const UpdateDocument = async function (
  path: string,
  documentName: string,
  data: any,
  token: string
) {
  const auth = await AuthorizeViaFirebaseToken(token);
  if (auth != null) {
    const dataJson = JSON.parse(JSON.stringify(data));
    return await db.doc(path + "/" + documentName).update(dataJson);
  }
  return null;
}