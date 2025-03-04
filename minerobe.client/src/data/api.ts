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
let cTokenValidity = 3600;
let cTokenAcuireDate = 0;
let cRefreshToken;
let cToken;
auth.onAuthStateChanged(async (user) => {
  if (user) {
    try {
      cToken = await user.getIdToken();
      cRefreshToken = user.refreshToken;
      cTokenAcuireDate = Date.now();
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
          cRefreshToken = user.refreshToken;
          cTokenAcuireDate = Date.now();
          cUser = user;
        } catch {
          resolve(user);
        }
      }
      resolve(user);
    }, reject);
  });
};
async function checkToken() {
  if (cTokenAcuireDate + cTokenValidity * 1000 < Date.now()) {
    await refreshToken(cRefreshToken);
  }
}

function refreshToken(refreshToken) {
  const url =
    "https://securetoken.googleapis.com/v1/token?key=" +
    import.meta.env.VITE_API_KEY;
  const payload = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  };

  fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // update token
      cToken = data.id_token;
    })
    .catch((error) => {
      console.error("Error refreshing token", error);
    });
}


export const login = async () => {
  await getCurrentUserFromLocal();
  if (cUser) {
    cToken = await cUser.getIdToken();
    cRefreshToken = cUser.refreshToken;
    cTokenAcuireDate = Date.now();
    return cUser;
  }
  await setPersistence(auth, browserLocalPersistence).catch((error) => {
    // Handle error
  });
  let res: any = await signInWithPopup(auth, provider).catch((error) => {
    // Handle error
  });
  cUser = res?.user;
  if (cUser) {
    cToken = await cUser.getIdToken();
    cRefreshToken = cUser.refreshToken;
    cTokenAcuireDate = Date.now();
  }
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

export const PostRequest = async function (
  path: string,
  data: any,
  abortController = null
) {
  await checkToken();
  const res = await fetch(path, {
    method: "POST",
    signal: abortController?.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cToken}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};
export const GetRequest = async function (
  path: string,
  abortController = null
) {
  await checkToken();
  const res = await axios.get(path, {
    signal: abortController?.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cToken}`,
    },
  });
  return res.data;
};
export const PutRequest = async function (
  path: string,
  data: any,
  abortController = null
) {
  await checkToken();
  const res = await fetch(path, {
    method: "PUT",
    signal: abortController?.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cToken}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};
export const DeleteRequest = async function (
  path: string,
  abortController = null
) {
  await checkToken();
  const res = await fetch(path, {
    method: "DELETE",
    signal: abortController?.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cToken}`,
    },
  });
  return res.json();
};
export const PatchRequest = async function (
  path: string,
  data: any,
  abortController = null
) {
  await checkToken();
  const res = await fetch(path, {
    method: "PATCH",
    signal: abortController?.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cToken}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};
