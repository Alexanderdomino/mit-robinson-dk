export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

export interface Environment {
  production: boolean;
  serviceWorker: boolean;
  adminEmail: string;
  firebaseConfig: FirebaseConfig;
  cloudinary?: {
    cloudName?: string;
    uploadPreset?: string;
  };
}