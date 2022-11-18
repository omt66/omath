
export class Matrix {
    // First initializations to keep the TS transpiler happy in strict mode!
    private _data: number[][] = [[0]]
    rows: number = 1
    cols: number = 1

    constructor(props: { rows?: number, cols?: number, initial?: number, data?: number[][] }) {
        let { cols = 2, rows = 2, initial = 0, data } = props

        if (data) {
            this.setData(data)
            return
        }

        this.rows = rows
        this.cols = cols
        this.fill(initial)
    }

    private setData(data: number[][]): void {
        this._data = data
        this.rows = data.length
        this.cols = data[0].length
    }

    get data() {
        return this._data
    }

    set data(data) {
        this.setData(data)
    }


    //#region --- Matrix operations ---
    fill(n: number): void {
        this._data = []
        for (let r = 0; r < this.rows; r++) {
            this._data[r] = []
            for (let c = 0; c < this.cols; c++) {
                this._data[r].push(n)
            }
        }
    }

    randomize(min = -1, max = 1): void {
        this._data = []
        for (let r = 0; r < this.rows; r++) {
            this._data[r] = []
            for (let c = 0; c < this.cols; c++) {
                let rndVal = min + (max - min) * Math.random()
                this._data[r].push(rndVal)
            }
        }
    }

    clone(): Matrix {
        let dstr = JSON.stringify(this.data)
        let data = JSON.parse(dstr)
        return new Matrix({ data })
    }

    serialize(): string {
        return this.toString()
    }
    
    toString(): string {
        return JSON.stringify(this)
    }

    add(other: Matrix | number): Matrix {
        if (typeof other === "number") {
            // scalar
            let m = this.clone()
            m.update(v => v + other)
            return m
        }

        if (this.rows !== other.rows || this.cols !== other.cols) {
            throw new Error(ERROR.MATRIX_DIMENSIONS)
        }

        let result = new Matrix({ rows: this.rows, cols: this.cols })

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                result.data[r][c] = this.data[r][c] + other.data[r][c]
            }
        }

        return result
    }

    sub(other: Matrix | number): Matrix {
        if (typeof other === "number") {
            // scalar
            let m = this.clone()
            m.update(v => v - other)
            return m
        }

        if (this.rows !== other.rows || this.cols !== other.cols) {
            throw new Error(ERROR.MATRIX_DIMENSIONS)
        }

        let result = new Matrix({ rows: this.rows, cols: this.cols })

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                result.data[r][c] = this.data[r][c] - other.data[r][c]
            }
        }

        return result
    }

    mul(other: Matrix | number): Matrix {
        if (typeof other === "number") {
            // scalar
            let m = this.clone()
            m.update(v => v * other)
            return m
        }

        if (this.cols !== other.rows) {
            throw new Error(ERROR.MATRIX_DIMENSIONS)
        }

        let rows = this.rows
        let cols = other.cols
        // let result = new Matrix({ rows: this.rows, cols: other.cols })
        let result = new Matrix({ cols, rows })

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let sum = 0
                for (let k = 0; k < other.rows; k++) {
                    sum += this.data[r][k] * other.data[k][c]
                }
                result.data[r][c] = sum
            }
        }

        return result
    }


    /**
     * Inverse of the matrix by using Gaussian elimination.
     * https://en.wikipedia.org/wiki/Invertible_matrix#Gaussian_elimination
     */
    inverse(): Matrix {
        if (this.cols !== this.rows) {
            throw new Error(ERROR.MATRIX_MUST_BE_SQUARE)
        }

        let dim = this.rows
        let mi = Matrix.identity(dim)
        let mc = Matrix.clone(this)

        for (let i = 0; i < dim; i += 1) {
            let val = mc.data[i][i]

            if (val == 0) {
                for (let ii = i + 1; ii < dim; ii += 1) {
                    if (mc.data[ii][i] != 0) {
                        for (let j = 0; j < dim; j++) {
                            val = mc.data[i][j]
                            mc.data[i][j] = mc.data[ii][j]
                            mc.data[ii][j] = val
                            val = mi.data[i][j]
                            mi.data[i][j] = mi.data[ii][j]
                            mi.data[ii][j] = val
                        }
                        break
                    }
                }
                val = mc.data[i][i]
                if (val == 0) {
                    // Matrix is singular, therefore not invertable!
                    throw new Error(ERROR.MATRIX_IS_SINGULAR)
                }
            }

            for (let j = 0; j < dim; j++) {
                mc.data[i][j] = mc.data[i][j] / val
                mi.data[i][j] = mi.data[i][j] / val
            }

            for (let ii = 0; ii < dim; ii++) {
                if (ii == i) {
                    continue
                }
                val = mc.data[ii][i]
                for (let j = 0; j < dim; j++) {
                    mc.data[ii][j] -= val * mc.data[i][j]
                    mi.data[ii][j] -= val * mi.data[i][j]
                }
            }
        }

        return mi
    }

    determinant(): number {
        if (this.cols !== this.rows) {
            throw new Error(ERROR.MATRIX_MUST_BE_SQUARE)
        }

        let calculate = (data: number[][]): number =>
            data.length === 1
                ? data[0][0]
                : data.length === 2
                    ? data[0][0] * data[1][1] - data[1][0] * data[0][1]
                    : data[0].reduce((acc, cur, i) => acc + (-1) ** (i + 2) * cur * calculate(data.slice(1).map(c => c.filter((_, j) => i != j))), 0)

        return calculate(this._data)
    }

    square(): Matrix {
        return this.mul(this)
    }

    transpose(): Matrix {
        let t = new Matrix({ rows: this.cols, cols: this.rows })
        t.update((_, row, col) => this.data[col][row])
        return t
    }

    update(cb: (val: number, row: number, col: number) => number): void {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let val = this._data[r][c]
                this._data[r][c] = cb(val, r, c)
            }
        }
    }

    forEach(cb: (val: number, row: number, col: number) => void): void {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let val = this._data[r][c]
                cb(val, r, c)
            }
        }
    }

    equal(other: Matrix): boolean {
        return this.approximatelyEqual(other, 0)
    }

    equala(other: Matrix, tolerance = 0.001): boolean {
        return this.approximatelyEqual(other, tolerance)
    }

    approximatelyEqual(other: Matrix, tolerance = 0.001): boolean {
        let r1 = this.rows
        let c1 = this.cols
        let r2 = other.rows
        let c2 = other.cols

        if (r1 !== r2 || c1 !== c2) {
            throw new Error(ERROR.MATRIX_DIMENSIONS)
        }

        for (let r = 0; r < r1; r++) {
            for (let c = 0; c < c1; c++) {
                if (Math.abs(this.data[r][c] - other.data[r][c]) > tolerance) {
                    return false
                }
            }
        }

        return true
    }
    //#endregion

    //#region --- Static Methods ---
    static zeros(rows: number, cols?: number) {
        if (!cols) cols = rows
        return new Matrix({ rows, cols, initial: 0 })
    }

    static ones(rows: number, cols?: number) {
        if (!cols) cols = rows
        return new Matrix({ rows, cols, initial: 1 })
    }

    static random(rows: number, cols?: number) {
        if (!cols) cols = rows
        let m = new Matrix({ rows, cols })
        m.randomize()
        return m
    }

    static square(matrixOrRawData: Matrix | number[][]): Matrix {
        let m: Matrix

        if (matrixOrRawData instanceof Matrix) {
            m = matrixOrRawData.square()
        }
        else {
            m = new Matrix({ data: matrixOrRawData }).square()
        }

        return m
    }

    /**
     * Creates an identity matrix (nxn square matrix with 1s on the diagonal and 0s elsewhere)
     * @param n 
     * @returns 
     */
    static identity(n: number): Matrix {
        let matrix = new Matrix({ cols: n, rows: n, initial: 0 })
        for (let i = 0; i < n; i++) {
            matrix._data[i][i] = 1
        }
        return matrix
    }

    static clone(matrix: Matrix): Matrix {
        return matrix.clone()
    }

    static create(data: number[][]): Matrix {
        return new Matrix({ data })
    }

    static serialize(matrix: Matrix): string {
        return matrix.serialize()
    }

    static deserialize(jsonStr: string): Matrix {
        let rawMatrix = JSON.parse(jsonStr)
        let matrix = new Matrix({ data: rawMatrix._data })
        return matrix
    }
    //#endregion

}

//--- Error Messages ---
export const ERROR = {
    MATRIX_DIMENSIONS: "Matrix dimensions do not match!",
    MATRIX_MUST_BE_SQUARE: "Matrix must be a square matrix!",
    MATRIX_IS_SINGULAR: "Matrix is singular!",
}
