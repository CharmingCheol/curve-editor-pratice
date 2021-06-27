type scaleLinear = d3.ScaleLinear<number, number, never>;

class Test {
  static _xScale: scaleLinear | null;
  static _yScale: scaleLinear | null;

  static setScale(xScale: scaleLinear, yScale: scaleLinear) {
    Test._xScale = xScale;
    Test._yScale = yScale;
  }

  static get xScale() {
    return Test._xScale;
  }

  static get yScale() {
    return Test._yScale;
  }

  //   get xScale() {
  //     return Test._xScale;
  //   }

  //   get yScale() {
  //     return Test._yScale;
  //   }
}

export default Test;
