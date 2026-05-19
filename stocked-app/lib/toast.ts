export type ToastPayload = {
  title: string;
  body: string;
};

type ToastListener = (payload: ToastPayload) => void;

const listeners = new Set<ToastListener>();

export function showToast(payload: ToastPayload): void {
  for (const listener of listeners) {
    listener(payload);
  }
}

export function subscribeToast(listener: ToastListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
