import { forwardRef } from "react";
import { normalizeUnit } from "../utils/normalizeUnit";

interface BallProps {
    xPos: number | string;
    yPos: number | string;
}

export const Ball = forwardRef<HTMLDivElement, BallProps>(({ xPos, yPos }, ref) => {
    return (
        <div
            ref={ref}
            style={{
                left: normalizeUnit(xPos),
                top: normalizeUnit(yPos),
            }}
            className="ball"
        >
        </div>
    );
});
