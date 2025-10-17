import { Environment } from "./environment.interface";

export const environment: Environment = {
  production: false,
  serviceWorker: true,
  adminEmail: '',
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  }
  ,
  cloudinary: {
    cloudName: '',
    uploadPreset: ''
  }
};