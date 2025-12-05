import { useState } from 'react';
import { ClientInfo } from '../types';
import { Button } from './Button';
import { login, signup } from '../services/authService';

interface UserFormProps {
    onSubmit: (info: ClientInfo) => void;
}

export default function UserForm({ onSubmit }: UserFormProps) {
    const [isLoginMode, setIsLoginMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companyName: '',
        phone: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLoginMode) {
                // Login mode
                const response = await login({
                    email: formData.email,
                    password: formData.password
                });

                if (response.success && response.user) {
                    onSubmit({
                        id: response.user.id,
                        name: response.user.username,
                        email: response.user.email,
                        companyName: formData.companyName,
                        phone: formData.phone
                    });
                } else {
                    setError(response.error || 'Login failed');
                }
            } else {
                // Signup mode
                const response = await signup({
                    username: formData.name,
                    email: formData.email,
                    password: formData.password,
                    companyName: formData.companyName,
                    phone: formData.phone
                });

                if (response.success && response.user) {
                    onSubmit({
                        id: response.user.id,
                        name: response.user.username,
                        email: response.user.email,
                        companyName: formData.companyName,
                        phone: formData.phone
                    });
                } else {
                    setError(response.error || 'Signup failed');
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
        // Clear error when user starts typing
        if (error) setError(null);
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                        ET
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        {isLoginMode ? 'Welcome Back' : 'Welcome to Easy Tech'}
                    </h2>
                    <p className="text-slate-500 mt-2">
                        {isLoginMode ? 'Sign in to your account' : 'Please tell us a bit about yourself'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLoginMode && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            placeholder="john@company.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {!isLoginMode && (
                        <>
                            <div>
                                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">
                                    Company Name
                                </label>
                                <input
                                    id="companyName"
                                    type="text"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                    placeholder="Acme Inc."
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                    placeholder="+1 (555) 000-0000"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full mt-6 py-2.5 text-base"
                        isLoading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoginMode ? 'Sign In' : 'Continue'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLoginMode(!isLoginMode);
                            setError(null);
                        }}
                        className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
                    >
                        {isLoginMode ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
}
