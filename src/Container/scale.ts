import * as d3 from "d3";

type scaleLinear = d3.ScaleLinear<number, number, never>;

class Scale {
  private static scaleX: scaleLinear;
  private static scaleY: scaleLinear;
  private static margin = { top: 40, right: 40, bottom: 40, left: 40 };

  static setScale(width: number, height: number) {
    const scaleX = d3
      .scaleLinear()
      .domain([-10, 10])
      .range([Scale.margin.left, width]);
    const scaleY = d3
      .scaleLinear()
      .domain([-4.5, 4.5])
      .range([height, Scale.margin.top]);
    this.scaleX = scaleX;
    this.scaleY = scaleY;
  }

  static getScaleMargin() {
    return this.margin;
  }

  static getScaleX() {
    return this.scaleX;
  }

  static getScaleY() {
    return this.scaleY;
  }
}

export default Scale;
