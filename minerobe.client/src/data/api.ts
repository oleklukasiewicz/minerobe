import { FIREBASE } from "$lib/firebase";
import axios from "axios";

let cUser;
let cTokenValidity = 3600 - 100;
let cTokenAcuireDate = 0;
let cRefreshToken;
let cToken;

const initializeAuthStateListener = async () => {
  (await FIREBASE.getAuth()).onAuthStateChanged(async (user) => {
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
};

initializeAuthStateListener();

export const getCurrentUserFromLocal = () => {
  return new Promise(async (resolve, reject) => {
    const unsubscribe = (await FIREBASE.getAuth()).onAuthStateChanged(
      async (user) => {
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
      },
      reject
    );
  });
};

async function checkToken() {
  if (!cRefreshToken) return;
  if (cTokenAcuireDate + cTokenValidity * 1000 < Date.now()) {
    await refreshToken(cRefreshToken);
  }
}

async function refreshToken(refreshToken) {
  const url =
    "https://securetoken.googleapis.com/v1/token?key=" +
    import.meta.env.VITE_API_KEY;
  const payload = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  };

  const resp = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await resp.json();
  cToken = data.id_token;
  cRefreshToken = data.refresh_token;
  cTokenAcuireDate = Date.now();
  return cToken;
}

export const login = async () => {
  await getCurrentUserFromLocal();
  if (cUser) {
    cToken = await cUser.getIdToken();
    cRefreshToken = cUser.refreshToken;
    cTokenAcuireDate = Date.now();
    return cUser;
  }
  var firebaseAuth = await FIREBASE.getAuth();
  var {
    signInWithPopup,
    GoogleAuthProvider,
    setPersistence,
    browserLocalPersistence,
  } = await FIREBASE.getAuthModule();
  await setPersistence(firebaseAuth, browserLocalPersistence).catch((error) => {
    // Handle error
  });
  let res: any = await signInWithPopup(
    firebaseAuth,
    new GoogleAuthProvider()
  ).catch((error) => {
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
  (await FIREBASE.getAuth()).signOut();
  cUser = null;
  cToken = null;
};

export const getAuthUser = () => {
  return cUser;
};

//requests
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
