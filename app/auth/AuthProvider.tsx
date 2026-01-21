import React, { createContext, useContext, useEffect, useState } from 'react';
import { apolloClient } from '../lib/apollo-client';
import { GetUsersDocument, GetUserDocument } from '../lib/graphql/generated';

type User = any;

type AuthContextValue = {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        try {
        const raw = localStorage.getItem('authUser');
        return raw ? JSON.parse(raw) : null;
        } catch {
        return null;
        }
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // persist user to localStorage
        if (user) localStorage.setItem('authUser', JSON.stringify(user));
        else localStorage.removeItem('authUser');
    }, [user]);

    useEffect(() => {
        // If we have a cached user (from localStorage) but missing fields like profileImg,
        // refresh that user's data from the server to ensure UI has up-to-date fields.
        const tryRefresh = async () => {
            if (user && user.id && !user.profileImg) {
                try {
                    const { data } = await apolloClient.query<any>({ query: GetUserDocument, variables: { id: user.id }, fetchPolicy: 'network-only' });
                    if (data?.user) {
                        setUser(data.user);
                    }
                } catch (err) {
                    // ignore refresh errors; keep existing user
                    console.debug('Failed to refresh auth user', err);
                }
            }
        };
        tryRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (username: string, password: string) => {
        setLoading(true);
        try {
        const { data } = await apolloClient.query<any>({
            query: GetUsersDocument,
            variables: { limit: 1000, offset: 0 },
            fetchPolicy: 'network-only',
        });
        const found = data?.users?.find((u: any) => u.username === username && u.password === password) || null;
        if (found) {
            setUser(found);
            // simple token for demo; replace with real token if backend supports it
            localStorage.setItem('authToken', found.id ?? username);
            return true;
        }
        return false;
        } catch (err) {
        console.error('Login error', err);
        return false;
        } finally {
        setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export default AuthProvider;
