export function pipe<T, A>(fn1: (value: T) => A): (value: T) => A;
export function pipe<T, A, B>(
	fn1: (value: T) => A,
	fn2: (value: A) => B
): (value: T) => B
export function pipe<T, A, B, C>(
	fn1: (value: T) => A,
	fn2: (value: A) => B,
	fn3: (value: B) => C
): (value: T) => C
export function pipe<T, A, B, C, D>(
	fn1: (value: T) => A,
	fn2: (value: A) => B,
	fn3: (value: B) => C,
	fn4: (value: C) => D
): (value: T) => D
export function pipe<T, A, B, C, D, E>(
	fn1: (value: T) => A,
	fn2: (value: A) => B,
	fn3: (value: B) => C,
	fn4: (value: C) => D,
	fn5: (value: D) => E,
): (value: T) => E
export function pipe(...fns: Array<(value: any) => any>) {
	return (value: any) => fns.reduce<any>((result, fn) => fn(result), value)
}
