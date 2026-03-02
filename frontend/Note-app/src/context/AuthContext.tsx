import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { AuthContextType, User } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isInitializing, setIsInitializing] = useState<boolean>(true);

    useEffect(() => {
        // On mount, check if there is a valid HttpOnly cookie session
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch("/api/auth/me");
                if (response.ok) {
                    const userData = await response.json();
                    setCurrentUser(userData);
                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("Failed to fetch current user", error);
                setCurrentUser(null);
            } finally {
                setIsInitializing(false);
            }
        };

        fetchCurrentUser();
    }, []);

    const login = (user: User) => {
        setCurrentUser(user);
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
            console.error("Logout failed:", error);
        }
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, isInitializing }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
