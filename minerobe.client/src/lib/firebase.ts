let firebaseApp = null;
let firebaseAuth = null;
let firebaseAuthModule = null;
export const FIREBASE = {
  getApp: async () => {
    if (firebaseApp) return firebaseApp;

    const firebase = await import("firebase/app");
    firebaseApp = firebase.initializeApp({
      apiKey: import.meta.env.VITE_API_KEY,
      authDomain: import.meta.env.VITE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_APP_ID,
      measurementId: import.meta.env.VITE_MEASUREMENT_ID,
    });
    return firebaseApp;
  },
  getAuthModule: async () => {
    if (firebaseAuthModule) return firebaseAuthModule;

    const authModule = await import("firebase/auth");
    firebaseAuthModule = authModule;
    return firebaseAuthModule;
  },
  getAuth: async () => {
    if (firebaseAuth) return firebaseAuth;

    const authModule = await FIREBASE.getAuthModule();
    firebaseAuth = authModule.getAuth(await FIREBASE.getApp());
    return firebaseAuth;
  },
};
