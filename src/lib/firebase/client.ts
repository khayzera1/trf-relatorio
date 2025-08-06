
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
    Firestore,
    where,
    limit,
    setDoc,
    getDoc,
    Timestamp,
} from 'firebase/firestore';
import type { ClientData, ClientDataInput, BoardData } from '@/lib/types';

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

// Firestore Collections
const clientsCollection = collection(db, 'clients');
const kanbanBoardsCollection = collection(db, 'kanbanBoards');


// --- Client Management Functions ---

export async function addClient(client: ClientDataInput): Promise<string> {
    try {
        const docRef = await addDoc(clientsCollection, {
            ...client,
            createdAt: Timestamp.now(), 
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Could not add client to the database.");
    }
}

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

export async function updateClient(id: string, clientName: string): Promise<void> {
    try {
        const clientDoc = doc(db, 'clients', id);
        await updateDoc(clientDoc, { clientName });
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error("Could not update client in the database.");
    }
}

export async function deleteClient(id: string): Promise<void> {
    try {
        const clientDoc = doc(db, 'clients', id);
        await deleteDoc(clientDoc);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Could not delete client from the database.");
    }
}


// --- Kanban Board Functions ---

/**
 * Creates a default board for a new user.
 * @param userId - The ID of the user.
 * @param defaultData - The initial board data.
 * @returns The created board data.
 */
export async function createDefaultBoard(userId: string, defaultData: BoardData): Promise<BoardData> {
    const boardWithUser = { ...defaultData, userId, createdAt: Timestamp.now() };
    const boardDocRef = doc(kanbanBoardsCollection, boardWithUser.id);
    await setDoc(boardDocRef, boardWithUser);
    return boardWithUser;
}

/**
 * Fetches the Kanban board for a given user.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the user's board data or null if not found.
 */
export async function getBoardForUser(userId: string): Promise<BoardData | null> {
    const q = query(kanbanBoardsCollection, where("userId", "==", userId), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }
    
    const boardDoc = querySnapshot.docs[0];
    return { id: boardDoc.id, ...boardDoc.data() } as BoardData;
}

/**
 * Updates an existing Kanban board in Firestore.
 * @param userId - The ID of the user who owns the board.
 * @param boardId - The ID of the board to update.
 * @param data - The new data for the board.
 */
export async function updateBoard(userId: string, boardId: string, data: Partial<BoardData>): Promise<void> {
    // Ensure the data being saved is associated with the correct user, just in case.
    const boardDocRef = doc(db, 'kanbanBoards', boardId);
    await updateDoc(boardDocRef, { ...data, userId, updatedAt: Timestamp.now() });
}


// --- Exports ---

export { 
    auth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut
};
export type { User };
