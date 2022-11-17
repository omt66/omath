import { expect, test, describe } from "vitest"
import { Matrix } from "./matrix"

describe("Matrix tests", () => {
    test("rows & cols", () => {
        let m1 = new Matrix({ rows: 2, cols: 3 })
        let m2 = new Matrix({ data: [[1, 2], [3, 4], [5, 6]] })

        expect(m1.rows).toBe(2)
        expect(m1.cols).toBe(3)

        expect(m2.rows).toBe(3)
        expect(m2.cols).toBe(2)
    })

    test("zero matrix 2x3", () => {
        let m = Matrix.zero(2, 3)
        expect(m.data).toStrictEqual([
            [0, 0, 0],
            [0, 0, 0]
        ])
    })

    test("one matrix 3x3", () => {
        let m = Matrix.one(3, 3)
        expect(m.data).toStrictEqual([
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ])
    })

    test("identity matrix 4x4", () => {
        let m = Matrix.identity(4)
        expect(m.data).toStrictEqual([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ])
    })

    test("fill with 5s 2x3", () => {
        let m = new Matrix({ rows: 2, cols: 3 })
        m.fill(5)
        expect(m.data).toStrictEqual([
            [5, 5, 5],
            [5, 5, 5]
        ])
    })

    test("create from raw data", () => {
        let data = [[1, 2, 3], [4, 5, 6]]
        let m = new Matrix({ data })
        expect(m.data).toStrictEqual([
            [1, 2, 3],
            [4, 5, 6]
        ])
    })

    test("serialize/deserialize", () => {
        let data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        let m1 = new Matrix({ data })
        let m2 = Matrix.deserialize(Matrix.serialize(m1))

        expect(m2.data).toStrictEqual([
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ])
    })

    test("clone", () => {
        let data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        let m1 = new Matrix({ data })
        let m2 = m1.clone()

        m1.data[0][1] = 0
        m2.data[1][0] = 0

        expect(m1.data).toStrictEqual([
            [1, 0, 3],
            [4, 5, 6],
            [7, 8, 9]
        ])

        expect(m2.data).toStrictEqual([
            [1, 2, 3],
            [0, 5, 6],
            [7, 8, 9]
        ])
    })

    test("additions 1", () => {
        let m1 = new Matrix({ rows: 2, cols: 2, initial: 3 })
        let m2 = new Matrix({ rows: 2, cols: 2, initial: 4 })
        let m3 = m1.add(m2)

        expect(m3.data).toStrictEqual([
            [7, 7],
            [7, 7],
        ])
    })

    test("additions 2", () => {
        let m1 = new Matrix({ data: [[1, 2], [3, 4]] })
        let m2 = new Matrix({ data: [[5, 6], [7, 8]] })
        let m3 = m1.add(m2)

        expect(m3.data).toStrictEqual([
            [6, 8],
            [10, 12],
        ])
    })

    test("transpose ", () => {
        let m = new Matrix({ data: [[1, 2, 3], [4, 5, 6]] })
        let t = m.transpose()

        expect(m.data).toStrictEqual([
            [1, 2, 3],
            [4, 5, 6]
        ])

        expect(t.data).toStrictEqual([
            [1, 4],
            [2, 5],
            [3, 6]
        ])
    })

    test("inverse 1", () => {
        let m = new Matrix({ data: [[1, 2], [3, 4]] })
        let i = m.inverse()

        expect(i.data).toStrictEqual([
            [-2, 1],
            [1.5, -0.5],
        ])
    })

    test("inverse 2", () => {
        let m1 = new Matrix({ data: [[7, 2, 1], [0, 3, -1], [-3, 4, -2]] })
        let m2 = m1.inverse()
        let m3 = new Matrix({ data: [[-2, 8, -5], [3, -11, 7], [9, -34, 21]] })

        // Approximately equal!
        expect(m2.approximatelyEqual(m3)).toBe(true)
    })

    test("equal", () => {
        let m1 = new Matrix({ data: [[1, 2, 3], [4, 5, 6]] })
        let m2 = new Matrix({ data: [[1, 2, 3], [4, 5, 6]] })
        expect(m1.equal(m2)).toBe(true)
    })

    test("result should be an identity matrix (AxA^-1 = I)", () => {
        let m1 = new Matrix({ data: [[1, 2, 0], [-2, 5, -1], [-3, -6, 4]] })
        let m2 = m1.inverse()
        let m3 = m1.mul(m2)
        let m4 = new Matrix({ data: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] })

        // Approximately equal!
        expect(m3.approximatelyEqual(m4)).toBe(true)
    })

    test("singular matrix", () => {
        let m1 = new Matrix({ data: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] })
        expect(() => m1.inverse()).toThrow("Matrix is singular, therefore not invertable!")
    })

    test("determinant", () => {
        let m = new Matrix({ data: [[1, 2], [3, 4]] })
        let d = m.determinant()
        expect(d).toBe(-2)
    })
}) 
