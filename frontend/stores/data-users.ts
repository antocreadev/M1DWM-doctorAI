import { create } from "zustand";

export interface User {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  date_naissance: Date;
  genre: string;
  adresse: string;
  ville: string;
  code_postal: string;
  telephone: string;
  profession: string;
  terms: boolean;
  data: boolean;
  antecedents?: string | null; 
  medicaments?: string | null;
  allergies?: string | null; 
}

interface BearState {
  user: User;
  updateUser: (newUser: User) => void;
}

export const useStore = create<BearState>((set) => ({
  user: {
    prenom: "",
    nom: "",
    email: "",
    password: "",
    date_naissance: new Date(),
    genre: "",
    adresse: "",
    ville: "",
    code_postal: "",
    telephone: "",
    profession: "",
    terms: false,
    data: false,
  },
  updateUser: (newUser) => set({ user: { ...newUser } }),
}));
