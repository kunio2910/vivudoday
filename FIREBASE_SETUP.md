# Firebase setup for Vi Vu Đó Đây

The website uses Cloud Firestore for landmark data and Google sign-in for the management page.

1. In Firebase Console, enable Firestore Database.
2. In Authentication → Sign-in providers, enable Google.
3. In Authentication → Settings → Authorized domains, add `kunio2910.github.io`.
4. Create a `landmarks` collection. Each document ID is the landmark `id`.
5. Copy `firestore.rules` into Firestore Rules and replace `YOUR_ADMIN_EMAIL@example.com` with the administrator's Google email.
6. Open `/admin.html`, choose “Đăng nhập Google”, then save a landmark.

The public map queries only documents where `published == true`. The Firebase web configuration in `dist/firebase-config.js` is client configuration; never commit service-account JSON or private keys.
