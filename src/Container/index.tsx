import React, { useEffect, useRef, useState } from "react";
import AxisWrapper from "./AxisWrapper";
import GraphWrapper from "./GraphWrapper";
import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cx = classNames.bind(styles);

const App = () => {
  const curveEditorRef = useRef<SVGSVGElement>(null);
  const [isNotEmpty, setIsNotEmpty] = useState(false);

  useEffect(() => {
    setIsNotEmpty(true);
  }, []);

  return (
    <div className={cx("wrapper")}>
      <svg ref={curveEditorRef}>
        <AxisWrapper curveEditorRef={curveEditorRef} />
        {isNotEmpty && <GraphWrapper />}
      </svg>
    </div>
  );
};

export default App;
