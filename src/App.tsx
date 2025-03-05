import React, { useState } from "react";
import { Container, Row, Stack } from "react-bootstrap";
import ModeTenji from "./components/ModeTenji";
import ModeKana from "./components/ModeKana";
import { FaArrowRight } from "react-icons/fa";
import { GoArrowBoth } from "react-icons/go";

const App: React.FC = () => {
  const [mode, setMode] = useState<"tenji" | "kana">("tenji");

  return (
    <Container>
      <Row className="my-3 no-print">
        <Stack direction="horizontal" gap={3}>
          <h1 className="h6">点字 - Tenji</h1>
          <div className="ms-auto">
            <span
              className={
                mode === "tenji"
                  ? "h6 text-success"
                  : "text-primary text-decoration-underline clickable"
              }
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
                  ? "h6 text-success"
                  : "text-primary text-decoration-underline clickable"
              }
              onClick={() => setMode("kana")}
            >
              ひらがな
              <FaArrowRight />
              点字
            </span>
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
