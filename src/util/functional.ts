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

export async function safePromise<T>(promise: Promise<T>): Promise<[T, null] | [null, Error]> {
  try {
    const data = await promise
    return [data, null]

  } catch (error: any) {

    return [null, error]
  }
}

export function safeJsonParse<T = any>(str: string | null): T | null {
  if (!str) {
    return null
  }

  try {
    return JSON.parse(str) as T
  } catch {
    return null
  }
}