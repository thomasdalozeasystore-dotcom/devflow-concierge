// Use localhost for development, can be configured via environment
const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'http://localhost:5000'; // Update this for production

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
    companyName?: string;
    phone?: string;
}

export interface AuthResponse {
    success: boolean;
    user?: {
        id: number;
        username: string;
        email: string;
        created_at: string;
    };
    error?: string;
}

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: 'Network error. Please check your connection.',
        };
    }
}

export async function signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Signup error:', error);
        return {
            success: false,
            error: 'Network error. Please check your connection.',
        };
    }
}
