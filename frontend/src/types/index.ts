export type RoomType = 'COMMUNE' | 'PRIVEE';

export type Room = {
  id: number;
  nom: string;
  icone: string;
  type: RoomType;
  pinRelais: number;
  pinInterrupteur: number;
  etat: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Role = 'ADMIN' | 'MEMBRE';

export type PiecePermission = {
  id: number;
  userId: number;
  acces: boolean;
  createdAt: string;
  room: Room;
};

export type User = {
  id: number;
  nom: string;
  codeAcces: string;
  role: Role;
  dateCreation: string;
  dateExpiration: string | null;
  isActive: boolean;
  permissions: PiecePermission[];
};

export type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
};

export type Sortie = 'jour' | 'nuit' | 'soir';
