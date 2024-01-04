const styles = {
    '@keyframes softBlink': {
        '0%, 20%, 40%, 60%, 80%, 100%': {
          opacity: 1,
        },
        '10%, 30%, 50%, 70%, 90%': {
          opacity: 0,
        },
    },

    layout:{
        display: 'flex',
        alignItems: 'stretch',
        gap:"20px",
        "&>.game":{
            position:"relative",
            width:'fit-content',
            "&>.overlay":{
                position:"absolute",
                top:'0px',
                left:"0px",
                zIndex:"1",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width:"100%",
                height:"100%",
                "&>.signboard":{
                    padding:"10px",
                    border:"3px solid #ddd",
                    textAlign:"center",
                    color:"#ddd",
                    backgroundColor:"rgba(255,255,255,0.3)",
                    borderRadius:"5px"
                }
            }
        },
        "&>.stats":{
            border:'1px solid #ddd',
            padding:"20px",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap:'20px',
            "&>.controls":{
                fontSize:"0.5em",
                textAlign:'left',
                flexGrow:"1",
                display: 'flex',
                alignItems: 'flex-end',
                "&>table":{
                    "&>tbody":{
                        paddingTop:"10px",
                        "& td":{
                            "&:first-child":{
                                backgroundColor:"#fff",
                                color:"#282c34",
                                borderRadius:"2px",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width:"15px",
                                height:"15px",
                            }
                        }
                    }
                }
            }
        }
    },
    container:{
        borderTop:"1px solid #aaa",
        borderLeft:"1px solid #aaa",
        overflow:"hidden",
        "&.paused":{
            opacity:"0.4"
        },
        "&>.row":{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            "&.complete":{
                animation: '$softBlink 1s infinite',
            },
            "&>.number":{
                width:'20px',
                height:'20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize:"0.7em",
                fontFamily:"monospace"
            }
        },
        "& .cell":{
            width:'20px',
            height:'20px',
            borderRight:"1px solid #aaa",
            borderBottom:"1px solid #aaa",
            position:"relative",
            "&>.activeRange":{
                position:"absolute",
                bottom:"0px",
                left:"0px",
                display: 'flex',
                flexDirection: 'column',
                gap:'1px',
                zIndex:"1",
                "&>.minosRow":{
                    display: 'flex',
                    gap:'1px',
                    "&>.minosCell":{
                        width:"20px",
                        height:"20px",
                        "&.active":{
                            backgroundColor:"#ccc"
                        }
                    }
                }
                
            },
            "&.negative":{
                borderRight:"1px solid red",
                borderBottom:"1px solid red",
                "&.active":{
                    backgroundColor:"red"
                }
            },
            "&.active":{
                backgroundColor:"#aaa"
            }
        }
    },
    nextPreview:{
        borderTop:"1px solid #ccc",
        borderLeft:"1px solid #ccc",
        "&>.minosRow":{
            display:"flex",
            "&>.minosCell":{
                width:'20px',
                height:'20px',
                borderRight:"1px solid #ccc",
                borderBottom:"1px solid #ccc",
                "&.active":{
                    backgroundColor:"#ccc"
                }
            }
        }
    }
}

export default styles