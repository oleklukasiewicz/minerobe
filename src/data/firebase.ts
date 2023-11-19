import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { get, writable } from "svelte/store";
import { currentUser } from "$data/cache";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};
const app = initializeApp(firebaseConfig);
const db: any = getFirestore(app);

const provider = new GoogleAuthProvider();
const auth = getAuth();

export const login = async () => {
  if (get(currentUser)) {
    return get(currentUser);
  }
  await setPersistence(auth, browserSessionPersistence).catch((error) => {
    // Handle error
  });
  let res: any = await signInWithPopup(auth, provider).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
  return res.user;
};
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser.set(user);
  } else {
    currentUser.set(null); 
  }
});
export const logout = async () => {
  await auth.signOut();
};

export const GetCollection = async (collection: string) => {
  const querySnapshot = await db.collection(collection).get();
  const data = querySnapshot.docs.map((doc) => doc.data());
  return data;
};
export const GetDocument = async (collection: string, id: string) => {
  const docRef = await db.collection(collection).doc(id).get();
  return docRef.data();
};
export const AddDocument = async (collection: string, data: any) => {
  const docRef = await db.collection(collection).add(data);
  return docRef.id;
};
export const UpdateDocument = async (
  collection: string,
  id: string,
  data: any
) => {
  const docRef = await db.collection(collection).doc(id).update(data);
  return docRef;
};
export const DeleteDocument = async (collection: string, id: string) => {
  const docRef = await db.collection(collection).doc(id).delete();
  return docRef;
};
export const GenerateId = (collection: string) => {
  return db.collection(collection).doc().id;
};
