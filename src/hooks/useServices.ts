// src/hooks/useServices.ts
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Service } from '../types/models';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'services'), where('status', '==', 'published'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Service[];
      
      setServices(servicesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createService = async (data: Omit<Service, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, 'services'), {
      ...data,
      createdAt: new Date(),
    });
  };

  const getService = async (id: string) => {
    const docRef = doc(db, 'services', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
      } as Service;
    }
    return null;
  };

  const updateServiceStatus = async (id: string, status: Service['status']) => {
    const docRef = doc(db, 'services', id);
    await updateDoc(docRef, { status });
  };

  return { services, loading, createService, getService, updateServiceStatus };
};