import React, { useCallback, useState, Fragment } from "react";
import One from "./history/0617/2";
import Frozen from "./history/0617/3";
import Container from "./Container";

type Selected = "1" | "frozen" | "now";

const App = () => {
  const [menu, setMenu] = useState<Selected>("1");

  const handleClickButton = useCallback((selected: Selected) => {
    setMenu(selected);
  }, []);

  const Rendered = () => {
    if (menu === "1") {
      return <One />;
    } else if (menu === "frozen") {
      return <Frozen />;
    }
    return <Container />;
  };

  return (
    <Fragment>
      <button onClick={() => handleClickButton("1")}>라인 1개</button>
      <button onClick={() => handleClickButton("frozen")}>굉장히 버벅임</button>
      <button onClick={() => handleClickButton("now")}>현재</button>
      <Rendered />
    </Fragment>
  );
};

export default App;
