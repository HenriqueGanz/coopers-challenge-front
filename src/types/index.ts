import { z } from 'zod';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Todo {
  id: string;
  text: string;
  isDone: boolean;
  position: number;
  userId: string;
  createdAt: string;
}

export interface CarouselPost {
  id: string;
  title: string;
  imageUrl: string;
  imageAlt?: string;
  body: string;
  position: number;
}

/* ---------- Zod schemas (espelhando nas regras do backend) ---------- */

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

export const resetPasswordFormSchema = z.object({
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string().min(8, 'Confirme a senha'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas devem coincidir',
  path: ['confirmPassword'],
});

export const createTodoSchema = z.object({
  text: z.string().min(1, 'Tarefa não pode ser vazia'),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  telephone: z.string().min(10, 'O telefone deve ter no minimo 10 números').max(11, 'O telefone deve ter no máximo 11 números'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type ContactInput = z.infer<typeof contactSchema>;

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface ReorderItem {
  id: string;
  position: number;
  isDone: boolean;
}

export interface PatchTodoInput {
  text?: string;
  isDone?: boolean;
}
