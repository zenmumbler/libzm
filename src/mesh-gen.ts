// mesh-gen.ts - mesh generators
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="mesh.ts" />

namespace sd.mesh.gen {

	//  __  __        _    ___                       _           
	// |  \/  |___ __| |_ / __|___ _ _  ___ _ _ __ _| |_ ___ _ _ 
	// | |\/| / -_|_-< ' \ (_ / -_) ' \/ -_) '_/ _` |  _/ _ \ '_|
	// |_|  |_\___/__/_||_\___\___|_||_\___|_| \__,_|\__\___/_|  
	//                                                          

	export type PositionAddFn = (x: number, y: number, z: number) => void;
	export type FaceAddFn = (a: number, b: number, c: number) => void;
	export type UVAddFn = (u: number, v: number) => void;

	export abstract class MeshGenerator {
		abstract vertexCount(): number;
		abstract faceCount(): number;

		abstract generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn): void;

		generate(attrList?: VertexAttribute[]): MeshData {
			if (!attrList)
				attrList = AttrList.Pos3Norm3UV2();

			var vtxCount = this.vertexCount();
			var mesh = new MeshData(attrList);
			var vertexBuffer = mesh.primaryVertexBuffer();

			vertexBuffer.allocate(vtxCount);
			var indexElementType = minimumIndexElementTypeForVertexCount(vtxCount);
			mesh.indexBuffer.allocate(PrimitiveType.Triangle, indexElementType, this.faceCount());

			var posView = new VertexBufferAttributeView(vertexBuffer, vertexBuffer.attrByRole(VertexAttributeRole.Position));
			var texAttr = vertexBuffer.attrByRole(VertexAttributeRole.UV);
			var texView = texAttr ? new VertexBufferAttributeView(vertexBuffer, texAttr) : null;

			var triView = new IndexBufferTriangleView(mesh.indexBuffer);
			this.generateInto(posView, triView, texView);

			mesh.genVertexNormals();

			// add a default primitive group that covers the complete generated mesh
			mesh.primitiveGroups.push({ fromPrimIx: 0, primCount: this.faceCount(), materialIx: 0 });

			return mesh;
		}

		generateInto(positions: VertexBufferAttributeView, faces: IndexBufferTriangleView, uvs?: VertexBufferAttributeView): void {
			var posIx = 0, faceIx = 0, uvIx = 0;

			var pos: PositionAddFn = (x: number, y: number, z: number) => {
				var v3 = positions.item(posIx);
				v3[0] = x;
				v3[1] = y;
				v3[2] = z;
				posIx++;
			};

			var face: FaceAddFn = (a: number, b: number, c: number) => {
				var v3 = faces.item(faceIx);
				v3[0] = a;
				v3[1] = b;
				v3[2] = c;
				faceIx++;
			};

			var uv: UVAddFn = uvs ?
				(u: number, v: number) => {
					var v2 = uvs.item(uvIx);
					v2[0] = u;
					v2[1] = v;
					uvIx++;
				}
				: (u: number, v: number) => { };

			this.generateImpl(pos, face, uv);
		}
	}


	//  ___      _                
	// / __|_ __| |_  ___ _ _ ___ 
	// \__ \ '_ \ ' \/ -_) '_/ -_)
	// |___/ .__/_||_\___|_| \___|
	//     |_|                    

	export interface SphereDescriptor {
		radius: number;     // float
		rows: number;       // int: 2.., number of row subdivisions
		segs: number;       // int: 4.., number of quad facets per row

		sliceFrom?: number; // float: 0.0..1.0, vertical start of sphere section (def: 0.0)
		sliceTo?: number;   // float: 0.0..1.0, vertical end of sphere section (def: 1.0)
	}

	export class Sphere extends MeshGenerator {
		private radius_: number;
		private rows_: number;
		private segs_: number;
		private sliceFrom_: number;
		private sliceTo_: number;

		constructor(desc: SphereDescriptor) {
			super();

			this.radius_ = desc.radius;
			this.rows_ = desc.rows;
			this.segs_ = desc.segs;
			this.sliceFrom_ = clamp01(desc.sliceFrom || 0.0);
			this.sliceTo_ = clamp01(desc.sliceTo || 1.0);

			assert(this.radius_ > 0);
			assert(this.rows_ >= 2);
			assert(this.segs_ >= 4);
			assert(this.sliceTo_ > this.sliceFrom_);
		}

		vertexCount(): number {
			return (this.segs_ + 1) * (this.rows_ + 1);
		}

		faceCount(): number {
			var fc = 2 * this.segs_ * this.rows_;
			if (this.sliceFrom_ == 0.0)
				fc -= this.segs_;
			if (this.sliceTo_ == 1.0)
				fc -= this.segs_;
			return fc; 
		}

		generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn) {
			var Pi = Math.PI;
			var Tau = Math.PI * 2;

			var slice = this.sliceTo_ - this.sliceFrom_;
			var piFrom = this.sliceFrom_ * Pi;
			var piSlice = slice * Pi;

			var vix = 0;
			var openTop = this.sliceFrom_ > 0.0;
			var openBottom = this.sliceTo_ < 1.0;

			for (var row = 0; row <= this.rows_; ++row) {
				var y = Math.cos(piFrom + (piSlice / this.rows_) * row) * this.radius_;
				var segRad = Math.sin(piFrom + (piSlice / this.rows_) * row) * this.radius_;
				var texV = this.sliceFrom_ + ((row / this.rows_) * slice);

				for (var seg = 0; seg <= this.segs_; ++seg) {
					var x = Math.sin((Tau / this.segs_) * seg) * segRad;
					var z = Math.cos((Tau / this.segs_) * seg) * segRad;
					var texU = seg / this.segs_;

					position(x, y, z);
					uv(texU, texV);
					++vix;
				}
				
				// construct row of faces
				if (row > 0) {
					var raix = vix - ((this.segs_ + 1) * 2);
					var rbix = vix - (this.segs_ + 1);

					for (var seg = 0; seg < this.segs_; ++seg) {
						var rl = seg,
							rr = seg + 1;
						
						if (row > 1 || openTop)
							face(raix + rl, rbix + rl, raix + rr);
						if (row < this.rows_ || openBottom)
							face(raix + rr, rbix + rl, rbix + rr);
					}
				}
			}
		}
	}

} // ns sd.mesh.gen
