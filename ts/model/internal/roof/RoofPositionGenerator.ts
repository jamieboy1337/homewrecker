import { vec3 } from "gl-matrix";
import { Segment } from "../../../segment/Segment";
import { generateDirNorm } from "../generateDirNorm";
import { RoofPolyData } from "../RoofPolyData";

export class RoofPositionGenerator {
  /**
   * Generates position data for a roof.
   * @param segment - segment being generated.
   * @param height - height of roof at peak (0 is edge)
   * @param extrude - distance from segment to extrude roof.
   * @returns a list of unindexed tri positions which will build the model.
   */
  static generateRoofPositions(segment: Segment, height: number, extrude: number) : RoofPolyData {
    const {startRef, endRef, dir, norm} = generateDirNorm(segment);

    const temp = vec3.create();
    const temp2 = vec3.create();

    const res = {} as RoofPolyData;
    res.longPlus = [];
    res.longMinus = [];
    res.shortEnd = null;
    res.shortStart = null;

    vec3.copy(temp, endRef);
    temp[1] += height;
    res.longMinus.push(...temp);

    vec3.subtract(temp, temp, vec3.scale(temp2, norm, extrude));
    temp[1] = 0;
    vec3.add(temp, temp, vec3.scale(temp2, dir, (segment.flat ? 0 : extrude)));
    res.longMinus.push(...temp);

    vec3.copy(temp, startRef);
    vec3.subtract(temp, temp, vec3.scale(temp2, norm, extrude));
    vec3.add(temp, temp, vec3.scale(temp2, dir, (segment.startJoin ? extrude : (segment.flat ? 0 : -extrude))));
    res.longMinus.push(...temp);

    vec3.copy(temp, startRef);
    temp[1] += height;
    res.longMinus.push(...temp);

    // copy to right quad by mirroring and reversing vertex order
    for (let i = 9; i >= 0; i -= 3) {
      temp[0] = res.longMinus[i];
      temp[1] = res.longMinus[i + 1];
      temp[2] = res.longMinus[i + 2];

      if (temp[1] === 0) {
        // flip only our 0-height values
        // we specifically assign to 0 so should be fine
        vec3.add(temp, temp, vec3.scale(temp2, norm, 2 * extrude));
      }

      res.longPlus.push(...temp);
    }

    if (!segment.flat) {
      res.shortEnd = [];
      vec3.copy(temp, endRef);
      temp[1] += height;
      res.shortEnd.push(...temp); 
      
      temp[1] = 0;
      vec3.add(temp, temp, vec3.scale(temp2, norm, extrude));
      vec3.add(temp, temp, vec3.scale(temp2, dir, extrude));
      res.shortEnd.push(...temp);
      vec3.sub(temp, temp, vec3.scale(temp2, norm, 2 * extrude));
      res.shortEnd.push(...temp);
      if (!segment.startJoin) {
        res.shortStart = [];
        const len = vec3.len(vec3.sub(temp, endRef, startRef));

        vec3.add(temp2, startRef, vec3.scale(temp, dir, len / 2));
        // copy by rotating 180deg about center
        for (let i = 0; i < res.shortEnd.length; i += 3) {
          temp[0] = res.shortEnd[i];
          temp[1] = res.shortEnd[i + 1];
          temp[2] = res.shortEnd[i + 2];

          vec3.sub(temp, temp, temp2);
          vec3.sub(temp, temp2, temp);
          // flips on Y -- unflip
          temp[1] = -temp[1];
          res.shortStart.push(...temp);
        }
      }
    }
    
    return res;
  }

  static generateRoofPositionsFromCurve(points: Array<number>, roofPoints: Array<number>, height: number, thickness: number, yOffset: number) : Array<Array<number>> {
    const res : Array<Array<number>> = [];
    const start = vec3.create();
    const end = vec3.create();

    const roofStart = vec3.create();
    const roofEnd = vec3.create();

    const temp = vec3.create();

    for (let i = 0; i < points.length; i += 2) {
      const indStart = i;
      const indEnd = (i + 2) % points.length;

      start[0] = points[indStart];
      start[2] = points[indStart + 1];
      end[0]   = points[indEnd];
      end[2]   = points[indEnd + 1];

      start[1] = yOffset;
      end[1] = yOffset;

      roofStart[0] = roofPoints[indStart];
      roofStart[1] = height + yOffset;
      roofStart[2] = roofPoints[indStart + 1];

      roofEnd[0] = roofPoints[indEnd];
      roofEnd[1] = height + yOffset;
      roofEnd[2] = roofPoints[indEnd + 1];

      const data = [] as Array<number>

      data.push(...end);
      data.push(...start);
      data.push(...roofStart);
      
      vec3.sub(temp, roofEnd, roofStart);
      if (vec3.len(temp) > 0.001) {
        // non-tri
        data.push(...roofEnd);
      }

      res.push(data);
    }

    // all bottoms after all sides
    for (let i = 0; i < points.length; i += 2) {
      const indStart = i;
      const indEnd = (i + 2) % points.length;

      start[0] = points[indStart];
      start[2] = points[indStart + 1];
      end[0]   = points[indEnd];
      end[2]   = points[indEnd + 1];

      start[1] = yOffset - 0.05;
      end[1] = yOffset - 0.05;

      roofStart[0] = roofPoints[indStart];
      roofStart[1] = height + yOffset - 0.05;
      roofStart[2] = roofPoints[indStart + 1];

      roofEnd[0] = roofPoints[indEnd];
      roofEnd[1] = height + yOffset - 0.05;
      roofEnd[2] = roofPoints[indEnd + 1];

      const data = [] as Array<number>

      data.push(...start);
      data.push(...end);
      data.push(...roofEnd);
      
      vec3.sub(temp, roofEnd, roofStart);
      if (vec3.len(temp) > 0.001) {
        // non-tri
        data.push(...roofStart);
      }

      res.push(data);
    }

    return res;
  }
}