import { BodyGenerator } from "./BodyGenerator";
import { RoofGenerator } from "./RoofGenerator";
import { SegmentGenerator } from "./SegmentGenerator";
import { GLModelSpec } from "nekogirl-valhalla/model/GLModelSpec";
import { AttributeType } from "nekogirl-valhalla/model/AttributeType";
import { DataType } from "nekogirl-valhalla/model/DataType";
import { ReadWriteBuffer } from "nekogirl-valhalla/buffer/ReadWriteBuffer";
import { FasciaGenerator } from "./FasciaGenerator";
import { DecalGenerator } from "./DecalGenerator";
import { DecalObject } from "../decal/DecalObject";

export interface HouseOptions {
  seed?: number,
  texScaleRoof?: number,
  texScaleBody?: number,
  thicknessRoof?: number,

  // buffer reuse
  bufferGeom?: HouseBuffer,
  bufferIndex?: HouseBuffer
};

export interface HouseBuffer {
  buffer: ReadWriteBuffer,
  offset: number
}

export class HouseGenerator {
  static generateHouse(heightBody: number, heightRoof: number, extrude: number, overhang: number, opts?: HouseOptions) : [GLModelSpec, GLModelSpec, GLModelSpec, DecalObject] {
    const overhangActual = Math.max(overhang, 0.0);

    const tOverhang = overhangActual / (extrude + overhangActual);

    const heightBodyActual = heightBody + tOverhang * heightRoof;
    
    const segs = SegmentGenerator.generateSegments(extrude + overhangActual, opts ? opts.seed : undefined);

    const roofThickness = (opts ? (opts.thicknessRoof !== undefined ? opts.thicknessRoof : 0.05) : 0.05);

    // todo: append to an existing buffer
    const bodyBuf = BodyGenerator.generateBody(segs, heightBodyActual, extrude, opts);
    const bodyModelSpec = new GLModelSpec();

    if (opts && opts.bufferGeom) {
      opts.bufferGeom.offset = bodyBuf.offset;
    }

    if (opts && opts.bufferIndex) {
      opts.bufferIndex.offset = bodyBuf.indexOffset;
    }

    bodyModelSpec.setAttribute(bodyBuf.geometry, AttributeType.POSITION, bodyBuf.POSITION_COMPONENTS, DataType.FLOAT, bodyBuf.vertices, bodyBuf.POSITION_OFFSET + bodyBuf.start, bodyBuf.BYTE_STRIDE);
    bodyModelSpec.setAttribute(bodyBuf.geometry, AttributeType.NORMAL, bodyBuf.NORMAL_COMPONENTS, DataType.FLOAT, bodyBuf.vertices, bodyBuf.NORMAL_OFFSET + bodyBuf.start, bodyBuf.BYTE_STRIDE);
    bodyModelSpec.setAttribute(bodyBuf.geometry, AttributeType.TEXCOORD, bodyBuf.TEXCOORD_COMPONENTS, DataType.FLOAT, bodyBuf.vertices, bodyBuf.TEXCOORD_OFFSET + bodyBuf.start, bodyBuf.BYTE_STRIDE);
    bodyModelSpec.setAttribute(bodyBuf.geometry, AttributeType.TANGENT, bodyBuf.TANGENT_COMPONENTS, DataType.FLOAT, bodyBuf.vertices, bodyBuf.TANGENT_OFFSET + bodyBuf.start, bodyBuf.BYTE_STRIDE);
    // note: we need to update offset for roofbuf
    bodyModelSpec.setIndex(bodyBuf.index, DataType.UNSIGNED_SHORT, bodyBuf.indices, bodyBuf.startIndex);

    const roofBuf = RoofGenerator.generateRoof(segs, heightRoof, extrude + overhangActual, roofThickness, heightBody, opts);

    if (opts && opts.bufferGeom) {
      opts.bufferGeom.offset = roofBuf.offset;
    }

    if (opts && opts.bufferIndex) {
      opts.bufferIndex.offset = roofBuf.indexOffset;
    }

    const roofModelSpec = new GLModelSpec();

    
    roofModelSpec.setAttribute(roofBuf.geometry, AttributeType.POSITION, roofBuf.POSITION_COMPONENTS, DataType.FLOAT, roofBuf.vertices, roofBuf.POSITION_OFFSET + roofBuf.start, roofBuf.BYTE_STRIDE);
    roofModelSpec.setAttribute(roofBuf.geometry, AttributeType.NORMAL, roofBuf.NORMAL_COMPONENTS, DataType.FLOAT, roofBuf.vertices, roofBuf.NORMAL_OFFSET + roofBuf.start, roofBuf.BYTE_STRIDE);
    roofModelSpec.setAttribute(roofBuf.geometry, AttributeType.TEXCOORD, roofBuf.TEXCOORD_COMPONENTS, DataType.FLOAT, roofBuf.vertices, roofBuf.TEXCOORD_OFFSET + roofBuf.start, roofBuf.BYTE_STRIDE);
    roofModelSpec.setAttribute(roofBuf.geometry, AttributeType.TANGENT, roofBuf.TANGENT_COMPONENTS, DataType.FLOAT, roofBuf.vertices, roofBuf.TANGENT_OFFSET + roofBuf.start, roofBuf.BYTE_STRIDE);

    roofModelSpec.setIndex(roofBuf.index, DataType.UNSIGNED_SHORT, roofBuf.indices, roofBuf.startIndex);


    const fasciaBuf = FasciaGenerator.generateFascia(segs, extrude + overhangActual, heightBody, opts);

    if (opts && opts.bufferGeom) {
      opts.bufferGeom.offset = roofBuf.offset;
    }

    if (opts && opts.bufferIndex) {
      opts.bufferIndex.offset = roofBuf.indexOffset;
    }

    const fasciaModelSpec = new GLModelSpec();

    fasciaModelSpec.setAttribute(fasciaBuf.geometry, AttributeType.POSITION, fasciaBuf.POSITION_COMPONENTS, DataType.FLOAT, fasciaBuf.vertices, fasciaBuf.POSITION_OFFSET + fasciaBuf.start, fasciaBuf.BYTE_STRIDE);
    fasciaModelSpec.setAttribute(fasciaBuf.geometry, AttributeType.NORMAL, fasciaBuf.NORMAL_COMPONENTS, DataType.FLOAT, fasciaBuf.vertices, fasciaBuf.NORMAL_OFFSET + fasciaBuf.start, fasciaBuf.BYTE_STRIDE);
    fasciaModelSpec.setAttribute(fasciaBuf.geometry, AttributeType.TEXCOORD, fasciaBuf.TEXCOORD_COMPONENTS, DataType.FLOAT, fasciaBuf.vertices, fasciaBuf.TEXCOORD_OFFSET + fasciaBuf.start, fasciaBuf.BYTE_STRIDE);
    fasciaModelSpec.setAttribute(fasciaBuf.geometry, AttributeType.TANGENT, fasciaBuf.TANGENT_COMPONENTS, DataType.FLOAT, fasciaBuf.vertices, fasciaBuf.TANGENT_OFFSET + fasciaBuf.start, fasciaBuf.BYTE_STRIDE);

    fasciaModelSpec.setIndex(fasciaBuf.index, DataType.UNSIGNED_SHORT, fasciaBuf.indices, fasciaBuf.startIndex);

    if (opts && opts.bufferGeom) {
      opts.bufferGeom.offset = fasciaBuf.offset;
    }

    if (opts && opts.bufferIndex) {
      opts.bufferIndex.offset = fasciaBuf.indexOffset;
    }
    // decals should be *much* easier with the generated path

    const decals = DecalGenerator.generateDecals(segs, heightBody, extrude);

    // todo: generalise sweep code to make some gutters?
  
    return [bodyModelSpec, roofModelSpec, fasciaModelSpec, decals];
  }
}