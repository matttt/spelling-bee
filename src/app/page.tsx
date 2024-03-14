"use client"
import { useState } from 'react'
import { WordList } from "./wordList";
import { Keypad } from "./keypad";
import { isMobile } from 'react-device-detect';


export default function Home() {

  const testWords = [
    // "ABATING",
    // "AGITATING",
    // "ANTIAGING",
    // "ATTAINING",
    // "BAITING",
    // "BATHING",
    // "BATTING",
    // "GIGABIT",
    // "HABITAT",
    // "HANGTAG",
    // "HINTING",
    // "HITTING",
    // "IGNITING",
    // "INHABITANT",
    // "INHABITING",
    // "INHIBITING",
    // "INITIATING",
    "TAINTING",
    "THINNING"];
  const [words, setWords] = useState<string[]>(testWords)
  const [curWord, setCurWord] = useState("")

  const outerLetters = "NHIGAB".split('')
  const centerLetter = "T"


  return (
    <main className="flex flex-col-reverse h-full h-screen md:flex-row">
      {isMobile && <div className='grow bg-slate-50'></div>}
      <Keypad initOuterLetters={outerLetters} centerLetter={centerLetter} curWord={curWord} setCurWord={setCurWord} words={words} setWords={setWords} />
      <WordList words={words} providedLetters={[...outerLetters, centerLetter]} />
    </main>
  );
}
