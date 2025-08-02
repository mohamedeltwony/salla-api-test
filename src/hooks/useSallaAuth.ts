// React Hooks for Salla Authentication

import { useState, useEffect, useCallback, useContext } from 'react';
import {
  sallaAuthService,
  AuthTokens,
  UserProfile,
  SocialLoginRequest,
  TwoFactorAuthRequest,
  UpdateProfileRequest,
} from '../services/salla/auth';
import {
  SallaLoginRequest,
  SallaRegisterRequest,
  SallaResetPasswordRequest,
  SallaChangePasswordRequest,
  SallaVerifyEmailRequest,
  handleSallaError,
} from '../services/salla';

// Auth state interface
interface AuthState {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

// Main authentication hook
interface UseSallaAuthReturn extends AuthState {
  // Authentication actions
  login: (credentials: SallaLoginRequest) => Promise<void>;
  register: (userData: SallaRegisterRequest) => Promise<void>;
  socialLogin: (socialData: SocialLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  
  // Password management
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (resetData: SallaResetPasswordRequest) => Promise<void>;
  changePassword: (passwordData: SallaChangePasswordRequest) => Promise<void>;
  
  // Email verification
  verifyEmail: (verificationData: SallaVerifyEmailRequest) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  
  // Two-factor authentication
  enableTwoFactor: () => Promise<any>;
  disableTwoFactor: (twoFactorData: TwoFactorAuthRequest) => Promise<void>;
  verifyTwoFactor: (twoFactorData: TwoFactorAuthRequest) => Promise<void>;
  
  // Profile management
  updateProfile: (profileData: UpdateProfileRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  
  // Session management
  checkSession: () => Promise<boolean>;
  extendSession: () => Promise<boolean>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export function useSallaAuth(): UseSallaAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
  });
  
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from storage
  const initializeAuth = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const tokens = sallaAuthService.getTokens();
      const user = sallaAuthService.getUserProfileFromStorage();
      const isAuthenticated = sallaAuthService.isAuthenticated();
      
      if (isAuthenticated && tokens) {
        // Verify session is still valid
        const sessionValid = await sallaAuthService.checkSession();
        
        if (sessionValid) {
          setAuthState({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        } else {
          // Session invalid, clear state
          setAuthState({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          });
        }
      } else {
        setAuthState({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch (err: any) {
      console.error('Auth initialization failed:', err);
      setAuthState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  }, []);

  // Authentication actions
  const login = useCallback(async (credentials: SallaLoginRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    
    try {
      const response = await sallaAuthService.login(credentials);
      
      if (response.success && response.data) {
        const tokens = sallaAuthService.getTokens();
        const user = response.data.user;
        
        setAuthState({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error(errorMessage);
    }
  }, []);

  const register = useCallback(async (userData: SallaRegisterRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    
    try {
      const response = await sallaAuthService.register(userData);
      
      if (response.success && response.data) {
        const tokens = sallaAuthService.getTokens();
        const user = response.data.user;
        
        setAuthState({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error(errorMessage);
    }
  }, []);

  const socialLogin = useCallback(async (socialData: SocialLoginRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    
    try {
      const response = await sallaAuthService.socialLogin(socialData);
      
      if (response.success && response.data) {
        const tokens = sallaAuthService.getTokens();
        const user = response.data.user;
        
        setAuthState({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        throw new Error(response.message || 'Social login failed');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error(errorMessage);
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    
    try {
      await sallaAuthService.logout();
    } catch (err: any) {
      // Log error but don't throw - we still want to clear local state
      console.error('Logout API call failed:', err);
    } finally {
      // Always clear local state
      setAuthState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  }, []);

  // Password management
  const requestPasswordReset = useCallback(async (email: string) => {
    setError(null);
    
    try {
      const response = await sallaAuthService.requestPasswordReset(email);
      
      if (!response.success) {
        throw new Error(response.message || 'Password reset request failed');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const resetPassword = useCallback(async (resetData: SallaResetPasswordRequest) => {
    setError(null);
    
    try {
      const response = await sallaAuthService.resetPassword(resetData);
      
      if (!response.success) {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const changePassword = useCallback(async (passwordData: SallaChangePasswordRequest) => {
    setError(null);
    
    try {
      const response = await sallaAuthService.changePassword(passwordData);
      
      if (!response.success) {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Email verification
  const verifyEmail = useCallback(async (verificationData: SallaVerifyEmailRequest) => {
    setError(null);
    
    try {
      const response = await sallaAuthService.verifyEmail(verificationData);
      
      if (!response.success) {
        throw new Error(response.message || 'Email verification failed');
      }
      
      // Refresh user profile after email verification
      await refreshProfile();
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    setError(null);
    
    try {
      const response = await sallaAuthService.resendVerificationEmail();
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to resend verification email');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Two-factor authentication
  const enableTwoFactor = useCallback(async () => {
    setError(null);
    
    try {
      const response = await sallaAuthService.enableTwoFactor();
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to enable two-factor authentication');
      }
      
      return response.data;
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const disableTwoFactor = useCallback(async (twoFactorData: TwoFactorAuthRequest) => {
    setError(null);
    
    try {
      const response = await sallaAuthService.disableTwoFactor(twoFactorData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to disable two-factor authentication');
      }
      
      // Refresh user profile
      await refreshProfile();
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const verifyTwoFactor = useCallback(async (twoFactorData: TwoFactorAuthRequest) => {
    setError(null);
    
    try {
      const response = await sallaAuthService.verifyTwoFactor(twoFactorData);
      
      if (!response.success) {
        throw new Error(response.message || 'Two-factor authentication verification failed');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Profile management
  const updateProfile = useCallback(async (profileData: UpdateProfileRequest) => {
    setError(null);
    
    try {
      const response = await sallaAuthService.updateUserProfile(profileData);
      
      if (response.success && response.data) {
        setAuthState(prev => ({
          ...prev,
          user: response.data,
        }));
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!authState.isAuthenticated) return;
    
    try {
      const response = await sallaAuthService.getUserProfile();
      
      if (response.success && response.data) {
        setAuthState(prev => ({
          ...prev,
          user: response.data,
        }));
      }
    } catch (err: any) {
      console.error('Failed to refresh profile:', err);
      // Don't throw error for profile refresh failures
    }
  }, [authState.isAuthenticated]);

  const deleteAccount = useCallback(async () => {
    setError(null);
    
    try {
      const response = await sallaAuthService.deleteAccount();
      
      if (response.success) {
        // Clear auth state after successful account deletion
        setAuthState({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        throw new Error(response.message || 'Account deletion failed');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Session management
  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const isValid = await sallaAuthService.checkSession();
      
      if (!isValid && authState.isAuthenticated) {
        // Session is invalid, clear auth state
        setAuthState({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }
      
      return isValid;
    } catch (err: any) {
      console.error('Session check failed:', err);
      return false;
    }
  }, [authState.isAuthenticated]);

  const extendSession = useCallback(async (): Promise<boolean> => {
    try {
      const extended = await sallaAuthService.extendSession();
      
      if (extended) {
        const tokens = sallaAuthService.getTokens();
        setAuthState(prev => ({
          ...prev,
          tokens,
        }));
      }
      
      return extended;
    } catch (err: any) {
      console.error('Session extension failed:', err);
      return false;
    }
  }, []);

  // Error handling
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Auto-refresh session periodically
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.tokens) return;

    const interval = setInterval(async () => {
      try {
        await checkSession();
      } catch (err) {
        console.error('Periodic session check failed:', err);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, authState.tokens, checkSession]);

  return {
    // State
    ...authState,
    error,
    
    // Authentication actions
    login,
    register,
    socialLogin,
    logout,
    
    // Password management
    requestPasswordReset,
    resetPassword,
    changePassword,
    
    // Email verification
    verifyEmail,
    resendVerificationEmail,
    
    // Two-factor authentication
    enableTwoFactor,
    disableTwoFactor,
    verifyTwoFactor,
    
    // Profile management
    updateProfile,
    refreshProfile,
    deleteAccount,
    
    // Session management
    checkSession,
    extendSession,
    
    // Error handling
    clearError,
  };
}

// Simplified hooks for specific use cases
export function useSallaUser() {
  const { user, isAuthenticated, isLoading, refreshProfile } = useSallaAuth();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    refreshProfile,
  };
}

export function useSallaSession() {
  const { isAuthenticated, isLoading, isInitialized, checkSession, extendSession } = useSallaAuth();
  
  return {
    isAuthenticated,
    isLoading,
    isInitialized,
    checkSession,
    extendSession,
  };
}

export function useSallaLogin() {
  const { login, register, socialLogin, logout, isLoading, error, clearError } = useSallaAuth();
  
  return {
    login,
    register,
    socialLogin,
    logout,
    isLoading,
    error,
    clearError,
  };
}