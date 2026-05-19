import { useRouter } from "expo-router";

import type { AuthField } from "@/components/organisms/AuthForm";
import { AuthForm } from "@/components/organisms/AuthForm";
import { AuthScreenLayout } from "@/components/organisms/AuthScreenLayout";
import { useSession } from "@/contexts/SessionContext";

const signUpFields: AuthField[] = [
  {
    key: "email",
    label: "Email",
    placeholder: "you@example.com",
    keyboardType: "email-address",
  },
  {
    key: "password",
    label: "Password",
    placeholder: "••••••••",
    secureTextEntry: true,
  },
  {
    key: "confirmPassword",
    label: "Confirm Password",
    placeholder: "••••••••",
    secureTextEntry: true,
  },
];

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, isSubmitting, error, clearError } = useSession();

  return (
    <AuthScreenLayout onBack={() => router.back()}>
      <AuthForm
        title="Create Account"
        subtitle="Sign up to get started"
        fields={signUpFields}
        submitLabel="Sign Up"
        footerPrefix="Already have an account?"
        footerLinkLabel="Log In"
        onFooterPress={() => {
          clearError();
          router.push("/login");
        }}
        onSubmit={async (values) => {
          await signUp(values.email.trim(), values.password);
          router.replace("/home");
        }}
        isLoading={isSubmitting}
        error={error}
        requirePasswordMatch
      />
    </AuthScreenLayout>
  );
}
