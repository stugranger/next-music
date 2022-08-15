export const andThen = <A, B>(map: (value: A) => B | Promise<B>) => (promise: Promise<A>): Promise<B> => promise.then(map);
