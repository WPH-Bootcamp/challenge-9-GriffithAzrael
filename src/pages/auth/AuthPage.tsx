// src/pages/auth/AuthPage.tsx
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import heroImage from '@/assets/login-and-signup-image.png';
import logo from '@/assets/logo-1.svg';
import showPasswordIcon from '@/assets/show-password.svg';
import hidePasswordIcon from '@/assets/hide-password.svg';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  login,
  register,
  type LoginRequest,
  type RegisterRequest,
  type AuthResponse,
} from '@/services/api/auth';

import { useAppDispatch, useAppSelector } from '@/features/hooks';
import {
  loginOptimistic,
  restoreAuthState,
  setAuthError,
  setAuthSuccess,
  type AuthState,
} from '@/features/auth/authSlice';

// Keys for localStorage
const LOCAL_TOKEN_KEY = 'accessToken';
const LOCAL_USER_KEY = 'authUser';
const LOCAL_CREDENTIALS_KEY = 'authCredentials';

// ---------- Zod Schemas ----------

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi.')
    .email('Format email tidak valid.'),
  password: z.string().min(6, 'Password minimal 6 karakter.'),
  rememberMe: z.boolean().default(true),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const registerSchema = z
  .object({
    name: z.string().min(1, 'Nama wajib diisi.'),
    email: z
      .string()
      .min(1, 'Email wajib diisi.')
      .email('Format email tidak valid.'),
    phoneNumber: z.string().min(1, 'Nomor telepon wajib diisi.'),
    password: z.string().min(6, 'Password minimal 6 karakter.'),
    confirmPassword: z
      .string()
      .min(6, 'Konfirmasi password minimal 6 karakter.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password tidak sama.',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

type TabValue = 'signin' | 'signup';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('signin');

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // ---------- React Hook Form ----------

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Prefill login form dari localStorage credentials
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(LOCAL_CREDENTIALS_KEY);
      if (!raw) return;
      const creds = JSON.parse(raw) as {
        email?: string;
        password?: string;
      };
      loginForm.reset({
        email: creds.email ?? '',
        password: creds.password ?? '',
        rememberMe: true,
      });
    } catch {
      // ignore parse error
    }
  }, [loginForm]);

  // ---------- Mutations ----------

  // LOGIN dengan optimistic UI
  const loginMutation = useMutation<
    AuthResponse,
    any,
    LoginFormValues,
    { previousAuth: AuthState }
  >({
    mutationFn: async (values) => {
      const payload: LoginRequest = {
        email: values.email,
        password: values.password,
      };
      return login(payload);
    },
    onMutate: async (variables) => {
      setLoginError(null);
      const previousAuth = authState;

      // Optimistic: anggap user sudah login (tanpa detail)
      dispatch(loginOptimistic({ email: variables.email }));

      return { previousAuth };
    },
    onError: (error, _variables, context) => {
      if (context?.previousAuth) {
        dispatch(restoreAuthState(context.previousAuth));
      }

      const message =
        error?.response?.data?.message ??
        error?.message ??
        'Login gagal. Silakan coba lagi.';
      setLoginError(message);
      dispatch(setAuthError(message));
    },
    onSuccess: (data, variables) => {
      const { token, user } = data;

      // Simpan ke localStorage untuk login berikutnya
      localStorage.setItem(LOCAL_TOKEN_KEY, token);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      localStorage.setItem(
        LOCAL_CREDENTIALS_KEY,
        JSON.stringify({
          email: variables.email,
          password: variables.password,
          name: user.name,
          phone: user.phoneNumber,
        }),
      );

      dispatch(
        setAuthSuccess({
          token,
          user,
        }),
      );

      // Redirect ke homepage
      navigate('/');
    },
  });

  // REGISTER
  const registerMutation = useMutation<AuthResponse, any, RegisterFormValues>({
    mutationFn: (values) => {
      const payload: RegisterRequest = {
        name: values.name,
        email: values.email,
        phone: values.phoneNumber,
        password: values.password,
      };
      return register(payload);
    },
    onMutate: async () => {
      setRegisterError(null);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        'Register gagal. Silakan coba lagi.';
      setRegisterError(message);
    },
    onSuccess: (data, variables) => {
      const { token, user } = data;

      // Simpan token, user, dan credential ke localStorage
      localStorage.setItem(LOCAL_TOKEN_KEY, token);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      localStorage.setItem(
        LOCAL_CREDENTIALS_KEY,
        JSON.stringify({
          email: variables.email,
          password: variables.password,
          name: variables.name,
          phone: variables.phoneNumber,
        }),
      );

      dispatch(
        setAuthSuccess({
          token,
          user,
        }),
      );

      // Redirect langsung ke homepage (auto login)
      navigate('/');
    },
  });

  // ---------- Submit Handlers ----------

  const handleSubmitLogin = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const handleSubmitRegister = (values: RegisterFormValues) => {
    registerMutation.mutate(values);
  };

  // ---------- Render ----------

  return (
    <div className="flex h-screen font-['Nunito',system-ui,sans-serif]">
      {/* Left image */}
      <div className="hidden w-1/2 md:block">
        <img
          src={heroImage}
          alt="Food illustration"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right form */}
      <div className="flex w-full items-center justify-center px-6 md:w-1/2">
        <Card className="w-full max-w-86.25 md:max-w-93.5 border-none shadow-none">
          <CardContent className="p-0">
            <div className="flex flex-col gap-6 text-left">
              {/* Header logo + text */}
              <div className="flex flex-col gap-4">
                <div className="flex">
                  <img src={logo} alt="Foody logo" className="h-8 md:h-9" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-extrabold text-neutral-950 md:text-[28px]">
                    Welcome Back
                  </h1>
                  <p className="text-sm text-neutral-950 md:text-base">
                    Good to see you again! Let's eat
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as TabValue)}
                className="flex flex-col gap-4 md:gap-5"
              >
                <TabsList className="inline-flex h-12 w-full items-center justify-between rounded-2xl bg-[#F5F5F5] p-2 gap-2">
                  <TabsTrigger
                    value="signin"
                    className="flex-1 h-8 rounded-lg md:rounded-xl bg-transparent text-sm md:text-base font-medium text-neutral-500 data-[state=active]:bg-white data-[state=active]:font-bold data-[state=active]:text-neutral-950 data-[state=active]:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                  >
                    Sign in
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="flex-1 h-8 rounded-lg md:rounded-xl bg-transparent text-sm md:text-base font-medium text-neutral-500 data-[state=active]:bg-white data-[state=active]:font-bold data-[state=active]:text-neutral-950 data-[state=active]:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                  >
                    Sign up
                  </TabsTrigger>
                </TabsList>

                {/* Sign in */}
                <TabsContent value="signin" className="mt-0">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(handleSubmitLogin)}
                      className="flex flex-col gap-4 md:gap-5"
                    >
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="sr-only">Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="Email"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="sr-only">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showLoginPassword ? 'text' : 'password'}
                                  placeholder="Password"
                                  className="pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowLoginPassword((prev) => !prev)
                                  }
                                  className="absolute inset-y-0 right-3 flex items-center"
                                >
                                  <img
                                    src={
                                      showLoginPassword
                                        ? hidePasswordIcon
                                        : showPasswordIcon
                                    }
                                    alt={
                                      showLoginPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                    }
                                    className="h-5 w-5"
                                  />
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <Label className="text-sm font-normal text-neutral-700">
                              Remember Me
                            </Label>
                          </FormItem>
                        )}
                      />

                      {loginError && (
                        <p className="text-sm text-red-500">{loginError}</p>
                      )}

                      <Button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="h-11 rounded-full bg-[#C12116] text-base font-semibold text-white hover:bg-[#a91b11]"
                      >
                        {loginMutation.isPending ? 'Logging in...' : 'Login'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Sign up */}
                <TabsContent value="signup" className="mt-0">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(handleSubmitRegister)}
                      className="flex flex-col gap-4 md:gap-5"
                    >
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="sr-only">Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Name"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="sr-only">Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="Email"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="sr-only">
                              Number Phone
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="tel"
                                placeholder="Number Phone"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="sr-only">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={
                                    showRegisterPassword ? 'text' : 'password'
                                  }
                                  placeholder="Password"
                                  className="pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowRegisterPassword((prev) => !prev)
                                  }
                                  className="absolute inset-y-0 right-3 flex items-center"
                                >
                                  <img
                                    src={
                                      showRegisterPassword
                                        ? hidePasswordIcon
                                        : showPasswordIcon
                                    }
                                    alt={
                                      showRegisterPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                    }
                                    className="h-5 w-5"
                                  />
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="sr-only">
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={
                                    showConfirmPassword ? 'text' : 'password'
                                  }
                                  placeholder="Confirm Password"
                                  className="pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowConfirmPassword((prev) => !prev)
                                  }
                                  className="absolute inset-y-0 right-3 flex items-center"
                                >
                                  <img
                                    src={
                                      showConfirmPassword
                                        ? hidePasswordIcon
                                        : showPasswordIcon
                                    }
                                    alt={
                                      showConfirmPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                    }
                                    className="h-5 w-5"
                                  />
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      {registerError && (
                        <p className="text-sm text-red-500">
                          {registerError}
                        </p>
                      )}

                      <Button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="h-11 rounded-full bg-[#C12116] text-base font-semibold text-white hover:bg-[#a91b11]"
                      >
                        {registerMutation.isPending
                          ? 'Registering...'
                          : 'Register'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;