import React, { useRef, useState } from "react";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { getTenjiValues, identifyTenjiArray } from "../utils";
import TenjiFrame from "./TenjiFrame";

const ModeKana: React.FC = () => {
  const refInput = useRef<HTMLInputElement>(null);
  const [tenjiValues, setTenjiValues] = useState<string[]>([]);
  const [kanaValues, setKanaValues] = useState<string[]>([]);
  const [translated, setTranslated] = useState<boolean>(false);

  const handleTranslate = () => {
    const words = refInput.current ? refInput.current.value : "";
    // TODO: 半角・全角スペースをすべて削除する
    const validWords = words.replace
    if (words.length > 0) {
      setTenjiValues([...getTenjiValues(words)]);
      setKanaValues(identifyTenjiArray(getTenjiValues(words)));
      setTranslated(true);
    } else {
      setTenjiValues([]);
      setKanaValues([]);
      setTranslated(false);
    }
  };

  const handleReset = () => {
    if (refInput.current) {
      refInput.current.value = "";
      setTenjiValues([]);
      setKanaValues([]);
      setTranslated(false);
    }
  };

  const changeFrameValues = (index: number, value: string) => {
    // ダミー
    if (index && value) return;
  };

  return (
    <>
      <Row className="mt-3">
        <InputGroup>
          <InputGroup.Text>ひらがなを入力</InputGroup.Text>
          <Form.Control
            size="sm"
            type="text"
            autoComplete="off"
            placeholder="点字凸面に変換したい文字を入力..."
            ref={refInput}
            disabled={translated}
          />
          <Button
            size="sm"
            variant={!translated ? "primary" : "danger"}
            onClick={!translated ? handleTranslate : handleReset}
          >
            {!translated ? "点字に変換" : "入力をクリア"}
          </Button>
        </InputGroup>
      </Row>

      <Row className="g-3">
        {tenjiValues.map((v, i) => (
          <Col key={i} xs={6} sm={1} md={1} lg={1}>
            <TenjiFrame
              frameIndex={i}
              cellValue={v}
              setFrameValue={changeFrameValues}
              kana={kanaValues[i]}
              editable={false}
            />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default ModeKana;
