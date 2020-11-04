import { inject, wrapped } from './simple-wrapper'

const f = (a: number, b: number) => a + b

const g1 = (f: () => number) => {
  const a = f()
  console.log('sqrt:', Math.sqrt(a))
}

const g2 = (f: () => number) => {
  const a = f()
  console.log('square:', a * a)
}

inject(f, [g1, g2])

const h = wrapped(f)

console.log('result', h(1, 2))

console.log('----')

const af = (a: number, b: number) => Promise.resolve(a + b)

// -> type error
// inject(af, [g1, g2])

const ag1 = async (f: () => Promise<number>) => {
  h(1, 2)
  const a = await f()
  console.log('sqrt:', Math.sqrt(a))
}

const ag2 = async (f: () => Promise<number>) => {
  const a = await f()
  console.log('square:', a * a)
}

inject(af, [ag1, ag2])

const ah = wrapped(af)

const main = async () => {
  console.log('result', await ah(2, 3))
}
main()
