// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ArrayExt {
	export function resize<T>(
		arr: T[],
		length: number,
		fillValue: T | undefined = undefined,
	): T[] {
		if (length < arr.length) {
			arr.length = length;
		} else if (length > arr.length) {
			arr.push(...Array(length - arr.length).fill(fillValue));
		}
		return arr;
	}
}
