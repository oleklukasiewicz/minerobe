import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  documentId,
  type WhereFilterOp,
  Query,
  type DocumentData,
} from "firebase/firestore";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  setPersistence,
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
  if (user) {
    cUser = user;
  } else {
    cUser = null;
  }
});

export const getCurrentUserFromLocal = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
      if (user) {
        cUser = user;
      }
    }, reject);
  });
};

export const login = async () => {
  await getCurrentUserFromLocal();
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
  cUser = res?.user;
  return res?.user;
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
  const dataRef = doc(db, path, documentName);
  const dataSnap = await getDoc(dataRef);
  return dataSnap.data();
};
export const IsDocumentExist = async function (
  path: string,
  documentName: string
): Promise<boolean> {
  const dataRef = doc(db, path, documentName);
  const dataSnap = await getDoc(dataRef);
  return dataSnap.exists();
};
export const SetDocument = async function (
  path: string,
  documentName: string,
  data: any
): Promise<any> {
  if (cUser) {
    const dataRef = doc(db, path, documentName);
    const dataJson = JSON.parse(JSON.stringify(data));
    await setDoc(dataRef, dataJson);
    return data;
  }
};
export const UpdateDocument = async function (
  path: string,
  documentName: string,
  data: any
): Promise<any> {
  if (cUser) {
    const dataRef = doc(db, path, documentName);
    const dataJson = JSON.parse(JSON.stringify(data));
    await setDoc(dataRef, dataJson, { merge: true });
    return data;
  }
};
export const DeleteDocument = async function (
  path: string,
  documentName: string
): Promise<any> {
  if (cUser) {
    const dataRef = doc(db, path, documentName);
    await deleteDoc(dataRef);
  }
};
export const GenerateIdForCollection = function (collectionName: string) {
  if (cUser) {
    const dataRef: any = collection(db, collectionName);
    return doc(dataRef).id;
  }
};
export const UpdateRawDocument = async function (
  path: string,
  documentName: string,
  data: any
): Promise<any> {
  if (cUser) {
    const dataRef = doc(db, path, documentName);
    await setDoc(dataRef, data, { merge: true });
    return data;
  }
};
export const DeleteCollection = async function (path: string) {
  if (cUser) {
    const dataRef = collection(db, path);
    const dataSnap = await getDocs(dataRef);
    dataSnap.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  }
};
export const GetCollection = async function (path: string) {
  if (cUser) {
    const dataRef = collection(db, path);
    const dataSnap = await getDocs(dataRef);
    return dataSnap.docs.map((doc) => doc.data());
  }
};
export const BuildQuery = async function (
  path: string,
  localPath: string,
  docName: string,
  docIds: string[],
  clauses: QueryWhere[]
) {
  if (cUser) {
    const queries: Query<DocumentData>[] = [];

    docIds.forEach(async (id) => {
      const subCollectionRef = collection(db, `${path}/${id}/${localPath}`);
      const subCollectionQuery = query(
        subCollectionRef,
        where(documentId(), "==", docName),
        ...clauses.map((clause) =>
          where(clause.field, clause.operator as WhereFilterOp, clause.value)
        )
      );
      queries.push(subCollectionQuery);
    });
    return queries;
  }
  return null;
};
export const FetchDocsFromQuery = async function (queries: Query[]) {
  if (cUser) {
    const docs = await Promise.all(
      queries.map(async (query) => {
        const dataSnap = await getDocs(query);
        return dataSnap.docs.map((doc) => doc.data());
      })
    );
    return docs;
  }
  return null;
}
export class QueryWhere {
  field: string;
  operator: string;
  value: any;
  constructor(field: string, operator: string, value: any) {
    this.field = field;
    this.operator = operator;
    this.value = value;
  }
}
