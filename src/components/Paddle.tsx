import { forwardRef } from "react";
import { normalizeUnit } from "../utils/normalizeUnit";

interface PaddleProps {
    xPos: number | string;
}

export const Paddle = forwardRef<HTMLDivElement, PaddleProps>(({ xPos }, ref) => {
    return (
        <div
            ref={ref}
            style={{
                left: normalizeUnit(xPos)
            }}
            className="paddle"
        >
        </div>
    );
});
