import React, { useState } from "react";
import TenjiFrameArray from "./TenjiFrameArray";
import { Row } from "react-bootstrap";
import { MdDelete } from "react-icons/md";

const ModeTenji: React.FC = () => {
  const defaultRowCount = 1;
  const [rowArray, setRowArray] = useState<boolean[]>(
    new Array(defaultRowCount).fill(true)
  );

  const addNewRow = () => {
    setRowArray([...rowArray, true]);
  };

  const removeRow = (index: number) => {
    setRowArray([...rowArray.filter((_r, i) => i !== index)]);
  };

  return (
    <>
      <Row id="tenji-array">
        {rowArray.map((_r, index) => (
          <div key={index}>
            <TenjiFrameArray />
            {index > 0 ? (
              <div
                className="text-danger no-print text-decoration-underline"
                style={{ fontSize: ".8rem" }}
              >
                <span className="clickable" onClick={() => removeRow(index)}>
                  <MdDelete style={{ fontSize: "1.1rem" }} /> 行を削除する
                </span>
              </div>
            ) : null}
          </div>
        ))}
      </Row>
      <Row className="my-5">
        <div
          className="text-primary text-decoration-underline clickable fw-bold no-print"
          onClick={addNewRow}
        >
          行を追加する
        </div>
      </Row>
    </>
  );
};

export default ModeTenji;
