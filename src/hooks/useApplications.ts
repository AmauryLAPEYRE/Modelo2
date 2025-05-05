// src/hooks/useApplications.ts
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import { Application } from '../types/models';

export const useApplications = (userId?: string, userRole?: 'model' | 'professional') => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !userRole) {
      setLoading(false);
      return;
    }

    let q;
    if (userRole === 'model') {
      q = query(collection(db, 'applications'), where('modelId', '==', userId));
      listenToApplications(q);
    } else {
      // Pour les professionnels, on récupère les services et ensuite les applications
      const fetchProfessionalApplications = async () => {
        const servicesQuery = query(collection(db, 'services'), where('professionalId', '==', userId));
        const servicesSnapshot = await getDocs(servicesQuery);
        const serviceIds = servicesSnapshot.docs.map(doc => doc.id);
        
        if (serviceIds.length > 0) {
          q = query(collection(db, 'applications'), where('serviceId', 'in', serviceIds));
          listenToApplications(q);
        } else {
          setApplications([]);
          setLoading(false);
        }
      };
      
      fetchProfessionalApplications();
      return;
    }
    
    listenToApplications(q);
  }, [userId, userRole]);

  const listenToApplications = (q: any) => {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const applicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Application[];
      
      setApplications(applicationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const applyToService = async (serviceId: string, modelId: string, message?: string) => {
    await addDoc(collection(db, 'applications'), {
      serviceId,
      modelId,
      status: 'pending',
      message,
      createdAt: new Date(),
    });
  };

  const updateApplicationStatus = async (id: string, status: Application['status']) => {
    const docRef = doc(db, 'applications', id);
    await updateDoc(docRef, { status });
  };

  const getApplication = async (id: string) => {
    const docRef = doc(db, 'applications', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
      } as Application;
    }
    return null;
  };

  return { applications, loading, applyToService, updateApplicationStatus, getApplication };
};