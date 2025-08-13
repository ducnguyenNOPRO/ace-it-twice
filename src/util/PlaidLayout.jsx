import { AccountProvider } from "../contexts/AccountContext";
import { TransactionProvider } from "../contexts/TransactionContext";

export default function PlaidLayout({ children }) {
    return (
        <AccountProvider>
            <TransactionProvider>
                {children}
            </TransactionProvider>
        </AccountProvider>
    )
}