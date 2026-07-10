'use client';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/auth/authStore';
import ButtonLoader from '@/shared/components/ui/button/ButtonLoader';

const inputClass =
  'shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';

export default function LoginPage() {
  const router = useRouter();
  const authStore = useAuthStore();

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500">
            <span className="text-2xl font-bold text-white">R</span>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Sign in to Raco</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">E-commerce admin panel</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={Yup.object({
            email: Yup.string().email('Invalid email').required('Email is required'),
            password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const res = await authApi.login(values.email, values.password);
              authStore.setAuth(res.user, res.accessToken, res.refreshToken);
              toast.success('Login successful!');
              router.push('/admin/dashboard');
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Login failed');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Email
                </label>
                <Field name="email" type="email" className={inputClass} placeholder="admin@raco.com" />
                {errors.email && touched.email && (
                  <p className="mt-1 text-xs text-error-500">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Password
                </label>
                <Field name="password" type="password" className={inputClass} placeholder="Min 6 characters" />
                {errors.password && touched.password && (
                  <p className="mt-1 text-xs text-error-500">{errors.password}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 w-full rounded-lg py-2.5 text-sm font-medium text-white inline-flex items-center justify-center gap-2 transition-colors"
              >
                {isSubmitting && <ButtonLoader />}
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?{' '}
        <a href="/auth/register" className="font-medium text-brand-500 hover:text-brand-600">
          Sign up
        </a>
      </p>
    </div>
  );
}