
/**
 * Tipos comunes del sistema Projection Mapping.
 *
 * Estas definiciones son independientes del frontend,
 * backend y motor de proyección.
 */

/** Identificador único de una entidad. */
export type UUID = string;

/** Fecha y hora en formato ISO 8601 (UTC). */
export type ISODateString = string;

/**
 * Coordenada normalizada.
 * Debe encontrarse en el intervalo [0, 1].
 *
 * El tipo representa un número; la validación
 * del intervalo se realizará mediante Zod.
 */
export type NormalizedCoordinate = number;

/**
 * Punto bidimensional.
 *
 * El origen (0, 0) se encuentra en la esquina
 * superior izquierda del área de proyección.
 *
 * x aumenta hacia la derecha.
 * y aumenta hacia abajo.
 */
export interface Point {
  x: NormalizedCoordinate;
  y: NormalizedCoordinate;
}

/**
 * Cuatro vértices que delimitan una superficie.
 *
 * El orden de los puntos es obligatorio:
 *
 * 0: superior izquierdo
 * 1: superior derecho
 * 2: inferior derecho
 * 3: inferior izquierdo
 *
 * Las posiciones representan las esquinas
 * correspondientes de la imagen de origen.
 * La superficie proyectada puede estar
 * deformada o rotada.
 */
export type Quad = [
  topLeft: Point,
  topRight: Point,
  bottomRight: Point,
  bottomLeft: Point
];

/**
 * Dimensiones en píxeles de un recurso
 * multimedia o área de visualización.
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Propiedades temporales comunes de
 * las entidades persistidas.
 */
export interface Timestamps {
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
