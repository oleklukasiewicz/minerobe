import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
} from "firebase/auth";

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
export const db: any = getFirestore(app);

const provider = new GoogleAuthProvider();
const auth = getAuth();
let cUser;
auth.onAuthStateChanged((user) => {
  console.log("auth state changed");
  if (user) {
    cUser = user;
  } else {
    cUser = null;
  }
});

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged( user => {
      unsubscribe();
      resolve(user);
    }, reject);
  })
};

export const login = async () => {
  await getCurrentUser();
  if (cUser) {
    return cUser;
  }
  await setPersistence(auth, browserLocalPersistence).catch((error) => {
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
  cUser = res.user;
  return res.user;
};

export const GetUser = function () {
  return cUser;
};
export const logout = async () => {
  await auth.signOut();
  cUser = null;
};
export const GetDocument = async function (
  path: string,
  documentName: string
): Promise<any> {
  if (cUser) {
    const dataRef = doc(db, path, documentName);
    const dataSnap = await getDoc(dataRef);
    return dataSnap.data();
  }
};
export const SetDocument = async function (
  path: string,
  documentName: string,
  data: any
): Promise<any> {
  if (cUser) {
    const dataRef = doc(db, path, documentName);
    await setDoc(dataRef, { ...data });
    return data;
  }
};
