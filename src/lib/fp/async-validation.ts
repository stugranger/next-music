import { Validation } from './validation';

export type AsyncValidation<E, A> = Promise<Validation<E, A>>;

const match = <E, A, R>(from: { invalid: (errors: E[]) => R, valid: (value: A) => R }) => (asyncValidation: AsyncValidation<E, A>): Promise<R> =>
	asyncValidation.then(Validation.match(from));

export const AsyncValidation = {
	match
};
