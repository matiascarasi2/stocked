import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { Button } from "@/components/atoms/Button";
import { AppText } from "@/components/atoms/AppText";
import { FormField } from "@/components/molecules/FormField";
import { AuthFooterLink } from "@/components/molecules/AuthFooterLink";
import { ScreenHeading } from "@/components/molecules/ScreenHeading";
import { colors, spacing } from "@/constants/theme";

export type AuthField = {
  key: string;
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
};

type AuthFormProps = {
  title: string;
  subtitle: string;
  fields: AuthField[];
  submitLabel: string;
  footerPrefix: string;
  footerLinkLabel: string;
  onFooterPress: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  requirePasswordMatch?: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthForm({
  title,
  subtitle,
  fields,
  submitLabel,
  footerPrefix,
  footerLinkLabel,
  onFooterPress,
  onSubmit,
  isLoading = false,
  error = null,
  requirePasswordMatch = false,
}: AuthFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.key, ""])),
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const updateField = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setValidationError(null);
  };

  const validate = (): string | null => {
    const email = values.email?.trim() ?? "";
    const password = values.password ?? "";

    if (!email || !EMAIL_PATTERN.test(email)) {
      return "A valid email is required";
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (requirePasswordMatch && values.password !== values.confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  };

  const handleSubmit = async () => {
    const message = validate();
    if (message) {
      setValidationError(message);
      return;
    }

    setValidationError(null);
    await onSubmit(values);
  };

  const displayError = validationError ?? error;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "android" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <ScreenHeading title={title} subtitle={subtitle} />

          <View style={styles.fields}>
            {fields.map((field) => (
              <FormField
                key={field.key}
                label={field.label}
                placeholder={field.placeholder}
                value={values[field.key]}
                onChangeText={(text) => updateField(field.key, text)}
                secureTextEntry={field.secureTextEntry}
                keyboardType={field.keyboardType}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            ))}
          </View>

          <View style={styles.actions}>
            {displayError ? (
              <AppText variant="footer" color={colors.primary} center>
                {displayError}
              </AppText>
            ) : null}
            <Button
              label={submitLabel}
              onPress={() => void handleSubmit()}
              disabled={isLoading}
              style={isLoading ? styles.buttonDisabled : undefined}
            />
            <AuthFooterLink
              prefix={footerPrefix}
              linkLabel={footerLinkLabel}
              onPress={onFooterPress}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  form: {
    gap: spacing.sectionGap,
  },
  fields: {
    gap: spacing.fieldGap,
  },
  actions: {
    gap: spacing.fieldGap,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
