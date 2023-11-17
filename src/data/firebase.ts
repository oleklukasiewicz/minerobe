import admin from 'firebase-admin';
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { GoogleAuthProvider } from "firebase/auth";
import { signInWithPopup, onAuthStateChanged,getAuth } from "firebase/auth";

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

//auth with google account
const provider = new GoogleAuthProvider();
const auth = getAuth();

export const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        console.log('User signed in:', user);
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error('Error signing in:', errorCode, errorMessage);
      });
  }
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in.
      console.log('User is signed in:', user);
    } else {
      // User is signed out.
      console.log('User is signed out');
    }
  });

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
