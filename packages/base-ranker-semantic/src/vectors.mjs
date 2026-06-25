// Vector helpers. Strict and conservative: a "vector" is a non-empty array of finite numbers.
// Anything else is not a vector, and the ranker treats it as "no signal" rather than guessing.

import { VectorDimensionError } from "./errors.mjs";

export function vectorFrom(value) {
  return Array.isArray(value) && value.length > 0 && value.every((n) => typeof n === "number" && Number.isFinite(n))
    ? value
    : null;
}

// Like `vectorFrom`, but throws a typed error instead of returning null. Use where an empty or
// malformed vector is a contract violation that must surface (e.g. a provider response).
export function assertVector(value, label = "value") {
  const vector = vectorFrom(value);
  if (!vector) throw new VectorDimensionError(`${label} is not a non-empty numeric vector.`);
  return vector;
}

export function cosineSimilarity(a, b) {
  const left = vectorFrom(a);
  const right = vectorFrom(b);
  if (!left || !right || left.length !== right.length) return null;

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index++) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }
  if (leftNorm === 0 || rightNorm === 0) return null;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}
