import { initializeApp } from "firebase/app";
import {} from "firebase/firestore";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import axios from "axios";

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

const provider = new GoogleAuthProvider();
const auth = getAuth();
let cUser;
let cToken;
auth.onAuthStateChanged(async (user) => {
  if (user) {
    try {
      cToken = await user.getIdToken();
      cUser = user;
    } catch {
      cUser = null;
      cToken = null;
    }
  } else {
    cUser = null;
    cToken = null;
  }
});

export const getCurrentUserFromLocal = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (user) {
        try {
          cToken = await user.getIdToken();
          cUser = user;
        } catch {
          resolve(user);
        }
      }
      resolve(user);
    }, reject);
  });
};

export const login = async () => {
  await getCurrentUserFromLocal();
  if (cUser) {
    cToken = await cUser.getIdToken();
    return cUser;
  }
  await setPersistence(auth, browserLocalPersistence).catch((error) => {
    // Handle error
  });
  let res: any = await signInWithPopup(auth, provider).catch((error) => {
    // Handle error
  });
  cUser = res?.user;
  if (cUser) cToken = await cUser.getIdToken();
  return res?.user;
};
export const logout = async () => {
  await auth.signOut();
  cUser = null;
  cToken = null;
};
export const getAuthUser = () => {
  return cUser;
};

export const PostRequest = async function (path: string, data: any) {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cToken}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};
export const GetRequest = async function (path: string) {
  const res = await axios.get(path, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cToken}`,
    },
  });
  return res.data;
};
export const PutRequest = async function (path: string, data: any) {
  const res = await fetch(path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cToken}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};
export const DeleteRequest = async function (path: string) {
  const res = await fetch(path, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cToken}`,
    },
  });
  return res.json();
};
export const PatchRequest = async function (path: string, data: any) {
  const res = await fetch(path, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cToken}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};
