const fmap = new WeakMap()

type ComposeFunctions<T extends (...args: any) => any> = (T extends any
  ? T extends (...args: any) => infer U
    ? U extends Promise<any>
      ? (func: () => U) => Promise<void>
      : (func: () => U) => void
    : never
  : never)[]

export const inject = <T extends (...args: any) => any>(f: T, gs: ComposeFunctions<T>) => {
  const composedFunction = (...args: Parameters<T>): ReturnType<T> => {
    const argFunc: () => ReturnType<T> = () => f(...args)
    let gsStack = gs.concat([])
    let composedFunc = argFunc
    while (gsStack.length > 0) {
      const firstFunc = gsStack.shift()
      if (!firstFunc) break
      const innerFunc = composedFunc
      composedFunc = () => {
        const innerResult: { result: ReturnType<T> | undefined } = { result: undefined }
        const result = firstFunc(() => {
          innerResult.result = innerFunc()
          return innerResult.result
        })
        if (result instanceof Promise) {
          return result.then(() => innerResult.result) as ReturnType<T>
        } else {
          return innerResult.result as ReturnType<T>
        }
      }
    }
    return composedFunc()
  }
  fmap.set(f, composedFunction)
}

export const wrapped = <T extends (...args: any) => any>(f: T) => (fmap.has(f) ? fmap.get(f) : f) as T
