export interface Initializable {
  initialize(): Promise<void> | void;
}

export interface Destroyable {
  destroy(): Promise<void> | void;
}

export function isInitializable(value: unknown): value is Initializable {
  return !!value && typeof (value as unknown as { initialize?: () => Promise<void> | void }).initialize === 'function';
}

export function isDestroyable(value: unknown): value is Destroyable {
  return !!value && typeof (value as unknown as { destroy?: () => Promise<void> | void }).destroy === 'function';
}


