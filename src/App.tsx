import React, { useCallback, useState, Fragment } from "react";
import Container from "./Container";
import ContainerCopy from "./Container/index.copy";

const App = () => {
  const [all, setAll] = useState(false);

  const handleClickButton = useCallback(() => {
    setAll((prev) => !prev);
  }, []);

  return (
    <Fragment>
      <button onClick={handleClickButton}>라인 1개</button>
      <button onClick={handleClickButton}>라인 전체</button>
      {all ? <Container /> : <ContainerCopy />}
    </Fragment>
  );
};

export default App;
