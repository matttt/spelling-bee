"use client"
import { useState, useEffect } from 'react'
import { WordList } from "./wordList";
import { Keypad } from "./keypad";
import { isMobile } from 'react-device-detect';


export default function Home() {
  const [isClient, setIsClient] = useState<boolean>(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const smartIsMobile = isMobile && isClient;

  const testWords: any = [
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
    // "TAINTING",
    // "THINNING"
  ];
  const [words, setWords] = useState<string[]>(testWords)
  const [curWord, setCurWord] = useState("")

  const outerLetters = "NHIGAB".split('')
  const centerLetter = "T"


  return (
    <main className="flex flex-col-reverse h-full md:flex-row overflow-hidden">
      {smartIsMobile && <div className='grow bg-slate-50'></div>}
      <Keypad smartIsMobile={smartIsMobile} initOuterLetters={outerLetters} centerLetter={centerLetter} curWord={curWord} setCurWord={setCurWord} words={words} setWords={setWords} />
      <WordList smartIsMobile={smartIsMobile} words={words} providedLetters={[...outerLetters, centerLetter]} />
      {/* {isMobile && <div className='h-10 bg-slate-50'></div>} */}
    </main>
  );
}
