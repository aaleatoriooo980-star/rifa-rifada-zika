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
