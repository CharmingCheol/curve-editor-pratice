import * as d3 from "d3";

type scaleLinear = d3.ScaleLinear<number, number, never>;

class Scale {
  private static x: scaleLinear;
  private static y: scaleLinear;
  private static margin = { top: 40, right: 40, bottom: 40, left: 40 } as const;

  static setScale(width: number, height: number) {
    const x = d3
      .scaleLinear()
      .domain([-10, 10])
      .range([Scale.margin.left, width]);
    const y = d3
      .scaleLinear()
      .domain([-4.5, 4.5])
      .range([height, Scale.margin.top]);
    Scale.x = x;
    Scale.y = y;
  }

  static get scaleMargin() {
    return Scale.margin;
  }

  static get xScale() {
    return Scale.x;
  }

  static get yScale() {
    return Scale.y;
  }
}

export default Scale;
