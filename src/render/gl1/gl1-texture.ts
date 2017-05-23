// render/gl1/texture - WebGL1 implementation of textures
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	import PixelFormat = image.PixelFormat;

	function gl1ImageFormatForPixelFormat(rd: GL1RenderDevice, format: PixelFormat) {
		switch (format) {
			case PixelFormat.R8:
			case PixelFormat.R16F:
			case PixelFormat.R32F:
				return GLConst.LUMINANCE;

			case PixelFormat.RG8:
			case PixelFormat.RG16F:
			case PixelFormat.RG32F:
				return GLConst.LUMINANCE_ALPHA;

			case PixelFormat.RGB8:
				return GLConst.RGB;
			case PixelFormat.RGBA8:
				return GLConst.RGBA;

			// sRGB -- silently fall back to standard RGB if not available (availability in browsers is ~100%)
			case PixelFormat.SRGB8:
				return rd.extSRGB ? GLConst.SRGB_EXT : GLConst.RGB;
			case PixelFormat.SRGB8_Alpha8:
				return rd.extSRGB ? GLConst.SRGB_ALPHA_EXT : GLConst.RGB;

			// Float
			case PixelFormat.RGBA16F:
				return rd.extTextureHalfFloat ? GLConst.RGBA : GLConst.NONE;
			case PixelFormat.RGBA32F:
				return GLConst.RGBA;

			// Packed
			case PixelFormat.RGB_5_6_5:
				return GLConst.RGB;
			case PixelFormat.RGBA_4_4_4_4:
			case PixelFormat.RGBA_5_5_5_1:
				return GLConst.RGBA;

			// Depth / Stencil
			case PixelFormat.Depth16I:
			case PixelFormat.Depth24I:
				return GLConst.DEPTH_COMPONENT;

			case PixelFormat.Stencil8:
				return GLConst.STENCIL_INDEX;

			case PixelFormat.Depth24_Stencil8:
				return GLConst.DEPTH_STENCIL;

			// S3TC
			case PixelFormat.RGB_DXT1:
				return rd.extS3TC ? GLConst.COMPRESSED_RGB_S3TC_DXT1_EXT : GLConst.NONE;
			case PixelFormat.RGBA_DXT1:
				return rd.extS3TC ? GLConst.COMPRESSED_RGBA_S3TC_DXT1_EXT : GLConst.NONE;
			case PixelFormat.RGBA_DXT3:
				return rd.extS3TC ? GLConst.COMPRESSED_RGBA_S3TC_DXT3_EXT : GLConst.NONE;
			case PixelFormat.RGBA_DXT5:
				return rd.extS3TC ? GLConst.COMPRESSED_RGBA_S3TC_DXT5_EXT : GLConst.NONE;

			default:
				assert(false, "GL1: unhandled pixel format");
				return GLConst.NONE;
		}
	}


	function gl1PixelDataTypeForPixelFormat(rd: GL1RenderDevice, format: PixelFormat) {
		if (image.pixelFormatIsCompressed(format)) {
			return GLConst.NONE;
		}

		switch (format) {
			case PixelFormat.R8:
			case PixelFormat.RG8:
			case PixelFormat.RGB8:
			case PixelFormat.RGBA8:
			case PixelFormat.Stencil8:
				return GLConst.UNSIGNED_BYTE;

			case PixelFormat.SRGB8:
			case PixelFormat.SRGB8_Alpha8:
				return GLConst.UNSIGNED_BYTE;

			case PixelFormat.RGB_5_6_5:
				return GLConst.UNSIGNED_SHORT_5_6_5;
			case PixelFormat.RGBA_4_4_4_4:
				return GLConst.UNSIGNED_SHORT_4_4_4_4;
			case PixelFormat.RGBA_5_5_5_1:
				return GLConst.UNSIGNED_SHORT_5_5_5_1;

			case PixelFormat.R16F:
			case PixelFormat.RG16F:
			case PixelFormat.RGB16F:
			case PixelFormat.RGBA16F:
				return rd.extTextureHalfFloat ? GLConst.HALF_FLOAT_OES : GLConst.NONE;

			case PixelFormat.R32F:
			case PixelFormat.RG32F:
			case PixelFormat.RGB32F:
			case PixelFormat.RGBA32F:
				return GLConst.FLOAT;

			case PixelFormat.Depth16I:
				return GLConst.UNSIGNED_SHORT;
			case PixelFormat.Depth24I:
				return GLConst.UNSIGNED_INT;

			case PixelFormat.Depth24_Stencil8:
				return rd.extDepthTexture ? GLConst.UNSIGNED_INT_24_8_WEBGL : GLConst.NONE;

			default:
				assert(false, "GL1: unsupported pixel format");
				return GLConst.NONE;
		}
	}


	function gl1TargetForTexture(texture: Texture) {
		if (texture.textureClass === TextureClass.Normal) {
			return GLConst.TEXTURE_2D;
		}

		return GLConst.TEXTURE_CUBE_MAP;
	}


	function gl1TextureRepeatMode(repeat: TextureRepeatMode) {
		switch (repeat) {
			case TextureRepeatMode.Repeat: return GLConst.REPEAT;
			case TextureRepeatMode.MirroredRepeat: return GLConst.MIRRORED_REPEAT;
			case TextureRepeatMode.ClampToEdge: return GLConst.CLAMP_TO_EDGE;

			default:
				assert(false, "GL1: unsupported TextureRepeatMode");
				return GLConst.NONE;
		}
	}


	function gl1TextureMinificationFilter(minFilter: TextureSizingFilter, mipFilter: TextureMipFilter) {
		let glSizingFilter: number;

		if (mipFilter === TextureMipFilter.None) {
			if (minFilter === TextureSizingFilter.Nearest) {
				glSizingFilter = GLConst.NEAREST;
			}
			else {
				glSizingFilter = GLConst.LINEAR;
			}
		}
		else if (mipFilter === TextureMipFilter.Nearest) {
			if (minFilter === TextureSizingFilter.Nearest) {
				glSizingFilter = GLConst.NEAREST_MIPMAP_NEAREST;
			}
			else {
				glSizingFilter = GLConst.LINEAR_MIPMAP_NEAREST;
			}
		}
		else {
			if (minFilter === TextureSizingFilter.Nearest) {
				glSizingFilter = GLConst.NEAREST_MIPMAP_LINEAR;
			}
			else {
				glSizingFilter = GLConst.LINEAR_MIPMAP_LINEAR;
			}
		}

		return glSizingFilter;
	}


	function gl1TextureMagnificationFilter(magFilter: TextureSizingFilter) {
		if (magFilter === TextureSizingFilter.Nearest) {
			return GLConst.NEAREST;
		}
		else {
			return GLConst.LINEAR;
		}
	}


	const textureLimits = {
		maxDimension: 0,
		maxDimensionCube: 0,
		maxAnisotropy: 0
	};


	function gl1MaxTextureDimension(rd: GL1RenderDevice, texClass: TextureClass) {
		if (textureLimits.maxDimension === 0) {
			textureLimits.maxDimension = rd.gl.getParameter(GLConst.MAX_TEXTURE_SIZE);
			textureLimits.maxDimensionCube = rd.gl.getParameter(GLConst.MAX_CUBE_MAP_TEXTURE_SIZE);
		}

		if (texClass === TextureClass.CubeMap) {
			return textureLimits.maxDimensionCube;
		}
		return textureLimits.maxDimension;
	}


	function gl1MaxAllowedAnisotropy(rd: GL1RenderDevice) {
		if (textureLimits.maxAnisotropy === 0) {
			textureLimits.maxAnisotropy =
				rd.extTexAnisotropy ?
				rd.gl.getParameter(rd.extTexAnisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT) :
				1;
		}

		return textureLimits.maxAnisotropy;
	}


	function gl1CalcMipLevels(texture: Texture, provider: image.PixelDataProvider | undefined) {
		if (texture.mipmapMode === MipMapMode.Strip) {
			return {
				providerMips: 1,
				generatedMips: 0
			};
		}

		const mipLimit = Math.min(texture.maxMipLevel || 255, maxMipLevelsForDimension(Math.max(texture.dim.width, texture.dim.height)));
		let providerMips = provider ? provider.mipMapCount : 1;
		let generatedMips = 0;

		if (texture.mipmapMode === MipMapMode.Source) {
			providerMips = Math.min(providerMips, mipLimit);
		}
		else {
			// mipmapMode === Regenerate
			providerMips = 1;
			generatedMips = mipLimit - 1;
		}

		// WebGL 1 disallows mipmaps on Non-Power-of-Two textures
		const npot = image.isNonPowerOfTwo(texture.dim);
		if (npot) {
			if (providerMips + generatedMips > 1) {
				console.warn("GL1: restricting NPOT texture to 1 mip", texture);
				providerMips = 1;
				generatedMips = 0;
			}
		}

		return { providerMips, generatedMips };
	}


	export function applySampler(rd: GL1RenderDevice, texture: Texture, sampler: Sampler) {
		const gl = rd.gl;
		const target = gl1TargetForTexture(texture);

		let { repeatS, repeatT, mipFilter } = sampler;

		// -- WebGL 1 imposes several restrictions on Non-Power-of-Two textures
		const npot = image.isNonPowerOfTwo(texture.dim);
		if (npot) {
			if (repeatS !== TextureRepeatMode.ClampToEdge || repeatT !== TextureRepeatMode.ClampToEdge) {
				console.warn("NPOT textures cannot repeat, overriding with ClampToEdge", texture);
				repeatS = TextureRepeatMode.ClampToEdge;
				repeatT = TextureRepeatMode.ClampToEdge;
			}
			if (mipFilter !== TextureMipFilter.None) {
				console.warn("NPOT textures cannot have mipmaps, overriding with MipFilter.None", texture);
				mipFilter = TextureMipFilter.None;
			}
		}

		// gl.bindTexture(target, this.resource_);

		// -- wrapping
		gl.texParameteri(target, GLConst.TEXTURE_WRAP_S, gl1TextureRepeatMode(repeatS));
		gl.texParameteri(target, GLConst.TEXTURE_WRAP_T, gl1TextureRepeatMode(repeatT));

		// -- mini-/magnification
		gl.texParameteri(target, GLConst.TEXTURE_MIN_FILTER, gl1TextureMinificationFilter(sampler.minFilter, mipFilter));
		gl.texParameteri(target, GLConst.TEXTURE_MAG_FILTER, gl1TextureMagnificationFilter(sampler.magFilter));

		// -- anisotropy
		if (rd.extTexAnisotropy) {
			const anisotropy = math.clamp(sampler.maxAnisotropy, 1, gl1MaxAllowedAnisotropy(rd));
			gl.texParameterf(target, rd.extTexAnisotropy.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy);
		}

		// rd.gl.bindTexture(target, null);
	}


	function allocTextureLayer(rd: GL1RenderDevice, texture: Texture, provider: image.PixelDataProvider | undefined, providerMips: number, target: number) {
		const gl = rd.gl;

		const { width, height } = texture.dim;
		const glTexPixelFormat = gl1ImageFormatForPixelFormat(rd, texture.pixelFormat);
		const glTexPixelType = gl1PixelDataTypeForPixelFormat(rd, texture.pixelFormat);

		if (image.pixelFormatIsCompressed(texture.pixelFormat)) {
			assert(provider !== undefined, "GL1: Compressed textures MUST provide pixelData");

			for (let mip = 0; mip < providerMips; ++mip) {
				const pixBuf = provider!.pixelBufferForLevel(mip)!;
				gl.compressedTexImage2D(target, mip, glTexPixelFormat, pixBuf.dim.width, pixBuf.dim.height, 0, pixBuf.data as ArrayBufferView);
			}
		}
		else {
			for (let mip = 0; mip < providerMips; ++mip) {
				const pixBuf = provider ? provider.pixelBufferForLevel(mip) : undefined;
				const pixData = pixBuf ? pixBuf.data : null;

				if ((pixData === null) || ("byteLength" in pixData)) {
					// either no data or raw pixel data
					gl.texImage2D(target, mip, glTexPixelFormat, pixBuf ? pixBuf.dim.width : width, pixBuf ? pixBuf.dim.height : height, 0, glTexPixelFormat, glTexPixelType, pixData as (ArrayBufferView | null));
				} 
				else {
					// a TexImageSource was provided
					const tis = pixData as TextureImageSource;
					assert((tis.width === width) && (tis.height === height), "GL1: imageSource's size does not match descriptor");
					gl.texImage2D(target, mip, glTexPixelFormat, glTexPixelFormat, glTexPixelType, tis);
				}
			}
		}
	}


	function createPlainTexture(rd: GL1RenderDevice, texture: Texture) {
		const gl = rd.gl;
		const pixelData = texture.pixelData;

		// -- input checks
		assert((pixelData == null) || (pixelData.length === 1), "GL1: Normal pixelData array must contain 1 item or be omitted completely.");

		// -- create resource
		const tex = gl.createTexture()!; // TODO: handle resource allocation failure
		const target = GLConst.TEXTURE_2D;
		gl.bindTexture(target, tex);

		// -- allocate and fill pixel storage
		const provider = pixelData && pixelData[0];
		const { providerMips, generatedMips } = gl1CalcMipLevels(texture, provider);
		allocTextureLayer(rd, texture, provider, providerMips, target);

		// -- generate mipmaps if requested
		if (generatedMips > 0) {
			gl.generateMipmap(target);
		}

		gl.bindTexture(target, null);
		return tex;
	}


	function createCubeMapTexture(rd: GL1RenderDevice, texture: Texture) {
		const gl = rd.gl;
		const pixelData = texture.pixelData;

		// -- input checks
		const { width, height } = texture.dim;
		assert(width === height, "GL1: TexCube textures MUST have the same width and height");
		assert((pixelData == null) || (pixelData.length === 6), "GL1: CubeMap pixelData array must contain 6 items or be omitted completely.");

		// -- create resource
		const tex = gl.createTexture()!; // TODO: handle resource allocation failure
		const target = GLConst.TEXTURE_CUBE_MAP;
		gl.bindTexture(target, tex);

		// -- allocate and fill pixel storage
		let shouldGenMips = false;
		for (let layer = 0; layer < 6; ++layer) {
			const provider = pixelData && pixelData[layer];
			const { providerMips, generatedMips } = gl1CalcMipLevels(texture, provider);
			if (generatedMips > 0) {
				shouldGenMips = true;
			}
			allocTextureLayer(rd, texture, provider, providerMips, GLConst.TEXTURE_CUBE_MAP_POSITIVE_X + layer);
		}

		// -- generate mipmaps if requested
		if (shouldGenMips) {
			gl.generateMipmap(target);
		}

		gl.bindTexture(target, null);
		return tex;
	}

	export interface GL1TextureData {
		texture: WebGLTexture;
		target: GLConst.TEXTURE_2D | GLConst.TEXTURE_CUBE_MAP;
		format: image.PixelFormat;
		linkedSamplerIndex: number;
	}

	export function createTexture(rd: GL1RenderDevice, texture: Texture): GL1TextureData {
		// -- general validity checks
		assert(texture.dim.width > 0);
		assert(texture.dim.height > 0);
		assert(texture.dim.depth === 1); // GL1 does not support 3D textures
		assert(texture.layers === undefined || texture.layers === 1); // GL1 only supports single-layer textures

		assert(texture.dim.width <= gl1MaxTextureDimension(rd, texture.textureClass));
		assert(texture.dim.height <= gl1MaxTextureDimension(rd, texture.textureClass));

		let glTex: WebGLTexture;
		if (texture.textureClass === TextureClass.CubeMap) {
			glTex = createCubeMapTexture(rd, texture);
		}
		glTex = createPlainTexture(rd, texture);

		return {
			texture: glTex,
			target: gl1TargetForTexture(texture),
			format: texture.pixelFormat,
			linkedSamplerIndex: 0
		};
	}

} // ns sd.render.gl1
