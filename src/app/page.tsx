"use client"
import { useState } from 'react'
import { WordList } from "./wordList";
import { Keypad } from "./keypad";


export default function Home() {
  const [words, setWords] = useState<string[]>([])
  const [curWord, setCurWord] = useState("")

  const outerLetters = "IULGED".split('')
  const centerLetter = "T"


  return (
    <main className="flex h-full h-screen">
      <Keypad initOuterLetters={outerLetters} centerLetter={centerLetter}  curWord={curWord} setCurWord={setCurWord} words={words} setWords={setWords} />
      <WordList words={words} providedLetters={[...outerLetters, centerLetter]} />
    </main>
  );
}
