import React, { useState } from "react";
import { Container, Row, Stack } from "react-bootstrap";
import ModeTenji from "./components/ModeTenji";
import ModeKana from "./components/ModeKana";
import { FaArrowRight, FaGithub } from "react-icons/fa";
import { GoArrowBoth } from "react-icons/go";

const App: React.FC = () => {
  const [mode, setMode] = useState<"tenji" | "kana">("tenji");

  return (
    <Container>
      <Row className="my-3 no-print">
        <Stack direction="horizontal" gap={3}>
          <h1 className="h5">点字 - Tenji</h1>
          <div className="ms-auto">
            <span
              className={
                mode === "tenji"
                  ? "h6"
                  : "text-primary text-decoration-underline clickable"
              }
              style={mode !== "tenji" ? {fontSize: ".9rem"} :{fontSize: "1.1rem"}}
              onClick={() => setMode("tenji")}
            >
              点字
              <FaArrowRight />
              ひらがな
            </span>
          </div>
          <div>
            <GoArrowBoth />
          </div>
          <div>
            <span
              className={
                mode === "kana"
                  ? "h6"
                  : "text-primary text-decoration-underline clickable"
              }
              style={mode !== "kana" ? {fontSize: ".9rem"} :{fontSize: "1.1rem"}}
              onClick={() => setMode("kana")}
            >
              ひらがな
              <FaArrowRight />
              点字
            </span>
          </div>
          <div>
            <a href="https://github.com/masapico/tenji" target="_blank" rel="noreferrer">
              <FaGithub className="text-secondary" style={{fontSize: "1.1rem"}}/>
            </a>
          </div>
        </Stack>
      </Row>
      <Row>
        {mode === "tenji" ? <ModeTenji /> : null}
        {mode === "kana" ? <ModeKana /> : null}
      </Row>
    </Container>
  );
};

export default App;
