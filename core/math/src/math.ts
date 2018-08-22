/**
 * @stardazed/math - mathematical helper functions
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

/**
 * Clamp a number to the range min..max inclusive.
 */
export function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}

/**
 * Clamp a number to the range 0..1 inclusive.
 */
export function clamp01(n: number): number {
	return Math.max(0.0, Math.min(1.0, n));
}

/**
 * Linearly interpolate between a and b given a ratio.
 * If ratio < 0 or ratio > 1 then the value will be extrapolated.
 * 
 * @example mix(2, 4, 0) = 2
 * @example mix(2, 4, 1) = 4
 * @example mix(10, 20, 0.5) = 15
 * @example mix(10, 20, -1) = 0
 */
export function mix(a: number, b: number, ratio: number): number {
	return a * (1 - ratio) + b * ratio;
}

/**
 * Generate a pseudo-random integer value between 0 and maximum inclusive.
 * @param maximum The highest integer to include in the range, inclusive
 * @expects maximum >= 0
 */
export function intRandom(maximum: number): number {
	return (Math.random() * (maximum + 1)) | 0;
}

/**
 * Generate a pseudo-random integer value between mininum and maximum inclusive.
 * @param minimum The low end of the range, inclusive
 * @param maximum The high end of the range, inclusive
 * @expects maximum >= minimum
 */
export function intRandomRange(minimum: number, maximum: number): number {
	const diff = (maximum - minimum) | 0;
	return minimum + intRandom(diff);
}

/**
 * Convert a frequency expressed in hertz to seconds
 */
export function hertz(hz: number) {
	return 1 / hz;
}

/**
 * Convert an angle expressed in degrees to radians
 */
export function deg2rad(deg: number): number {
	return deg * Math.PI / 180.0;
}

/**
 * Convert an angle expressed in radians to degrees
 */
export function rad2deg(rad: number): number {
	return rad * 180.0 / Math.PI;
}

/**
 * Is the provided number an integer?
 */
export function isInteger(n: number) {
	return (n | 0) === n;
}

/**
 * Is the provided number a power of 2?
 */
export function isPowerOf2(n: number) {
	return (n & (n - 1)) === 0;
}

/**
 * Return closest powerOf2 number that is >= n
 * @example 15 -> 16; 16 -> 16; 17 -> 32
 */
export function roundUpPowerOf2(n: number) {
	if (n <= 0) { return 1; }
	n = (n | 0) - 1;
	n |= n >> 1;
	n |= n >> 2;
	n |= n >> 4;
	n |= n >> 8;
	n |= n >> 16;
	return n + 1;
}

/**
 * Round val up to closest multiple of alignmentPow2
 * @param val number to align up
 * @param alignmentPow2 power-of-2 alignment border that val will be rounded up towards
 * @expects {audit} isPowerOf2(alignmentPow2)
 */
export function alignUp(val: number, alignmentPow2: number) {
	return (val + alignmentPow2 - 1) & (~(alignmentPow2 - 1));
}

/**
 * Round val down to closest multiple of alignmentPow2
 * @param val number to align up
 * @param alignmentPow2 power-of-2 alignment border that val will be rounded down towards
 * @expects {audit} isPowerOf2(alignmentPow2)
 */
export function alignDown(val: number, alignmentPow2: number) {
	return val & (~(alignmentPow2 - 1));
}
