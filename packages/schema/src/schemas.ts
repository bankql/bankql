import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  createdAt: z.coerce.date(),
});

export const AccountSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1),
  balance: z.number(),
  currency: z.string().length(3),
  createdAt: z.coerce.date(),
});

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  amount: z.number(),
  description: z.string(),
  occurredAt: z.coerce.date(),
});
