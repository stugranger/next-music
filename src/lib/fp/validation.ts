import { Option } from './option';

export type Validation<E, A> = Invalid<E> | Valid<A>;

interface Invalid<E> {
	errors: E[];
	tag: 'Invalid';
}

interface Valid<A> {
	tag: 'Valid';
	value: A;
}

const invalid = <E>(errors: E | E[]): Validation<E, never> => ({
	errors: Array.isArray(errors) ? errors : [errors],
	tag: 'Invalid'
});

const valid = <A>(value: A): Validation<never, A> => ({ tag: 'Valid', value });

const isValid = <E, A>(validation: Validation<E, A>): validation is Valid<A> => validation.tag === 'Valid';

const flatMap = <F, A, B>(map: (value: A) => Validation<F, B>) => <E>(validation: Validation<E, A>): Validation<E | F, B> =>
	isValid(validation) ? map(validation.value) : validation;

const map = <A, B>(map: (value: A) => B) => <E>(validation: Validation<E, A>): Validation<E, B> =>
	isValid(validation) ? valid(map(validation.value)) : validation;

const match = <E, A, R>(from: { invalid: (errors: E[]) => R, valid: (value: A) => R }) => (validation: Validation<E, A>) =>
	isValid(validation) ? from.valid(validation.value) : from.invalid(validation.errors);

const traversePromise = <A, B>(map: (value: A) => Promise<B>) => <E>(validation: Validation<E, A>): Promise<Validation<E, B>> =>
	isValid(validation) ? map(validation.value).then(valid) : Promise.resolve(validation);

export const Validation = {
	flatMap,
	invalid,
	map,
	match,
	traversePromise,
	valid
};
