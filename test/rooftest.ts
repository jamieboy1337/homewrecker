import { expect } from "chai";
import { RoofGenerator } from "../ts/model/RoofGenerator";
import { Segment } from "../ts/segment/Segment";

describe("RoofGenerator", function() {
  it("Doesn't crash when face is missing", function() {
    const testSegment : Segment = {
      start: [0, 0],
      end: [10, 0],
      flat: false,
      startJoin: true
    };

    RoofGenerator.generateRoof([testSegment], 0.5, 0.5, 0.0, 0);
  });
  
  it("Has the length we would expect", function() {
    const testSegment : Segment = {
      start: [0, 0],
      end: [10, 10],
      flat: false,
      startJoin: false
    };

    const roof = RoofGenerator.generateRoof([testSegment], 5, 5, 0, 0);
    // should have 14 vertices and 18 indices
    expect(roof.geometry).to.not.be.undefined;
    expect(roof.index).to.not.be.undefined;

    expect(roof.geometry.size()).to.equal(1232); // 44 bytes per vertex * 28 vertices (14 top, 14 bot)
    expect(roof.index.size()).to.equal(72); // 6 tris * 3 points * 2 bytes per index * 2 (top, bot)
  });
});