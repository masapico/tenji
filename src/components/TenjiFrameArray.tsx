import React, { useState } from "react";
import { identifyTenjiArray } from "../utils";
import { Row, Stack } from "react-bootstrap";
import TenjiFrame from "./TenjiFrame";
import { IoAdd, IoRemove } from "react-icons/io5";

const TenjiFrameArray: React.FC = () => {
  const defaultFrameCount = 10;
  const [frameValues, setFrameValues] = useState<string[]>(
    new Array(defaultFrameCount).fill("000000")
  );
  const [kanaArray, setKanaArray] = useState<string[]>(
    new Array(defaultFrameCount).fill("　")
  );

  const changeFrameValues = (index: number, newValue: string) => {
    const tmp = [...frameValues];
    tmp.map((_t, i) => {
      if (i === index) tmp[i] = newValue;
    });
    setFrameValues([...tmp]);
    setKanaArray(identifyTenjiArray(tmp));
  };

  return (
    <Row className="my-4">
      <Stack direction="horizontal" gap={2}>
        {frameValues.map((fv, index) => (
          <TenjiFrame
            key={index}
            frameIndex={index}
            cellValue={fv}
            setFrameValue={changeFrameValues}
            kana={kanaArray[index]}
            editable={true}
          />
        ))}
        <div
          className="no-print"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IoAdd
            className="text-primary clickable fw-bold mb-3"
            style={{ fontSize: "1.1rem" }}
            onClick={() => {
              setFrameValues([...frameValues, "000000"]);
              setKanaArray([...kanaArray, "　"]);
            }}
          />
          {frameValues.length > 1 ? (
            <IoRemove
              className="text-danger clickable fw-bold"
              style={{ fontSize: "1.1rem" }}
              onClick={() => {
                setFrameValues([
                  ...frameValues.slice(0, frameValues.length - 1),
                ]);
                setKanaArray([...kanaArray.slice(0, kanaArray.length - 1)]);
              }}
            />
          ) : null}
        </div>
      </Stack>
    </Row>
  );
};

export default TenjiFrameArray;
