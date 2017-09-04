// image/provider - providers and buffers
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.image {

	export const enum ColourSpace {
		sRGB,
		Linear
	}

	export interface PixelCoordinate {
		x: number;
		y: number;
	}

	export function makePixelCoordinate(x: number, y: number): PixelCoordinate {
		return { x, y };
	}

	export interface PixelDimensions {
		width: number;
		height: number;
		depth: number;
	}

	export function makePixelDimensions(width: number, height = 1, depth = 1): PixelDimensions {
		return { width, height, depth };
	}

	export function dimensionAtMipLevel(dim: number, level: number) {
		return Math.max(1, (dim | 0) >> (level | 0));
	}

	export function isNonPowerOfTwo(dim: PixelDimensions) {
		return !(math.isPowerOf2(dim.width) && math.isPowerOf2(dim.height));
	}


	export function dataSizeBytesForPixelFormatAndDimensions(format: PixelFormat, dim: PixelDimensions) {
		const elementSize = pixelFormatBytesPerElement(format);
		let columns = dim.width;
		let rows = dim.height;

		if (pixelFormatIsCompressed(format)) {
			// DXT 1, 3, 5
			columns = ((dim.width + 3) >> 2);
			rows    = ((dim.height + 3) >> 2);
		}

		return dim.depth * rows * columns * elementSize;
	}


	export interface PixelBuffer {
		readonly pixelFormat: PixelFormat;
		readonly colourSpace: ColourSpace;
		readonly dim: Readonly<PixelDimensions>;
		readonly data: TextureImageData;
	}

	export function pixelBufferBytesPerRow(pb: PixelBuffer) {
		return dataSizeBytesForPixelFormatAndDimensions(pb.pixelFormat, makePixelDimensions(pb.dim.width));
	}

	export function pixelBufferRequiredRowAlignment(pb: PixelBuffer) {
		const rowBytes = pixelBufferBytesPerRow(pb);
		return Math.min(8, rowBytes & -rowBytes);
	}

	export function pixelBufferBytesPerLayer(pb: PixelBuffer) {
		return dataSizeBytesForPixelFormatAndDimensions(pb.pixelFormat, makePixelDimensions(pb.dim.width, pb.dim.height));
	}

	export function pixelBufferSizeBytes(pb: PixelBuffer) {
		return dataSizeBytesForPixelFormatAndDimensions(pb.pixelFormat, pb.dim);
	}


	export interface PixelDataProvider {
		readonly pixelFormat: PixelFormat;
		readonly colourSpace: ColourSpace;
		readonly dim: Readonly<PixelDimensions>;
		readonly mipMapCount: number;

		pixelBufferForLevel(level: number): PixelBuffer | undefined;
	}

	export interface PixelDataProviderClass {
		new (...args: any[]): PixelDataProvider;
	}

	export function providerForSingleBuffer(buffer: PixelBuffer): PixelDataProvider {
		return {
			pixelFormat: buffer.pixelFormat,
			colourSpace: buffer.colourSpace,
			dim: buffer.dim,
			mipMapCount: 1,
			pixelBufferForLevel: (level) => level === 0 ? buffer : undefined
		};
	}

} // ns sd.image
