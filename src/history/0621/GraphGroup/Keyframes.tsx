import React, { useEffect, useRef, FunctionComponent } from "react";
import * as d3 from "d3";

interface Props {
  datum: number[][];
  test: boolean;
}

const Keyframes: FunctionComponent<Props> = ({ datum, test }) => {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const x = d3.scaleLinear().domain([-10, 10]).range([margin.left, width]);
    const y = d3.scaleLinear().domain([-4.5, 4.5]).range([height, margin.top]);

    d3.select(groupRef.current)
      .selectAll("circle")
      .data(datum)
      .join("circle")
      .attr("r", 2)
      .attr("cx", (d) => x(d[0]))
      .attr("cy", (d) => y(d[1]));
  }, [datum]);

  useEffect(() => {
    if (test) {
      const observerOptions: IntersectionObserverInit = {
        // root: document.getElementById("graph-group-wrapper"),
        root: document.querySelector("svg"),
      };
      const intersectionObserver = new IntersectionObserver(
        ([entry], observer) => {
          console.log(entry.isIntersecting);
        },
        observerOptions
      );
      intersectionObserver.observe(groupRef.current as Element);
    }
  });

  return <g ref={groupRef} />;
};

export default Keyframes;
