import { Account } from "@prisma/client"

export interface CreateAccountReturn {
    success: true,
    account: Omit<Account, 'secretKey'> & {
        secretKey?: string
    }
}
