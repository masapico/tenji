import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { identifyTenji } from "../utils";

type TenjiFrameProps = {
  frameIndex: number;
  cellValue: string | undefined;
  setFrameValue: (index: number, value: string) => void;
  kana: string;
  editable: boolean;
};

const TenjiFrame: React.FC<TenjiFrameProps> = ({
  frameIndex,
  cellValue,
  setFrameValue,
  kana,
  editable,
}) => {
  // 値の並び
  // -----------------
  // | cell1 | cell4 |
  // | cell2 | cell5 |
  // | cell3 | cell6 |
  // -----------------
  const [cell1, setCell1] = useState<boolean>(false);
  const [cell2, setCell2] = useState<boolean>(false);
  const [cell3, setCell3] = useState<boolean>(false);
  const [cell4, setCell4] = useState<boolean>(false);
  const [cell5, setCell5] = useState<boolean>(false);
  const [cell6, setCell6] = useState<boolean>(false);
  const [currentValue, setCurrentValue] = useState<string>(
    cellValue || "000000"
  );

  useEffect(() => {
    if (cellValue) {
      const propValues = cellValue.split("");
      setCell1(propValues[0] === "1");
      setCell2(propValues[1] === "1");
      setCell3(propValues[2] === "1");
      setCell4(propValues[3] === "1");
      setCell5(propValues[4] === "1");
      setCell6(propValues[5] === "1");
    }
  }, [cellValue]);

  useEffect(() => {
    const tmpCellValue = [cell1, cell2, cell3, cell4, cell5, cell6]
      .map((cell) => (cell ? "1" : "0"))
      .join("");
    setFrameValue(frameIndex, tmpCellValue);
    setCurrentValue(tmpCellValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cell1, cell2, cell3, cell4, cell5, cell6]);

  return (
    <Container
      className="mb-3"
      style={{ width: "50px", height: "75px", border: "1px solid #ccc" }}
      title={identifyTenji(currentValue)}
    >
      <Row className="text-center">
        <Col
          sm={6}
          className="p-0 m-0 clickable"
          onClick={() => {
            if (editable) setCell1((prevState) => !prevState);
          }}
        >
          <span className="text-secondary">{cell1 ? "●" : "○"}</span>
        </Col>
        <Col
          sm={6}
          className="p-0 m-0 clickable"
          onClick={() => {
            if (editable) setCell4((prevState) => !prevState);
          }}
        >
          <span className="text-secondary">{cell4 ? "●" : "○"}</span>
        </Col>
      </Row>
      <Row className="text-center">
        <Col
          sm={6}
          className="p-0 m-0 clickable"
          onClick={() => {
            if (editable) setCell2((prevState) => !prevState);
          }}
        >
          <span className="text-secondary">{cell2 ? "●" : "○"}</span>
        </Col>
        <Col
          sm={6}
          className="p-0 m-0 clickable"
          onClick={() => {
            if (editable) setCell5((prevState) => !prevState);
          }}
        >
          <span className="text-secondary">{cell5 ? "●" : "○"}</span>
        </Col>
      </Row>
      <Row className="text-center">
        <Col
          sm={6}
          className="p-0 m-0 clickable"
          onClick={() => {
            if (editable) setCell3((prevState) => !prevState);
          }}
        >
          <span className="text-secondary">{cell3 ? "●" : "○"}</span>
        </Col>
        <Col
          sm={6}
          className="p-0 m-0 clickable"
          onClick={() => {
            if (editable) setCell6((prevState) => !prevState);
          }}
        >
          <span className="text-secondary">{cell6 ? "●" : "○"}</span>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col sm={12} className="p-2 m-0 text-center h6">
          {kana}
        </Col>
      </Row>
    </Container>
  );
};

export default TenjiFrame;
