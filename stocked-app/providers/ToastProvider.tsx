import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { View, StyleSheet } from "react-native";

import { InAppToast } from "@/components/molecules/InAppToast";
import {
  subscribeToast,
  type ToastPayload,
} from "@/lib/toast";

type ToastProviderProps = {
  children: ReactNode;
};

type ActiveToast = {
  id: number;
  payload: ToastPayload;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const nextId = useRef(0);

  const dismiss = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    return subscribeToast((payload) => {
      nextId.current += 1;
      setToast({ id: nextId.current, payload });
    });
  }, []);

  return (
    <View style={styles.root}>
      {children}
      {toast ? (
        <InAppToast
          key={toast.id}
          toast={toast.payload}
          onDismiss={dismiss}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
