// render/pipeline-desc - render pipeline descriptors
// Part of Stardazed TX
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.render {

	export const enum BlendOperation {
		Add,
		Subtract,
		ReverseSubtract,
		Min,
		Max
	}


	export const enum BlendFactor {
		Zero,
		One,
		SourceColour,
		OneMinusSourceColour,
		DestColour,
		OneMinusDestColour,
		SourceAlpha,
		OneMinusSourceAlpha,
		SourceAlphaSaturated,
		DestAlpha,
		OneMinusDestAlpha,
		ConstantColour,
		OneMinusConstantColour,
		ConstantAlpha,
		OneMinusConstantAlpha
	}


	export interface ColourBlendingDescriptor {
		enabled: boolean;

		rgbBlendOp: BlendOperation;
		alphaBlendOp: BlendOperation;

		sourceRGBFactor: BlendFactor;
		sourceAlphaFactor: BlendFactor;
		destRGBFactor: BlendFactor;
		destAlphaFactor: BlendFactor;

		constantColour: Float4;
	}


	export interface ColourWriteMask {
		red: boolean;
		green: boolean;
		blue: boolean;
		alpha: boolean;
	}


	export type AttributeNameMap = Map<meshdata.VertexAttributeRole, string>;


	export interface PipelineDescriptor {
		writeMask: ColourWriteMask;
		depthMask: boolean;
		blending: ColourBlendingDescriptor;

		vertexShader?: WebGLShader;
		fragmentShader?: WebGLShader;

		attributeNames: AttributeNameMap;
	}


	export function makeColourBlendingDescriptor(): ColourBlendingDescriptor {
		return {
			enabled: false,

			rgbBlendOp: BlendOperation.Add,
			alphaBlendOp: BlendOperation.Add,

			sourceRGBFactor: BlendFactor.One,
			sourceAlphaFactor: BlendFactor.One,
			destRGBFactor: BlendFactor.Zero,
			destAlphaFactor: BlendFactor.Zero,

			constantColour: [0, 0, 0, 1]
		};
	}


	export function makeColourWriteMask(): ColourWriteMask {
		return {
			red: true,
			green: true,
			blue: true,
			alpha: true
		};
	}


	export function makePipelineDescriptor(): PipelineDescriptor {
		return {
			writeMask: makeColourWriteMask(),
			depthMask: true,
			blending: makeColourBlendingDescriptor(),

			attributeNames: new Map<meshdata.VertexAttributeRole, string>()
		};
	}

} // ns stardazed
