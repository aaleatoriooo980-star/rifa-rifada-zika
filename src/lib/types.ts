export type Role = "admin" | "cliente";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  cpf?: string;
  phone?: string;
  notificationsEnabled?: boolean;
}

export type RifaStatus = "ativa" | "encerrada" | "cancelada";

export interface RifaPackage {
  id: string;
  quantity: number;
  price: number;
  description?: string;
}

export interface Rifa {
  id: string;
  title: string;
  description: string;
  prize: string;
  prizes?: string[];
  pricePerNumber: number;
  totalNumbers: number;
  image: string;
  status: RifaStatus;
  archived?: boolean;
  createdAt: string;
  drawDate?: string;
  winnerNumber?: number;
  winnerUserId?: string;
  packages?: RifaPackage[];
  /** History of generated videos for this rifa's draws */
  drawVideos?: DrawVideo[];
}

export type NumberStatus = "disponivel" | "aguardando" | "vendido";

export interface RifaNumber {
  rifaId: string;
  number: number;
  status: NumberStatus;
  userId?: string;
  orderId?: string;
}

export type PaymentStatus = "pendente" | "pago" | "cancelado";

export interface Order {
  id: string;
  rifaId: string;
  userId: string;
  numbers: number[];
  total: number;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
}

export interface Draw {
  id: string;
  rifaId: string;
  winnerNumber: number;
  winnerUserId?: string;
  winnerName?: string;
  drawnAt: string;
}

/** Metadata about a generated draw video (the blob itself is downloaded, not stored). */
export interface DrawVideo {
  id: string;
  rifaId: string;
  drawId: string;
  filename: string;
  sizeBytes: number;
  createdAt: string;
  /** mp4 for Chrome/Firefox/Android, png for Safari iOS */
  format: "mp4" | "png";
}
