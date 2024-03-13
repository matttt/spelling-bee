"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { animated, useSpring, useTransition } from '@react-spring/web'

const useResize = (myRef) => {
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)

    const handleResize = useCallback(() => {
        setWidth(myRef.current.offsetWidth)
        setHeight(myRef.current.offsetHeight)
    }, [myRef])

    useEffect(() => {
        window.addEventListener('load', handleResize)
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('load', handleResize)
            window.removeEventListener('resize', handleResize)
        }
    }, [myRef, handleResize])

    return { width, height }
}

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

    const textWidth = 125

    const width = w - textWidth * 2;

    const circles = [];
    const numCircles = 10;


    const springs = useSpring({
        from: { x: 0, y: 20 },
        to: { x: width / numCircles * curLevel, y: 20 },
        config: {
            mass: 5,
            friction: 50,
            tension: 500,
        }
    });

    const scoreCircle = <animated.g style={{ ...springs }} >
        <circle r={20} fill={"#F2DB50"} />
        <text fill={"#000"} style={{ fontWeight: 'bold', fontSize: '12px', userSelect: 'none' }} dominantBaseline="middle" textAnchor="middle">{props.score}</text>
    </animated.g >


    for (let i = 0; i <= numCircles; i++) {
        const x = width / numCircles * i;

        circles.push(<circle key={i} cx={x} cy={20} r={5} fill={i <= curLevel ? "#F2DB50" : "#BBB"} />)
    }


    return (
        <div>
            <svg width={700} height={50}>
                <text y="25" style={{ fontWeight: "bold" }}>{levels[curLevel][0]}</text>
                <g transform={`translate(${textWidth}, 0)`}>
                    <line x1={0} y1="20" x2={width} y2="20" style={{ stroke: "#BBB", strokeWidth: 2 }} />
                    {circles}
                    {scoreCircle}
                </g>
            </svg>
        </div>
    );

}

interface CompletedWordsProps {
    words: string[]
    providedLetters: string[]
}

function CompletedWords({ words, providedLetters }: CompletedWordsProps) {

    // const sortedWords = words.sort((a, b) => a.localeCompare(b))
    const transitions = useTransition(words, {
        from: { opacity: 0, x: -5 },
        enter: { opacity: 1, x: 0 },
        leave: { opacity: 0, x: -5 },
    })


    return (
        <div className="border rounded-s h-full p-5 overflow-y-auto">
            <h1>{`You have found ${words.length} word${words.length !== 1 ? 's' : ''}`}</h1>

            <ul className='p-5 w-[15rem]'>{transitions((style, word) => {
                const isPanagram = providedLetters.every(letter => word.includes(letter))

                return <animated.li className="border-b pt-5 text-l" style={{ fontWeight: isPanagram ? "bold" : "initial", ...style }}>{word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()}</animated.li>
            })}</ul>

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
}
export function WordList({ words, providedLetters }: WordListProps) {
    const componentRef = useRef()
    const { width, height } = useResize(componentRef)

    const score = getScore(words, providedLetters)

    return (
        <div className="w-full m-5" ref={componentRef}>
            <Level w={width} score={score}></Level>
            <CompletedWords words={words} providedLetters={providedLetters}></CompletedWords>
        </div>
    );
}