import { useRouter } from "expo-router";

import type { AuthField } from "@/components/organisms/AuthForm";
import { AuthForm } from "@/components/organisms/AuthForm";
import { AuthScreenLayout } from "@/components/organisms/AuthScreenLayout";
import { useSession } from "@/contexts/SessionContext";

const loginFields: AuthField[] = [
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
];

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isSubmitting, error, clearError } = useSession();

  return (
    <AuthScreenLayout onBack={() => router.back()}>
      <AuthForm
        title="Welcome Back"
        subtitle="Log in to continue"
        fields={loginFields}
        submitLabel="Log In"
        footerPrefix="Don't have an account?"
        footerLinkLabel="Sign Up"
        onFooterPress={() => {
          clearError();
          router.push("/sign-up");
        }}
        onSubmit={async (values) => {
          await signIn(values.email.trim(), values.password);
          router.replace("/home");
        }}
        isLoading={isSubmitting}
        error={error}
      />
    </AuthScreenLayout>
  );
}
