import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore, collection, doc, getDocs, query, setDoc, serverTimestamp, where } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const app = initializeApp(window.VIVU_FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

function asPlace(snapshot) {
  const data = snapshot.data();
  const coordinates = data.coordinates || {};
  const position = data.position || {};
  return {
    id: snapshot.id,
    name: data.name || '',
    provinceId: data.provinceId || '',
    province: data.province || '',
    region: data.region || '',
    category: data.category || '',
    categoryKey: data.categoryKey || 'nature',
    coordinates: { latitude: Number(coordinates.latitude), longitude: Number(coordinates.longitude) },
    position: { left: Number(position.left), top: Number(position.top) },
    short: data.short || '',
    description: data.description || '',
    season: data.season || '',
    image: data.image || '',
    imageAlt: data.imageAlt || data.name || '',
    credit: data.credit || '',
    tags: Array.isArray(data.tags) ? data.tags : String(data.tags || '').split(',').map(tag => tag.trim()).filter(Boolean),
    managed: true,
    published: data.published !== false
  };
}

async function loadPublishedPlaces() {
  const placesQuery = query(collection(db, 'landmarks'), where('published', '==', true));
  const snapshot = await getDocs(placesQuery);
  return snapshot.docs.map(asPlace);
}

async function savePlace(place) {
  if (!auth.currentUser) throw Error('Bạn cần đăng nhập Google trước khi lưu Firebase.');
  await setDoc(doc(db, 'landmarks', place.id), {
    name: place.name,
    provinceId: place.provinceId || '',
    province: place.province,
    region: place.region,
    category: place.category,
    categoryKey: place.categoryKey,
    coordinates: place.coordinates,
    position: place.position,
    short: place.short,
    description: place.description,
    season: place.season,
    image: place.image,
    imageAlt: place.imageAlt,
    credit: place.credit || '',
    tags: place.tags,
    published: true,
    updatedAt: serverTimestamp(),
    updatedBy: auth.currentUser.email || ''
  }, { merge: true });
}

const api = {
  app, auth, db,
  get currentUser() { return auth.currentUser; },
  onAuthChanged: callback => onAuthStateChanged(auth, callback),
  signIn: () => signInWithPopup(auth, provider),
  signOut: () => signOut(auth),
  loadPublishedPlaces,
  savePlace,
  async refreshPlaces() {
    const remote = await loadPublishedPlaces();
    if (window.PlaceStore) window.PlaceStore.replaceRemote(remote);
    window.dispatchEvent(new CustomEvent('vivu:places-ready', { detail: { count: remote.length } }));
    return remote;
  }
};

window.VivuFirebase = api;
window.VivuFirebaseReady = (async () => {
  if (!window.PlaceStore) await new Promise(resolve => addEventListener('vivu:store-ready', resolve, { once: true }));
  try {
    await api.refreshPlaces();
  } catch (error) {
    api.lastError = error;
    window.dispatchEvent(new CustomEvent('vivu:firebase-error', { detail: error }));
  }
  return api;
})();
