import {

  collection,

  doc,

  addDoc,

  updateDoc,

  deleteDoc,

  getDocs,

  getDoc,

  onSnapshot,

  serverTimestamp,

  type Unsubscribe,

} from 'firebase/firestore';

import { db } from '../../firebase';

import { Property } from '../../types';



const PROPERTIES_COLLECTION = 'properties';



type PropertyDoc = Property & { createdAt?: unknown; updatedAt?: unknown };



const mapDocToProperty = (snapshot: { id: string; data: () => Record<string, unknown> }): PropertyDoc => {
  const data = snapshot.data();
  // Si los datos en la BD tienen un campo 'id' guardado por error (como 'prop-1'),
  // priorizamos el verdadero snapshot.id que Firebase generó.
  return {
    ...data,
    id: snapshot.id,
    // Conservamos el id original solo para relaciones, si es necesario.
    _originalId: data.id, 
  } as PropertyDoc;
};



const createdAtToMillis = (value: unknown): number => {

  if (value == null) return 0;

  if (typeof value === 'string') {

    const parsed = Date.parse(value);

    return Number.isNaN(parsed) ? 0 : parsed;

  }

  if (typeof value === 'object' && value !== null && 'toMillis' in value) {

    const toMillis = (value as { toMillis?: () => number }).toMillis;

    if (typeof toMillis === 'function') return toMillis.call(value);

  }

  return 0;

};



const sortPropertiesByCreatedAt = (properties: PropertyDoc[]): PropertyDoc[] =>

  [...properties].sort((a, b) => createdAtToMillis(b.createdAt) - createdAtToMillis(a.createdAt));



const fetchAllFromCollection = async (): Promise<PropertyDoc[]> => {
  const querySnapshot = await getDocs(collection(db, PROPERTIES_COLLECTION));
  
  // Deduplicamos por un "id original" si las properties semilla se subieron repetidas
  const docs = querySnapshot.docs.map(mapDocToProperty);
  const uniqueDocs = Array.from(new Map(docs.map(item => [item._originalId || item.id, item])).values());
  
  return sortPropertiesByCreatedAt(uniqueDocs);
};



export const propertyService = {

  async getAllProperties(): Promise<Property[]> {

    return fetchAllFromCollection();

  },



  subscribeToProperties(

    onData: (properties: Property[]) => void,

    onError?: (error: Error) => void

  ): Unsubscribe {

    return onSnapshot(
      collection(db, PROPERTIES_COLLECTION),
      (querySnapshot) => {
        const docs = querySnapshot.docs.map(mapDocToProperty);
        const uniqueDocs = Array.from(new Map(docs.map(item => [item._originalId || item.id, item])).values());
        const properties = sortPropertiesByCreatedAt(uniqueDocs);
        onData(properties);
      },

      (error) => {

        onError?.(error instanceof Error ? error : new Error(String(error)));

      }

    );

  },



  async getPropertyById(id: string): Promise<Property | null> {

    try {

      const docRef = doc(db, PROPERTIES_COLLECTION, id);

      const docSnap = await getDoc(docRef);



      if (docSnap.exists()) {

        return {

          id: docSnap.id,

          ...docSnap.data(),

        } as Property;

      }

      return null;

    } catch (error) {

      throw error;

    }

  },



  async addProperty(property: Omit<Property, 'id'>): Promise<string> {

    try {

      const cleanProperty = Object.fromEntries(

        Object.entries(property).filter(([_, value]) => value !== undefined)

      );



      const docRef = await addDoc(collection(db, PROPERTIES_COLLECTION), {

        ...cleanProperty,

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),

      });

      return docRef.id;

    } catch (error) {

      throw error;

    }

  },



  async updateProperty(id: string, property: Partial<Property>): Promise<void> {

    try {

      const { id: _docId, ...fields } = property;

      const cleanProperty = Object.fromEntries(

        Object.entries(fields).filter(([_, value]) => value !== undefined)

      );



      const docRef = doc(db, PROPERTIES_COLLECTION, id);

      await updateDoc(docRef, {

        ...cleanProperty,

        updatedAt: serverTimestamp(),

      });

    } catch (error) {

      throw error;

    }

  },



  async deleteProperty(id: string): Promise<void> {

    try {

      const docRef = doc(db, PROPERTIES_COLLECTION, id);

      await deleteDoc(docRef);

    } catch (error) {

      throw error;

    }

  },

};


