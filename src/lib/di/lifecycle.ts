export interface Initializable {
  initialize(): Promise<void> | void;
}

export interface Destroyable {
  destroy(): Promise<void> | void;
}

export function isInitializable(value: unknown): value is Initializable {
  return !!value && typeof (value as any).initialize === 'function';
}

export function isDestroyable(value: unknown): value is Destroyable {
  return !!value && typeof (value as any).destroy === 'function';
}


