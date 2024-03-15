"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { animated, useSpring, useTransition } from '@react-spring/web'
import { isMobile} from 'react-device-detect';
import { useMeasure } from "@uidotdev/usehooks";


// const useResize = (myRef: any) => {
//     const [width, setWidth] = useState(0)
//     const [height, setHeight] = useState(0)

//     const handleResize = useCallback(() => {
//         setWidth(myRef.current.offsetWidth)
//         setHeight(myRef.current.offsetHeight)
//     }, [myRef])

//     useEffect(() => {
//         window.addEventListener('load', handleResize)
//         window.addEventListener('resize', handleResize)

//         return () => {
//             window.removeEventListener('load', handleResize)
//             window.removeEventListener('resize', handleResize)
//         }
//     }, [myRef, handleResize])

//     return { width, height }
// }

function Level(props: { w: number, score: number }) {

    const levels: any = [
        ['Beginner', 0],
        ['Good Start', 4],
        ['Moving Up', 9],
        ['Good', 15],
        ['Solid', 28],
        ['Nice', 47],
        ['Great', 74],
        ['Amazing', 93],
        ['Genius', 130],
    ]

    let curLevel = 0
    for (let i = 0; i < levels.length; i++) {
        if (props.score > levels[i][1]) {
            curLevel = i
        } else {
            break
        }
    }


    const { w } = props;


    const textWidth = 100
    const lineWidth = w - textWidth - 50;

    const circles = [];


    const springs = useSpring({
        from: { x: 0, y: 20 },
        to: { x: lineWidth / (levels.length - 1) * curLevel, y: 20 },
        config: {
            mass: 5,
            friction: 75,
            tension: 500,
        }
    });

    const scoreCircle = <animated.g style={{ ...springs }} >
        <circle r={17} fill={"#F2DB50"} />
        <text y={1} fill={"#000"} style={{ fontWeight: 'bold', fontSize: '12px', userSelect: 'none' }} dominantBaseline="middle" textAnchor="middle">{props.score}</text>
    </animated.g >


    for (let i = 0; i < levels.length; i++) {
        const x = lineWidth / (levels.length - 1) * i;

        if (levels[i][0] === 'Genius') {
            circles.push(<rect key={i} x={x} y={15} width={10} height={10} fill={i <= curLevel ? "#F2DB50" : "#BBB"} />)
        } else {

            circles.push(<circle key={i} cx={x} cy={20} r={5} fill={i <= curLevel ? "#F2DB50" : "#BBB"} />)
        }
    }


    return (
        // <div>
        <svg width={w} height={50}>
            <text x={0} y="25" style={{ fontWeight: "bold" }}>{levels[curLevel][0]}</text>
            <g transform={`translate(${textWidth}, 0)`}>
                <line x1={0} y1="20" x2={lineWidth} y2="20" style={{ stroke: "#BBB", strokeWidth: 2 }} />
                {circles}
                {scoreCircle}
            </g>
        </svg>
        // </div>
    );

}

interface CompletedWordsProps {
    words: string[]
    providedLetters: string[]
    smartIsMobile: boolean
}

function CompletedWords({ words, providedLetters, smartIsMobile }: CompletedWordsProps) {

    let wordsToUse = []
    if (!smartIsMobile) {
        wordsToUse = [...words].sort((a, b) => a.localeCompare(b))
    } else {
        wordsToUse = [...words].reverse()
    }

    const transitions = useTransition(wordsToUse, {
        from: { opacity: 0, x: -10 },
        enter: { opacity: 1, x: 0 },
        leave: { opacity: 0, x: -10 },
        exitBeforeEnter: true,
    })


    return (
        <div className='grow'>
            <div className="border rounded-s p-2 flex flex-col h-auto md:h-full md:p-5">
                {!smartIsMobile && <h1>{`You have found ${words.length} word${words.length !== 1 ? 's' : ''}`}</h1>}

                {!smartIsMobile && <ul className='p-5 w-[15rem] grow flex flex-col flex-wrap h-3 w-full'>{transitions((style, word) => {
                    const isPanagram = providedLetters.every(letter => word.includes(letter))

                    return <animated.li className="border-b pt-3 text-[16px]" style={{ fontWeight: isPanagram ? "bold" : "initial", width: '33.33%', ...style }}>{word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()}</animated.li>
                })}</ul>}

                {smartIsMobile && <ul className='pb-6 px-2 w-[15rem] grow flex flex-row h-3 w-full overflow-x-auto overflow-y-hidden'>{transitions((style, word) => {
                    const isPanagram = providedLetters.every(letter => word.includes(letter))

                    return <animated.li className="text-[16px] mr-3 mb-1" style={{ fontWeight: isPanagram ? "bold" : "initial", ...style }}>{word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()}</animated.li>
                })}</ul>}

                {/* <div className='grow bg-slate-50'></div> */}

            </div>
        </div>
    );
}

export function scoreWord(word: string, providedLetters: string[]) {
    let score = 0
    const isPanagram = providedLetters.every(letter => word.includes(letter))

    if (word.length < 4) {
        return 0;
    } else if (word.length === 4) {
        score += 1
    } else if (word.length > 4) {
        score += word.length
    }

    if (isPanagram) {
        score += 7
    }

    return score
}

function getScore(words: string[], providedLetters: string[]) {
    let score = 0;


    for (const word of words) {

        score += scoreWord(word, providedLetters)

    }

    return score
}


interface WordListProps {
    words: string[]
    providedLetters: string[]
    smartIsMobile: boolean
}
export function WordList({ smartIsMobile, words, providedLetters }: WordListProps) {
    const componentRef = useRef() as any
    const [ref, { width, height }] = useMeasure()

    const score = getScore(words, providedLetters)

    return (
        <div className="w-full p-5 flex flex-col" ref={ref}>
            <Level w={width||0} score={score}></Level>
            <CompletedWords words={words} providedLetters={providedLetters} smartIsMobile={smartIsMobile}></CompletedWords>
        </div>
    );
}