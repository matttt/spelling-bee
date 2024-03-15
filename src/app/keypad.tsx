"use client"
import { CSSProperties, useState, useRef } from 'react'
import { CEL } from './cel'
import { useKeyPress } from 'ahooks';
import SvgIcon from '@mui/material/SvgIcon';
import { useSpring, animated, useSprings } from '@react-spring/web'
import Snackbar from '@mui/material/Snackbar';
import confetti from 'canvas-confetti'
import { useMeasure } from "@uidotdev/usehooks";
import {isMobile} from 'react-device-detect'

import { scoreWord } from './wordList';

const YELLOW = '#F2DB50'

const innerToOuterRadiusRatio = Math.sqrt(3) / 2;

interface PillButtonProps {
    onClick: () => void
    content?: any
    style?: CSSProperties
}

function PillButton({ onClick, content = '', style = {} }: PillButtonProps) {
    return <button onClick={onClick} style={style} className="text-xl rounded-full border py-4 px-6 text-[#363636] border-[#363636] pillButton">{content}</button>
}

interface HexProps {
    x: number;
    y: number;
    r: number;
    c: string;
    letter: string;
    addLetter: (letter: string) => void;
    springs?: any
}

function Hexy({ x, y, r, c, letter, addLetter, springs }: HexProps) {
    let hexPath = "";

    const numPoints = 6;
    for (let i = 0; i <= numPoints + 1; i++) {
        const angle = Math.PI * 2 / numPoints * i;
        const xn = Math.cos(angle) * r;
        const yn = Math.sin(angle) * r;

        hexPath += `${xn}, ${yn} `
    }

    return (
        <g transform={`translate(${x}, ${y})`} style={{ cursor: 'pointer' }} onClick={() => addLetter(letter)} className="">
            <polyline points={hexPath} fill={c} className='shadow-lg transform active:scale-90 active:brightness-95 transition' />
            <animated.text
                x={0}
                y={3}
                fill={"#000"}
                style={{ fontWeight: 'bold', fontSize: `${Math.floor(r*.75)}px`, userSelect: 'none', ...springs }}
                dominantBaseline="middle"
                textAnchor="middle"
                pointerEvents={"none"}
            >{letter}</animated.text>
        </g>
    );

}

interface KeypadProps {
    initOuterLetters: string[]
    centerLetter: string
    curWord: string
    setCurWord: (word: string) => void
    words: string[]
    setWords: (words: string[]) => void
    smartIsMobile: boolean
}
export function Keypad({ smartIsMobile, initOuterLetters, centerLetter, curWord, setCurWord, words, setWords }: KeypadProps) {
    const [hasTyped, setHasTyped] = useState(false)
    const [outerLetters, setOuterLetters] = useState(initOuterLetters)
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>()
    const [snackbarMessage, setSnackbarMessage] = useState<string>('')
    const [scoreText, setScoreText] = useState<number>(0)
    const [congratsText, setCongratsText] = useState<string>("Nice!")
    const [isPanagram, setIsPanagram] = useState<boolean>(false)

    const [ref, { width, height }] = useMeasure();

    const keypadSVGRef = useRef(null);

    function addLetter(letter: string) {
        setHasTyped(true)
        setCurWord(curWord + letter)
    }


    const letterSpans = [];

    for (const [idx, letter] of Object.entries(curWord)) {
        letterSpans.push(<span key={idx} style={{ color: letter === centerLetter ? YELLOW : outerLetters.includes(letter) ? '#000' : '#DCDCDC' }}>{letter}</span>)
    }

    function deleteLetter() {
        setCurWord(curWord.slice(0, -1))
    }

    function shuffleLetters() {
        const newLetters = [...outerLetters];
        for (let i = newLetters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newLetters[i], newLetters[j]] = [newLetters[j], newLetters[i]];
        }
        letterApi.start({
            from: { opacity: 1 },
            to: { opacity: 0 },
            onRest: () => {
                setOuterLetters(newLetters);
                letterApi.start({
                    to: { opacity: 1 }
                })
            }
        })
    }

    const [wordErrorSprings, wordErrorApi] = useSpring(() => ({
        from: { x: 0, },
    }))

    const [wordSuccessSprings, wordSuccessApi] = useSpring(() => ({
        from: { y: 0, opacity: 0 },
    }))

    const [wordSuccessScoreSprings, wordSuccessScoreApi] = useSpring(() => ({
        from: { y: 0, opacity: 0, delay: 250 },
    }))

    const [letterSprings, letterApi] = useSprings(
        6,
        () => ({
            from: { opacity: 1 },
            config: {
                duration: 50
            }
            //   to: { opacity: 1 },
        }),
        []
    )


    const triggerSnackbar = (message: string) => {
        wordErrorApi.start({
            to: [
                { x: -5 },
                { x: 5 },
                { x: -5 },
                { x: 5 },
                { x: -5 },
                { x: 0 }
            ],
            config: {
                duration: 75
            },
            onRest: () => {
                setTimeout(() => setCurWord(""), 250)
            }
        })

        setSnackbarMessage(message)
        setSnackbarOpen(true)
    }


    const handleSnackbarClose = () => {
        setSnackbarOpen(false)
    }

    function submitWord() {
        const letterSet = new Set([...outerLetters, centerLetter])
        let allLettersValid = true
        for (const letter of curWord) {
            if (!letterSet.has(letter)) {
                allLettersValid = false
                break
            }
        }

        if (curWord.length === 0) {
            return
        } else if (!allLettersValid) {
            triggerSnackbar("Bad letters")
            return
        } else if (curWord.length < 4) {
            triggerSnackbar("Too short")
            return
        } else if (!CEL.includes(curWord.toLowerCase())) {
            triggerSnackbar("Not a valid word")
            return
        } else if (!curWord.includes(centerLetter)) {
            triggerSnackbar("Doesn't contain center letter")
            return
        } else if (words.includes(curWord)) {
            triggerSnackbar("You already found this word")
            return
        } else {
            addWord(curWord)
            setCurWord("")
        }

    }


    useKeyPress(['Backspace'], (event) => {
        deleteLetter();
    });

    useKeyPress(['Enter'], (event) => {
        submitWord();
    });

    useKeyPress('abcdefghijklmnopqrstuvwxyz'.split(''), (event) => {
        addLetter(event.key.toUpperCase())
    });

    // @ts-ignore
    const rect = keypadSVGRef?.current?.getBoundingClientRect();


    function addWord(word: string) {
        const score = scoreWord(word, [...outerLetters, centerLetter])
        setScoreText(score)



        const congratsTexts: [string, number][] = [
            ['Great!', 1],
            ['Awesome!', 5],
            ['Incredible!', 6],
            ['Unbelievable!', 7],
            ['Amazing!', 8],
            ['Fantastic!', 10],
            ['Extraordinary!', 12],
            ['Phenomenal!', 14],
            ['Mind-blowing!', 15],
            ['Unreal!', 16],
        ]

        const achievedCongrats = congratsTexts.find(([text, threshold]) => score >= threshold)
        const isPanagram = Array.from(new Set(word.split(''))).length >= 7

        if (achievedCongrats && !isPanagram) {
            setCongratsText(achievedCongrats[0]);
        } else if (isPanagram) {
            setCongratsText("Panagram!");
            setTimeout(() => confetti({ origin: { x: (rect.x + rect.width / 2) / window.innerWidth, y: -.5 }, angle: 270 }), 500)
        }

        setIsPanagram(isPanagram);

        wordSuccessApi.start({
            to: [{ opacity: 1, y: -10 }, { opacity: 0, delay: 500 }],
            from: { y: 0, opacity: 0 },

        })

        wordSuccessScoreApi.start({
            to: [{ opacity: 1, y: -10 }, { opacity: 0, delay: 250 }],
            from: { y: 0, opacity: 0 },
            delay: 250

        })
        setWords([...words, word])
    }


    const svgSideLength = (width||0)*(isMobile ? .9 : .6)


    const R = .14*svgSideLength;
    const r = R * innerToOuterRadiusRatio;
    const spacingFactor = 1.1


    const hexPositions = [
        [0, - r * 2 * spacingFactor],
        [R * 1.5 * spacingFactor, - r * spacingFactor],
        [R * 1.5 * spacingFactor, r * spacingFactor],
        [0, r * 2 * spacingFactor],
        [-R * 1.5 * spacingFactor, r * spacingFactor],
        [-R * 1.5 * spacingFactor, - r * spacingFactor]
    ]


    return (
        <div className="w-full" ref={ref}>
            <div className="flex h-full">
                <div className="grow"></div>
                <div className="flex flex-col h-full">
                    <div className="grow"></div>
                    {!smartIsMobile && <div className="grow"></div>}
                    <div className='flex'>
                        <div className='grow'></div>
                        <animated.div className={`px-3 py-2 border border-gray-300 rounded mx-auto`} style={{ backgroundColor: isPanagram ? YELLOW : 'white', ...wordSuccessSprings }}>{congratsText}</animated.div>
                        <animated.div className='font-bold py-2 px-4' style={wordSuccessScoreSprings}>+{scoreText}</animated.div>
                        <div className='grow'></div>
                    </div>
                    {/* <div className='grow'></div> */}
                    <div className="text-4xl w-full text-center h-10 curWord" style={{ fontWeight: 'bold', color: hasTyped ? "#000" : "#959595" }}>

                        <animated.h1 style={{ ...wordErrorSprings }}><span className='cursor'>{letterSpans}</span>{hasTyped ? "" : "Type or click"}</animated.h1>
                    </div>
                    <svg width={svgSideLength} height={svgSideLength} ref={keypadSVGRef}>
                        <Hexy x={svgSideLength/2} y={svgSideLength/2} r={R} c={YELLOW} letter={centerLetter} addLetter={addLetter} />

                        {hexPositions.map((pos, idx) => {
                            return <Hexy key={idx} x={svgSideLength/2 + pos[0]} y={svgSideLength/2 + pos[1]} r={R} c={"#E6E6E6"} letter={outerLetters[idx]} addLetter={addLetter} springs={letterSprings[idx]} />
                        })}
                    </svg>
                    <div className="flex">
                        <div className="grow"></div>
                        <PillButton content="Delete" onClick={deleteLetter} />
                        <div className="w-2"></div>
                        <PillButton style={{ background: `url("./shuffle.svg") center no-repeat`, backgroundSize: "60%", height: '4rem', width: '4rem' }} onClick={shuffleLetters} />
                        <div className="w-2"></div>
                        <PillButton content="Enter" onClick={submitWord} />
                        <div className="grow"></div>
                    </div>
                    {!smartIsMobile && <div className='h-[100px]'></div>}
                    <div className="grow"></div>
                </div>
                <div className="grow"></div>
            </div>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={1500}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            />

        </div>
    );
}