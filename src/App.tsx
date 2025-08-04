import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Ball } from "./components/Ball.jsx";
import { Paddle } from "./components/Paddle.jsx";
import { normalizeUnit } from "./utils/normalizeUnit.jsx";

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
let GAME_WIDTH = 800;
let GAME_HEIGHT = 600;
let STEPS = GAME_WIDTH / (PADDLE_WIDTH * 1 / 5);
const INITIAL_VELOCITY = { x: 5, y: 5 };

const BALL_SIZE = {
  height: 25,
  width: 25,
};

interface Position {
  x: number;
  y: number;
}

const getRandomBallPosition = (): Position => {
  return {
    x: Math.random() * (GAME_WIDTH - BALL_SIZE.width),
    y: Math.random() * (GAME_HEIGHT / 2),
  };
};

function App() {
  const [gameOver, setGameOver] = useState(false);
  const gameStateRef = useRef({
    velocity: { ...INITIAL_VELOCITY },
    paddlePosition: (GAME_WIDTH / 2) - (PADDLE_WIDTH / 2),
    ballPosition: getRandomBallPosition(),
  });
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const container = document.querySelector(".game-container");
    if (container) {
      GAME_WIDTH = container.clientWidth;
      GAME_HEIGHT = container.clientHeight;
      STEPS = GAME_WIDTH / (PADDLE_WIDTH * 1 / 5);
    }
  }, []);

  const resetGame = useCallback(() => {
    if (!gameOver) return;
    gameStateRef.current = {
      velocity: { ...INITIAL_VELOCITY },
      paddlePosition: (GAME_WIDTH / 2) - (PADDLE_WIDTH / 2),
      ballPosition: getRandomBallPosition(),
    };
    setGameOver(false);
    forceUpdate({});
  }, [gameOver]);

  const movePaddleRight = useCallback(() => {
    const next = gameStateRef.current.paddlePosition + STEPS;
    gameStateRef.current.paddlePosition = next >= GAME_WIDTH - PADDLE_WIDTH
      ? GAME_WIDTH - PADDLE_WIDTH
      : next;
    forceUpdate({});
  }, []);

  const movePaddleLeft = useCallback(() => {
    const next = gameStateRef.current.paddlePosition - STEPS;
    gameStateRef.current.paddlePosition = next <= 0 ? 0 : next;
    forceUpdate({});
  }, []);

  useHotkeys("Space", resetGame);
  useHotkeys("ArrowRight", movePaddleRight);
  useHotkeys("ArrowLeft", movePaddleLeft);

  useEffect(() => {
    if (gameOver) return;

    let frameId: number;
    const updateGame = () => {
      const { ballPosition, velocity, paddlePosition } = gameStateRef.current;
      const nextVel = { ...velocity };

      const paddleTop = GAME_HEIGHT - PADDLE_HEIGHT;
      const paddleRight = paddlePosition + PADDLE_WIDTH;

      const ballTop = ballPosition.y;
      const ballBottom = ballPosition.y + BALL_SIZE.height + velocity.y;
      const ballRight = ballPosition.x + BALL_SIZE.width;
      const ballLeft = ballPosition.x;

      if (ballTop < 0 || ballBottom >= GAME_HEIGHT) {
        nextVel.y = -velocity.y;
      }
      if (ballRight + velocity.x >= GAME_WIDTH || ballLeft < 0) {
        nextVel.x = -velocity.x;
      }

      if (ballBottom >= GAME_HEIGHT) {
        setGameOver(true);
        return;
      } else if (
        ballBottom > paddleTop &&
        ballPosition.y < paddleTop + PADDLE_HEIGHT &&
        ballRight > paddlePosition &&
        ballLeft < paddleRight
      ) {
        nextVel.y = -velocity.y;
      }

      // Update ball position
      const nextBallTop = ballPosition.y + BALL_SIZE.height + nextVel.y;
      const nextBallLeft = ballPosition.x + BALL_SIZE.width + nextVel.x;

      if (
        nextBallTop < GAME_HEIGHT && nextBallTop >= 0 &&
        nextBallLeft < GAME_WIDTH && nextBallLeft >= 0
      ) {
        gameStateRef.current.ballPosition = {
          x: ballPosition.x + nextVel.x,
          y: ballPosition.y + nextVel.y,
        };
      }

      gameStateRef.current.velocity = nextVel;
      forceUpdate({});
      frameId = requestAnimationFrame(updateGame);
    };

    frameId = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(frameId);
  }, [gameOver]);

  if (gameOver) {
    return (
      <div>
        <p>Game Over</p>
        <p>Press Space to start again</p>
      </div>
    );
  }

  const { ballPosition, paddlePosition } = gameStateRef.current;

  return (
    <div
      className="game-container"
      style={{
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
      }}
    >
      <>
        <Ball xPos={ballPosition.x} yPos={ballPosition.y} />
        <Paddle
          ref={(node) => {
            if (!node) return;
            node.style.width = normalizeUnit(PADDLE_WIDTH);
            node.style.height = normalizeUnit(PADDLE_HEIGHT);
          }}
          xPos={paddlePosition}
        />
      </>
    </div>
  );
}

export default App;
