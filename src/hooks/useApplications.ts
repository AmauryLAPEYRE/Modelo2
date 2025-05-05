// src/hooks/useApplications.ts
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  getDoc, 
  getDocs,
  DocumentSnapshot,
  QuerySnapshot,
  FirestoreError,
  Query,
  Timestamp
} from 'firebase/firestore';
import { Application } from '../types/models';

interface ApplicationData {
  serviceId: string;
  modelId: string;
  status: Application['status'];
  message?: string;
  createdAt: Timestamp;
}

// Fonction pour vérifier si une candidature existe déjà
export const checkIfAlreadyApplied = async (serviceId: string, modelId: string): Promise<boolean> => {
  const q = query(
    collection(db, 'applications'),
    where('serviceId', '==', serviceId),
    where('modelId', '==', modelId)
  );
  
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// Fonction pour obtenir une candidature existante
export const getExistingApplication = async (serviceId: string, modelId: string): Promise<Application | null> => {
  const q = query(
    collection(db, 'applications'),
    where('serviceId', '==', serviceId),
    where('modelId', '==', modelId)
  );
  
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docData = snapshot.docs[0].data() as ApplicationData;
    return {
      id: snapshot.docs[0].id,
      serviceId: docData.serviceId,
      modelId: docData.modelId,
      status: docData.status,
      message: docData.message,
      createdAt: docData.createdAt.toDate(),
    };
  }
  
  return null;
};

export const useApplications = (userId?: string, userRole?: 'model' | 'professional') => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !userRole) {
      setLoading(false);
      return;
    }

    let q: Query<ApplicationData> | undefined;
    
    if (userRole === 'model') {
      q = query(collection(db, 'applications'), where('modelId', '==', userId)) as Query<ApplicationData>;
      listenToApplications(q);
    } else {
      const fetchProfessionalApplications = async () => {
        const servicesQuery = query(collection(db, 'services'), where('professionalId', '==', userId));
        const servicesSnapshot = await getDocs(servicesQuery);
        const serviceIds = servicesSnapshot.docs.map(doc => doc.id);
        
        if (serviceIds.length > 0) {
          q = query(collection(db, 'applications'), where('serviceId', 'in', serviceIds)) as Query<ApplicationData>;
          listenToApplications(q);
        } else {
          setApplications([]);
          setLoading(false);
        }
      };
      
      fetchProfessionalApplications();
      return;
    }
    
    listenToApplications(q!);
  }, [userId, userRole]);

  const listenToApplications = (q: Query<ApplicationData>) => {
    const unsubscribe = onSnapshot(
      q, 
      (snapshot: QuerySnapshot<ApplicationData>) => {
        const applicationsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            serviceId: data.serviceId,
            modelId: data.modelId,
            status: data.status,
            message: data.message,
            createdAt: data.createdAt.toDate(),
          } as Application;
        });
        
        setApplications(applicationsData);
        setLoading(false);
      },
      (error: FirestoreError) => {
        console.error('Error fetching applications:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  };

  const applyToService = async (serviceId: string, modelId: string, message?: string) => {
    // Vérifiez d'abord si une candidature existe déjà
    const alreadyApplied = await checkIfAlreadyApplied(serviceId, modelId);
    
    if (alreadyApplied) {
      throw new Error('Vous avez déjà postulé à cette prestation');
    }

    // Prépare l'objet de candidature en excluant message si undefined
    const applicationData = {
      serviceId,
      modelId,
      status: 'pending' as const,
      createdAt: Timestamp.now(),
      ...(message && { message })
    };

    await addDoc(collection(db, 'applications'), applicationData);
  };

  const updateApplicationStatus = async (id: string, status: Application['status']) => {
    const docRef = doc(db, 'applications', id);
    await updateDoc(docRef, { status });
  };

  const getApplication = async (id: string) => {
    const docRef = doc(db, 'applications', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as ApplicationData;
      return {
        id: docSnap.id,
        serviceId: data.serviceId,
        modelId: data.modelId,
        status: data.status,
        message: data.message,
        createdAt: data.createdAt.toDate(),
      };
    }
    return null;
  };

  return { applications, loading, applyToService, updateApplicationStatus, getApplication };
};