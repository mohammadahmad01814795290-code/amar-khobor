// Firebase Console থেকে নিজের config কপি করে নিচের placeholder বদলান।
export const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};
export const firebaseReady = !Object.values(firebaseConfig).some(v =>
  String(v).includes("PASTE_") || String(v).includes("YOUR_PROJECT_ID")
);
