import React, { Component } from 'react'
import {withStyles} from "react-jss"
import tetrominos from "./tetrominos"
import styles from '../styles/style'
import _ from "lodash"

const getRandomMinos = () => {
    let calculatedSpawnRates = []
    Object.keys(tetrominos).map((type)=>{
        let i = 0
        while(i < tetrominos[type].rate) {
            calculatedSpawnRates.push(type)
            i++
        }
    })
    let randomIndex = Math.floor(Math.random() * calculatedSpawnRates.length);
    let randomMinosType = calculatedSpawnRates[randomIndex]
    let randomRotationIndex = Math.floor(Math.random() * tetrominos[randomMinosType].rotation.length);
    return {type:randomMinosType, rotation:randomRotationIndex}
}


class Main extends Component {
    constructor(props) {
        super(props)
        this.initialState = {
            gridSize:[8, 20],
            cursorPosition:[2, -1],
            currentMinos:{
                type:"I",
                rotation:0
            },
            nextMinos:null,
            occupiedCells:[],
            isPaused:false,
            isGameOver:false,
            lockControl:false,
            score:0,
            level:1,
        }

        this.state = this.initialState
        // this.state.currentMinos = getRandomMinos()
        this.state.nextMinos = getRandomMinos()
    }

    componentDidMount(){
        this.interval = setInterval(this.intervalChange, 1000)  
        document.addEventListener("keydown", this.control)
    }

    

    intervalChange = () => {
        if (!this.state.isPaused && !this.state.isGameOver) {
            if (this.state.occupiedCells.filter(ocCell=>ocCell.endsWith(",0")).length > 0) {
                this.setState({
                    isGameOver:true
                })
            } else {
                if (this.state.cursorPosition[1] !== this.state.gridSize[1] - 1) {
                    let currentMatrixSize = tetrominos[this.state.currentMinos.type]?.size || null
                    let currentRowSize = currentMatrixSize[0] || 0
                    let currentMatrix = _.flatten(tetrominos[this.state.currentMinos.type].rotation[this.state.currentMinos.rotation])
                    let nextMatrixLocation = [
                        this.state.cursorPosition[0],
                        this.state.cursorPosition[1] - (currentRowSize - 2)
                    ]
                    let nextMatrix = this.getOccupiedCellsFromMatrix(nextMatrixLocation, currentMatrixSize)

                    if (!this.checkCollision(currentMatrix, nextMatrix)) {
                        let nextPosition = [
                            this.state.cursorPosition[0],
                            this.state.cursorPosition[1] + 1
                        ]
                        this.setState({
                            cursorPosition:nextPosition
                        })
                    } else {
                        let lastPosition = this.state.cursorPosition
                        this.registerOccupiedCellAndReset(lastPosition)
                    }
                    
                } else {
                    this.registerOccupiedCellAndReset(this.state.cursorPosition)
                }   
            }
        }
    }

    control = (event) => {
        if (!this.state.isGameOver && !this.state.lockControl && event.keyCode !== 80) {
            if (event.keyCode === 65 && this.state.cursorPosition[0] > 0) { // MOVE LEFT [A]
                let currentSize = tetrominos[this.state.currentMinos.type]?.size || null
                let currentRowSize = currentSize[0]|| 0
                let currentMatrix = _.flatten(tetrominos[this.state.currentMinos.type].rotation[this.state.currentMinos.rotation])
                let nextMatrixLocation = [
                    this.state.cursorPosition[0] - 1,
                    this.state.cursorPosition[1] - (currentRowSize - 1)
                ]
                let nextMatrix = this.getOccupiedCellsFromMatrix(nextMatrixLocation, currentSize)

                if (!this.checkCollision(currentMatrix, nextMatrix)) {
                    this.setState({
                        cursorPosition:[
                            this.state.cursorPosition[0] - 1,
                            this.state.cursorPosition[1]
                        ]
                    })
                }
                
            } else if (event.keyCode === 68 && this.state.cursorPosition[0] < this.state.gridSize[0] - 1) { //MOVE RIGHT [D]
                let columnTolerance = 0
                let lastRigidColumn = []
                let nextShiftingLocation = [0, -1]
                let currentSize = tetrominos[this.state.currentMinos.type]?.size || null
                let currentRowSize = currentSize[0] || 0
                let currentColumnSize = currentSize[1] || 0
                let allowShifting = true
                
                //get column tolerancy
                if (currentColumnSize > 0) {
                    let i = currentColumnSize - 1
                    while(i > 0) {
                        let currentColumn = []
                        tetrominos[this.state.currentMinos.type].rotation[this.state.currentMinos.rotation].map(row=>{
                            currentColumn.push(row[i])
                        })
                        if (currentColumn.every(el=>el === 0)) {
                            columnTolerance++
                        }
                        i--
                    }
                }

                //get last rigid column
                tetrominos[this.state.currentMinos.type].rotation[this.state.currentMinos.rotation].map(row=>{
                    lastRigidColumn.push(row[currentColumnSize - 1 - columnTolerance])
                })

                //get next shifting location
                nextShiftingLocation = [
                    this.state.cursorPosition[0] + (currentColumnSize - columnTolerance),
                    this.state.cursorPosition[1] - (currentRowSize - 1)
                ]

                //check for collision
                if (nextShiftingLocation[0] > this.state.gridSize[0] - 1) {
                    allowShifting = false
                    console.log("out of bound")
                } else {
                    let currentMatrix = _.flatten(tetrominos[this.state.currentMinos.type].rotation[this.state.currentMinos.rotation])
                    let nextMatrixLocation = [
                        this.state.cursorPosition[0] + 1,
                        nextShiftingLocation[1]
                    ]
                    let nextMatrix = this.getOccupiedCellsFromMatrix(nextMatrixLocation, currentSize)

                    if (this.checkCollision(currentMatrix, nextMatrix)) {
                        allowShifting = false
                        // console.log("obstacle found")
                    }
                }

                if (allowShifting) {
                    this.setState({
                        cursorPosition:[
                            this.state.cursorPosition[0] + 1,
                            this.state.cursorPosition[1]
                        ]
                    })
                }
            } else if (event.keyCode === 83) { // [S] PUSH DOWN
                let currentSize = tetrominos[this.state.currentMinos.type]?.size || null
                let currentRowSize = currentSize[0] || 0
                let currentColumnSize = currentSize[1] || 0
                let lastStop = null
                let i = this.state.cursorPosition[1]
                while(i <= (this.state.gridSize[1] - 1)) {
                        let currentMatrix = _.flatten(tetrominos[this.state.currentMinos.type].rotation[this.state.currentMinos.rotation])
                        let nextMatrixLocation = [
                            this.state.cursorPosition[0],
                            i - (currentRowSize - 2)
                        ]
                        let nextMatrix = this.getOccupiedCellsFromMatrix(nextMatrixLocation, currentSize)
                        if (nextMatrix.some(el=>el > 0)) {
                            let isCollided = this.checkCollision(currentMatrix, nextMatrix)
                            if (isCollided && lastStop === null) {
                                lastStop = [this.state.cursorPosition[0], i]
                                console.log("collision detected at "+i, nextMatrix)
                                i++
                            } else {
                                i++
                                if (lastStop === null) {
                                    console.log("no collision detected, next : "+i) 
                                }
                               
                            }
                        } else {
                            i++
                            if (lastStop === null) {
                                console.log("nothing will collide, next : "+i)
                            }
                        }
                }
                if (!lastStop) {
                    lastStop = [this.state.cursorPosition[0], this.state.gridSize[1] - 1]
                }
                console.log("--------")
                this.registerOccupiedCellAndReset(lastStop)
            } else if (event.keyCode === 87) { // [W] ROTATE
                let currentMatrixSize = tetrominos[this.state.currentMinos.type]?.size || null
                let currentRowSize = currentMatrixSize[0] || 0
                let allowRotation = true
                let shiftLeft = 0
                let minosRotations = tetrominos[this.state.currentMinos.type].rotation.length || null
                let nextRotation = this.state.currentMinos.rotation < minosRotations - 1 ? this.state.currentMinos.rotation + 1 : 0
                let nextRotationMatrix = tetrominos[this.state.currentMinos.type]?.rotation[this.state.currentMinos.rotation] || null
                let nextMatrixLocation = [
                    this.state.cursorPosition[0],
                    this.state.cursorPosition[1] - (currentRowSize - 1)
                ]
                let occupiedCellsWithinCurrentPosition = this.getOccupiedCellsFromMatrix(nextMatrixLocation, currentMatrixSize)

                if (occupiedCellsWithinCurrentPosition.some(el=>el > 0)) {
                    if (this.checkCollision(occupiedCellsWithinCurrentPosition, nextRotationMatrix)) {
                        allowRotation = false
                    }
                } 
                if (nextMatrixLocation[0] < 0 || (this.state.cursorPosition[0] + currentMatrixSize[1]) > (this.state.gridSize[0])) {
                    allowRotation = false
                }


                if (minosRotations && allowRotation) {
                    this.setState({
                        currentMinos:{
                            ...this.state.currentMinos,
                            rotation:nextRotation
                        }
                    })
                }
            }
        } 
        if (event.keyCode === 80) {
            this.setState({
                isPaused : !this.state.isPaused
            })
        }
    }

    registerOccupiedCellAndReset = (position) => {
        let newCells = []
        let positions = []
        let currentMatrix = _.flatten(tetrominos[this.state.currentMinos.type].rotation[this.state.currentMinos.rotation])
        let rowSize = tetrominos[this.state.currentMinos.type]?.size[0] || 0
        let columnSize = tetrominos[this.state.currentMinos.type]?.size[1] || 0
        let anchorPosition = [
            position[0],
            position[1] - (rowSize - 1)
        ]
        let i = 0
        while(i < columnSize) {
            let j = 0
            while(j < rowSize){
                positions.push([
                    anchorPosition[0] + j,
                    anchorPosition[1] + i
                ])
                j++
            }
            i++
        }

        positions.map((pos, idx)=>{
            if (currentMatrix[idx] === 1){
                newCells.push(pos.join(","))
            }
            return null
        })

        // console.log("positions",newCells)
        // console.log("newCells",newCells)
        let newOccupiedCells = [
            ...this.state.occupiedCells,
            ...newCells
        ]
        this.setState({
            ...this.initialState,
            lockControl:true,
            currentMinos:this.state.nextMinos,
            nextMinos:getRandomMinos(),
            score:this.state.score + 1,
            occupiedCells:newOccupiedCells,
            ...(newOccupiedCells.filter(el=>el.endsWith(",0")).length > 0 ?{isGameOver:true}:{})
        },()=>{
            setTimeout(()=>this.checkCompleteLine(), 500)
            
        })
    }

    checkCompleteLine = () => {
        let i = this.state.gridSize[1] - 1
        let j = this.state.gridSize[1] - 1
        let completeLines = []
        let newOccupiedCells = [...this.state.occupiedCells]
        let newShiftedCells = []

        //find occupied cell
        while(i > 0) {
            let isLineComplete = this.state.occupiedCells.filter((ocCell)=>ocCell.endsWith(","+i)).length === this.state.gridSize[0]
            if (isLineComplete) {
                completeLines.push(i)
            }
            i--
        }
        
        //delete occupied cell
        completeLines.map(lineIndex=>{
            newOccupiedCells = newOccupiedCells.filter(ocCell=>!ocCell.endsWith(","+lineIndex))
            return false
        })

        console.log("cl", completeLines)

        // //shift down
        if (newOccupiedCells.length > 0) {
            while(j > 0) {
                let currentOccupiedLines = newOccupiedCells.filter(ocCell=>ocCell.endsWith(","+j))
                if (j < this.state.gridSize[1]) {
                    if (currentOccupiedLines.length > 0) {
                        let shiftLength = 0
                        let k = j
                        while(k < this.state.gridSize[1] - 1 && newShiftedCells.filter(ocCell=>ocCell.endsWith(","+(k + 1))).length === 0) {
                            k++
                            shiftLength++
                        }
                        newShiftedCells = [
                            ...newShiftedCells,
                            ...currentOccupiedLines.map(cell=>{
                                let realCell = cell.split(",").map(el=>parseInt(el))
                                realCell[1] = realCell[1] + shiftLength
                                return realCell.join(",")
                            })
                        ]
                    }
                }
                j--
            }
        }

        // console.log("newShiftedCells", newShiftedCells)
        

        this.setState({
            ...((completeLines.length > 0 && newShiftedCells.length > 0)
                    ?{occupiedCells:newShiftedCells}
                    :completeLines.length > 0 ? {occupiedCells:newOccupiedCells} :{}
            ),
            score:this.state.score + (10 * completeLines.length),
            lockControl:false
        })
    }

    checkCollision = (currentMatrix, nextMatrix) => {
        let isCollided = false
        if (currentMatrix.length === nextMatrix.length) {
            let collisionCheck = currentMatrix.map((cm_el, index)=>{
                return cm_el + nextMatrix[index]
            })

            if (!collisionCheck.every(el=>el<2)) {
                isCollided = true
            }
        } else {
            console.log("matrix size mismatch", {
                currentMatrix, nextMatrix
            })
            isCollided = true
        }
        return isCollided
    }

    resetGame = () => {
        this.setState({
            ...this.initialState
        })
    }

    drawMinos = (minos) => {
        let rows = []
        let minosMatrix = tetrominos[minos.type]?.rotation[minos.rotation] || null
        if (minosMatrix) {
            rows = minosMatrix.map((row, rowIndex)=>{
                return <div className='minosRow' key={"minos-y-"+rowIndex}>
                    {row.map((cell, cellIndex)=>{
                        return <div className={'minosCell '+(cell?"active":"")} key={"minos-x-"+cellIndex}></div>
                    })}
                </div>
            })
        }
        
        return rows
    }

    getOccupiedCellsFromMatrix = (anchorPos, matrixSize) => {
        let matrix = []
        let j = 0
        while(j < matrixSize[1]) {
            let k = 0
            let row = []
            while(k < matrixSize[0]) {
                if (this.isOccupied([
                    anchorPos[0] + k,
                    anchorPos[1] + j
                ])) {
                    row.push(1)
                } else {
                    row.push(0)
                }
                k++
            }
            matrix = [...matrix, ...row]
            j++
        }

        return matrix
    }
    

    isInPosition = (currentCell, position) => {
        return currentCell[0] === position[0] && currentCell[1] === position[1]
    }

    isOccupied = (position) => {
        return this.state.occupiedCells.includes(position.join(","))
    }

    render() {
        const {classes} = this.props
        return (
        <div className={classes.layout}>
            <div className='game'>
                {(this.state.isGameOver || this.state.isPaused) &&<div className="overlay">
                    <div className="signboard">
                        {this.state.isGameOver?"GAME OVER":this.state.isPaused?"PAUSED":""}
                    </div>
                </div>}
                <div className={classes.container+((this.state.isGameOver || this.state.isPaused)?" paused":"")}>
                    {/* {[...Array(4)].map((row, yIdx)=><div className='row' key={yIdx - 4}>
                        {[...Array(this.state.gridSize[0])].map((cell, xIdx)=>{
                            let cellPosition = [xIdx, yIdx - 4]
                            let isInPosition = this.isInPosition(cellPosition, this.state.cursorPosition)
                            let isCellActive = this.isOccupied(cellPosition)
                            return <div className={'cell negative '+(isCellActive?"active":"")} key={xIdx}>
                                {isInPosition && <div className="activeRange">
                                    {this.drawActiveRange()}
                                </div>}
                            </div>
                        })}
                    </div>)} */}
                    {[...Array(this.state.gridSize[1])].map((row, yIdx)=>{
                        let isRowComplete = this.state.occupiedCells.filter(el=>el.endsWith(","+yIdx)).length === this.state.gridSize[0]
                        return <div className={'row '+(isRowComplete?"complete":"")} key={yIdx}>
                            {/* <div className='number'>{isRowComplete?"✅":yIdx}</div> */}
                            {[...Array(this.state.gridSize[0])].map((cell, xIdx)=>{
                                let cellPosition = [xIdx, yIdx]
                                let isInPosition = this.isInPosition(cellPosition, this.state.cursorPosition)
                                let isCellActive =  this.isOccupied(cellPosition)
                                return <div className={'cell '+( isCellActive?"active":"")} key={xIdx}>
                                    {isInPosition && <div className="activeRange">
                                        {this.drawMinos(this.state.currentMinos)}
                                    </div>}
                                </div>
                            })}
                        </div>}
                    )}
                </div>
            </div>
            <div className="stats">
                <div style={{width:'100%', margin:"0px 10px", paddingBottom:"20px 0px", borderBottom:"1px solid #ddd"}}>
                    <div>SCORE</div>
                    <div>{this.state.score}</div>
                </div>
                <div>
                    <div style={{fontSize:"0.7em", paddingBottom:"10px"}}>Next</div>
                    <div className={classes.nextPreview}>
                        {this.drawMinos(this.state.nextMinos)}
                    </div>
                </div>
                <button onClick={()=>this.resetGame()}>Reset Game</button>
                <div className="controls">
                    <table>
                        <thead>
                            <tr>
                                <th colSpan={2}>Controls</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>W</td>
                                <td>Rotate</td>
                            </tr>
                            <tr>
                                <td>A</td>
                                <td>Move Left</td>
                            </tr>
                            <tr>
                                <td>S</td>
                                <td>Push Down</td>
                            </tr>
                            <tr>
                                <td>D</td>
                                <td>Move Right</td>
                            </tr>
                            <tr>
                                <td>P</td>
                                <td>Pause / Play</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            
        </div>
        
        )
    }
}



export default withStyles(styles)(Main)