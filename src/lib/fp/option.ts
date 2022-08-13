export type Option<T> = Some<T> | None;

export interface Some<T> {
	tag: 'Some';
	value: T;
}

export interface None {
	tag: 'None'
}

const some = <T>(value: T): Option<T> => ({ tag: 'Some', value });

const none = (): Option<never> => ({ tag: 'None' });

const isSome = <T>(option: Option<T>): option is Some<T> => option.tag === 'Some';

const match = <T, R>(from: { some: (value: T) => R, none: () => R }) => (option: Option<T>): R =>
	isSome(option) ? from.some(option.value) : from.none();

export const Option = {
	some,
	match,
	none
};
