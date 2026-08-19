import {
  FIREBASE_CONFIG, CONTENT_COLLECTION, SDK_VERSION, isConfigured,
} from "./firebase-config.js?v=124";

/**
 * Everything that talks to Firebase. The rest of the site never imports the
 * SDK — it goes through js/store.js, which goes through here.
 *
 * The SDK is fetched from the CDN only once a project is actually configured,
 * so an unconfigured site makes no network calls and carries no dead weight.
 * Every function below is a no-op that resolves quietly when there is no
 * project, which is what lets store.js call them unconditionally.
 *
 * Shape in Firestore: one document per content collection, keyed by its name,
 * holding { data, updatedAt }. `data` is the whole array (or, for `copy`, the
 * whole object) rather than a document per record. The catalogue is a few
 * dozen small items — far inside the 1MB document limit — and a single
 * document means a save is atomic and a snapshot is one read.
 */

const CDN = (module) =>
  `https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-${module}.js`;

let ready = null;

/** Loads the SDK and signs in nobody. Cached, so concurrent callers share it. */
function connect() {
  if (!isConfigured()) return Promise.resolve(null);
  if (ready) return ready;

  ready = (async () => {
    const [appMod, dbMod, authMod] = await Promise.all([
      import(CDN("app")),
      import(CDN("firestore")),
      import(CDN("auth")),
    ]);
    const app = appMod.initializeApp(FIREBASE_CONFIG);
    return { app, db: dbMod.getFirestore(app), auth: authMod.getAuth(app), dbMod, authMod };
  })().catch((error) => {
    // A blocked CDN or a bad config must not take the site down: the local
    // content is still perfectly serviceable.
    console.warn("cloud: Firebase unavailable, staying local —", error.message);
    ready = null;
    return null;
  });

  return ready;
}

export const cloudEnabled = () => isConfigured();

/* -------------------------------------------------------------------- read */

/**
 * Watches every content document and calls back with (name, data) on each
 * change, including the first load. Returns an unsubscribe function.
 */
export async function watchContent(onDoc, onError) {
  const fb = await connect();
  if (!fb) return () => {};
  const { db, dbMod } = fb;
  return dbMod.onSnapshot(
    dbMod.collection(db, CONTENT_COLLECTION),
    (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === "removed") { onDoc(change.doc.id, null); return; }
        const payload = change.doc.data();
        if (payload && "data" in payload) onDoc(change.doc.id, payload.data);
      });
    },
    (error) => {
      // Almost always a rules problem; say so rather than failing silently.
      console.warn("cloud: content listener stopped —", error.message);
      onError?.(error);
    }
  );
}

/* ------------------------------------------------------------------- write */

export async function pushCollection(name, data) {
  const fb = await connect();
  if (!fb) return false;
  const { db, dbMod } = fb;
  await dbMod.setDoc(dbMod.doc(db, CONTENT_COLLECTION, name), {
    data,
    updatedAt: dbMod.serverTimestamp(),
  });
  return true;
}

export async function removeCollection(name) {
  const fb = await connect();
  if (!fb) return false;
  const { db, dbMod } = fb;
  await dbMod.deleteDoc(dbMod.doc(db, CONTENT_COLLECTION, name));
  return true;
}

/* -------------------------------------------------------------------- auth */

/**
 * Firestore rules let anyone read and only a signed-in user write, so the admin
 * signs in with a real Firebase account. The password box in the admin is a
 * client-side gate and never was security — anyone can read the source. This
 * is the part that actually stops a stranger rewriting the catalogue.
 */
export async function signIn(email, password) {
  const fb = await connect();
  if (!fb) throw new Error("Firebase is not configured");
  const { auth, authMod } = fb;
  const credential = await authMod.signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOutAdmin() {
  const fb = await connect();
  if (!fb) return;
  await fb.authMod.signOut(fb.auth);
}

/** Calls back with the user (or null) now and on every change. */
export async function watchAuth(onChange) {
  const fb = await connect();
  if (!fb) { onChange(null); return () => {}; }
  return fb.authMod.onAuthStateChanged(fb.auth, onChange);
}
