import React, { useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";

interface Props {
  code: string;
  name: string;
  width: number;
  height: number;
  fontSize: number;
}

export const BarcodeLabel: React.FC<Props> = ({
  code,
  name,
  width,
  height,
  fontSize,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, code, {
        width: width / 100,
        height,
        fontSize,
        displayValue: true,
        text: name,
      });
    }
  }, [code, name, width, height, fontSize]);

  return (
    <div className="flex flex-col items-center p-2">
      <svg ref={svgRef} />
    </div>
  );
}; 