
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, Auth, User } from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc,
    query,
    orderBy,
    Firestore
} from 'firebase/firestore';
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject,
    FirebaseStorage
} from "firebase/storage";
import type { ClientData, ClientDataInput } from '@/lib/types';

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "data-exporter-b59ih",
  "appId": "1:783413603123:web:e4b5f3c6b164e974d06c46",
  "storageBucket": "data-exporter-b59ih.appspot.com",
  "apiKey": "AIzaSyAv-V2apXjSLB8HIFoi9hPXgfEX4y9g5eo",
  "authDomain": "data-exporter-b59ih.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "783413603123"
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

const clientsCollection = collection(db, 'clients');

/**
 * Adds a new client to the Firestore database.
 * @param client - The client data to add.
 * @returns The ID of the newly created document.
 */
export async function addClient(client: ClientDataInput): Promise<string> {
    try {
        const docRef = await addDoc(clientsCollection, {
            ...client,
            createdAt: new Date(), // Add a timestamp for sorting
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Could not add client to the database.");
    }
}

/**
 * Fetches all clients from the Firestore database, ordered by creation date.
 * @returns A promise that resolves to an array of clients.
 */
export async function getClients(): Promise<ClientData[]> {
    try {
        const q = query(clientsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const clients: ClientData[] = [];
        querySnapshot.forEach((doc) => {
            clients.push({ id: doc.id, ...doc.data() } as ClientData);
        });
        return clients;
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw new Error("Could not fetch clients from the database.");
    }
}

/**
 * Updates an existing client's data in Firestore.
 * @param id - The ID of the client document to update.
 * @param clientName - The new name for the client.
 */
export async function updateClient(id: string, clientName: string): Promise<void> {
    try {
        const clientDoc = doc(db, 'clients', id);
        await updateDoc(clientDoc, { clientName });
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error("Could not update client in the database.");
    }
}

/**
 * Deletes a client from the Firestore database.
 * @param id - The ID of the client document to delete.
 */
export async function deleteClient(id: string): Promise<void> {
    try {
        const clientDoc = doc(db, 'clients', id);
        await deleteDoc(clientDoc);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Could not delete client from the database.");
    }
}

export { 
    auth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut,
    storage, // Export storage instance
    ref, 
    uploadBytes, 
    getDownloadURL,
    deleteObject
};
export type { User };
