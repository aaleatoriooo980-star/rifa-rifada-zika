import type { User } from "@/lib/types";

export const mockUsers: User[] = [
  {
    id: "u-admin",
    name: "Administrador",
    email: "admin@rifas.com",
    password: "123456",
    role: "admin",
  },
  {
    id: "u-joao",
    name: "João Silva",
    email: "joao@email.com",
    password: "123456",
    role: "cliente",
    cpf: "123.456.789-00",
    phone: "(11) 99999-9999",
  },
];
