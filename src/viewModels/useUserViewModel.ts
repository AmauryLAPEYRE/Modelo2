// src/viewModels/useUserViewModel.ts
import { create } from 'zustand';
import { getDocument, queryDocuments, updateDocument } from '../../src/services/firebase/firestore';
import { User } from '../domain/models/UserModel';

interface UserState {
  users: Record<string, User>; // Cache des utilisateurs par ID
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchUserById: (id: string) => Promise<User | null>;
  fetchUsersByIds: (ids: string[]) => Promise<Record<string, User>>;
  searchUsers: (query: string, role?: 'model' | 'professional') => Promise<User[]>;
  updateUser: (id: string, data: Partial<User>) => Promise<User>;
  clearError: () => void;
}

export const useUserViewModel = create<UserState>((set, get) => ({
  users: {},
  isLoading: false,
  error: null,

  fetchUserById: async (id) => {
    const state = get();
    
    // Vérifier si l'utilisateur est déjà en cache
    if (state.users[id]) {
      return state.users[id];
    }
    
    set({ isLoading: true, error: null });
    try {
      const user = await getDocument<User>('users', id);
      
      if (user) {
        set(prev => ({
          users: { ...prev.users, [id]: user }
        }));
      }
      
      return user;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUsersByIds: async (ids) => {
    const state = get();
    const usersToFetch = ids.filter(id => !state.users[id]);
    
    if (usersToFetch.length === 0) {
      // Retourner les utilisateurs en cache
      return ids.reduce((acc, id) => {
        if (state.users[id]) {
          acc[id] = state.users[id];
        }
        return acc;
      }, {} as Record<string, User>);
    }
    
    set({ isLoading: true, error: null });
    try {
      const users: Record<string, User> = {};
      
      // Récupérer les utilisateurs manquants
      for (const id of usersToFetch) {
        const user = await getDocument<User>('users', id);
        if (user) {
          users[id] = user;
        }
      }
      
      // Fusionner avec le cache existant
      set(prev => ({
        users: { ...prev.users, ...users }
      }));
      
      // Retourner tous les utilisateurs demandés
      return ids.reduce((acc, id) => {
        const user = state.users[id] || users[id];
        if (user) {
          acc[id] = user;
        }
        return acc;
      }, {} as Record<string, User>);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  searchUsers: async (query, role) => {
    set({ isLoading: true, error: null });
    try {
      const constraints = [];
      
      if (role) {
        constraints.push({
          field: 'role',
          operator: '==',
          value: role
        });
      }
      
      // Récupérer tous les utilisateurs correspondant au rôle
      let users = await queryDocuments<User>('users', constraints);
      
      // Filtrer par requête de recherche
      const queryLower = query.toLowerCase();
      users = users.filter(user => 
        user.displayName.toLowerCase().includes(queryLower) ||
        user.email.toLowerCase().includes(queryLower) ||
        (user.bio && user.bio.toLowerCase().includes(queryLower))
      );
      
      // Mettre à jour le cache
      set(prev => {
        const newUsers = { ...prev.users };
        users.forEach(user => {
          newUsers[user.id] = user;
        });
        return { users: newUsers };
      });
      
      return users;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await updateDocument<User>('users', id, data);
      
      // Mettre à jour le cache
      set(prev => ({
        users: { ...prev.users, [id]: updatedUser }
      }));
      
      return updatedUser;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Utilitaire pour créer un hook personnalisé avec optimisation
export const useUserData = (userId: string | undefined) => {
  const { fetchUserById, users, isLoading, error } = useUserViewModel();
  const [user, setUser] = React.useState<User | null>(null);
  
  React.useEffect(() => {
    if (!userId) return;
    
    const loadUser = async () => {
      try {
        const fetchedUser = await fetchUserById(userId);
        setUser(fetchedUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    // Vérifier si l'utilisateur est en cache
    if (users[userId]) {
      setUser(users[userId]);
    } else {
      loadUser();
    }
  }, [userId, users]);
  
  return { user, isLoading, error };
};

// Utilitaire pour créer un hook de recherche d'utilisateurs avec debounce
export const useUserSearch = (debounceMs: number = 300) => {
  const { searchUsers, isLoading, error } = useUserViewModel();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<User[]>([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
  
  // Debounce pour la recherche
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);
  
  // Effectuer la recherche quand le terme debounced change
  React.useEffect(() => {
    if (!debouncedSearchTerm) {
      setSearchResults([]);
      return;
    }
    
    const performSearch = async () => {
      try {
        const results = await searchUsers(debouncedSearchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      }
    };
    
    performSearch();
  }, [debouncedSearchTerm]);
  
  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isLoading,
    error,
  };
};