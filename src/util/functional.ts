export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function scaleValue(minValue: number, maxValue: number, scale: number): number {
  return minValue + (maxValue - minValue) * scale
}

export function roundDimension(value: number, dimension: number = 2): number {
  const factor = Math.pow(10, dimension)
  return Math.round(value * factor) / factor
}

export async function safePromise<T>(promise: Promise<T>): Promise<T | Error> {
  try {
    return await promise
  } catch (error: any) {
    return error
  }
}