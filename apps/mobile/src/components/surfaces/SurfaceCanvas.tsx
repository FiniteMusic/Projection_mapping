
import { useMemo, useRef, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent
} from "react-native";

import type { Point, Quad } from "@projection/shared";
import { colors } from "@/constants/theme";

type VertexIndex = 0 | 1 | 2 | 3;

interface SurfaceCanvasProps {
  corners: Quad;
  onChange: (corners: Quad) => void;
  onChangeEnd?: (corners: Quad) => void;
}

const LABELS = ["TL", "TR", "BR", "BL"];
const HANDLE_RADIUS = 13;
const HIT_RADIUS = 30;
const PADDING = 24;

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export default function SurfaceCanvas({
  corners,
  onChange,
  onChangeEnd
}: SurfaceCanvasProps) {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const cornersRef = useRef(corners);
  const onChangeRef = useRef(onChange);
  const onChangeEndRef = useRef(onChangeEnd);
  const dimensionsRef = useRef({ width, height });
  const activeVertexRef = useRef<VertexIndex | null>(null);
  const startCornersRef = useRef<Quad>(corners);

  cornersRef.current = corners;
  onChangeRef.current = onChange;
  onChangeEndRef.current = onChangeEnd;
  dimensionsRef.current = { width, height };

  function toPixels(point: Point) {
    const dimensions = dimensionsRef.current;

    return {
      x: PADDING + point.x * Math.max(1, dimensions.width - PADDING * 2),
      y: PADDING + point.y * Math.max(1, dimensions.height - PADDING * 2)
    };
  }

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,

        onMoveShouldSetPanResponder: () => true,

        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;

          let nearest: VertexIndex | null = null;
          let minDistance = HIT_RADIUS;

          cornersRef.current.forEach((point, index) => {
            const pixel = toPixels(point);

            const distance = Math.hypot(
              locationX - pixel.x,
              locationY - pixel.y
            );

            if (distance < minDistance) {
              minDistance = distance;
              nearest = index as VertexIndex;
            }
          });

          activeVertexRef.current = nearest;
          startCornersRef.current = cornersRef.current.map(
            point => ({ ...point })
          ) as Quad;

          setSelected(nearest);
        },

        onPanResponderMove: (_, gesture) => {
          const index = activeVertexRef.current;

          if (index === null) return;

          const dimensions = dimensionsRef.current;

          const drawableWidth = Math.max(
            1,
            dimensions.width - PADDING * 2
          );

          const drawableHeight = Math.max(
            1,
            dimensions.height - PADDING * 2
          );

          const original = startCornersRef.current[index];

          const next: Quad = startCornersRef.current.map(
            point => ({ ...point })
          ) as Quad;

          next[index] = {
            x: clamp(original.x + gesture.dx / drawableWidth),
            y: clamp(original.y + gesture.dy / drawableHeight)
          };

          cornersRef.current = next;
          onChangeRef.current(next);
        },

        onPanResponderRelease: () => {
          if (activeVertexRef.current !== null) {
            onChangeEndRef.current?.(cornersRef.current);
          }

          activeVertexRef.current = null;
          setSelected(null);
        },

        onPanResponderTerminate: () => {
          if (activeVertexRef.current !== null) {
            onChangeEndRef.current?.(cornersRef.current);
          }

          activeVertexRef.current = null;
          setSelected(null);
        }
      }),
    []
  );

  function handleLayout(event: LayoutChangeEvent) {
    const { width: w, height: h } = event.nativeEvent.layout;

    setWidth(w);
    setHeight(h);
  }

  const points = corners.map(point => ({
    x: PADDING + point.x * Math.max(1, width - PADDING * 2),
    y: PADDING + point.y * Math.max(1, height - PADDING * 2)
  }));

  return (
    <View style={styles.wrapper}>
      <View
        style={styles.canvas}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        {width > 0 && height > 0 && (
          <>
            {points.map((point, index) => {
              const next = points[(index + 1) % 4];

              const dx = next.x - point.x;
              const dy = next.y - point.y;

              const length = Math.hypot(dx, dy);
              const angle = Math.atan2(dy, dx);

              return (
                <View
                  key={`edge-${index}`}
                  pointerEvents="none"
                  style={[
                    styles.edge,
                    {
                      width: length,
                      left: (point.x + next.x) / 2 - length / 2,
                      top: (point.y + next.y) / 2 - 1,
                      transform: [
                        { rotate: `${angle}rad` }
                      ]
                    }
                  ]}
                />
              );
            })}

            {points.map((point, index) => (
              <View
                key={`vertex-${index}`}
                pointerEvents="none"
                style={[
                  styles.vertex,
                  {
                    left: point.x - HANDLE_RADIUS,
                    top: point.y - HANDLE_RADIUS
                  },
                  selected === index && styles.vertexSelected
                ]}
              >
                <Text style={styles.vertexLabel}>
                  {LABELS[index]}
                </Text>
              </View>
            ))}
          </>
        )}
      </View>

      <Text style={styles.instructions}>
        Arrastra los puntos para modificar la geometría
        de la superficie.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12
  },
  canvas: {
    width: "100%",
    aspectRatio: 1.25,
    borderRadius: 18,
    backgroundColor: colors.navyDeep,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden"
  },
  edge: {
    position: "absolute",
    height: 2,
    backgroundColor: colors.primaryLight
  },
  vertex: {
    position: "absolute",
    width: HANDLE_RADIUS * 2,
    height: HANDLE_RADIUS * 2,
    borderRadius: HANDLE_RADIUS,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  vertexSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.white
  },
  vertexLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: colors.navyDeep
  },
  instructions: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    color: colors.textDarkSecondary
  }
});

