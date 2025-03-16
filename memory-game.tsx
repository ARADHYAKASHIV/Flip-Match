"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Heart,
  Star,
  Sun,
  Moon,
  Cloud,
  Flower2,
  Zap,
  Music,
  Umbrella,
  Palette,
  Leaf,
  Snowflake,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type MemoryCard = {
  id: number
  icon: LucideIcon
  isMatched: boolean
  color: string
}

type Difficulty = "easy" | "medium" | "hard"

const DIFFICULTY_CONFIG = {
  easy: { pairs: 6, cols: 3, flipTime: 1000 },
  medium: { pairs: 8, cols: 4, flipTime: 800 },
  hard: { pairs: 12, cols: 4, flipTime: 600 },
}

const ICONS = [
  { icon: Heart, color: "text-rose-400" },
  { icon: Star, color: "text-amber-400" },
  { icon: Sun, color: "text-yellow-400" },
  { icon: Moon, color: "text-purple-400" },
  { icon: Cloud, color: "text-sky-400" },
  { icon: Flower2, color: "text-emerald-400" },
  { icon: Zap, color: "text-orange-400" },
  { icon: Music, color: "text-blue-400" },
  { icon: Umbrella, color: "text-pink-400" },
  { icon: Palette, color: "text-indigo-400" },
  { icon: Leaf, color: "text-green-400" },
  { icon: Snowflake, color: "text-cyan-400" },
]

const createCards = (difficulty: Difficulty) => {
  const { pairs } = DIFFICULTY_CONFIG[difficulty]
  const selectedIcons = ICONS.slice(0, pairs)

  const cards: MemoryCard[] = []

  selectedIcons.forEach(({ icon, color }, index) => {
    cards.push({ id: index * 2, icon, color, isMatched: false }, { id: index * 2 + 1, icon, color, isMatched: false })
  })

  return cards.sort(() => Math.random() - 0.5)
}

export default function MemoryGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
  const [cards, setCards] = useState<MemoryCard[]>(createCards(difficulty))
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([])
  const [matches, setMatches] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [moves, setMoves] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [score, setScore] = useState(0)

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (gameStarted && !gameOver && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && !gameOver) {
      setGameOver(true)
      toast("⏰ Time's up! Game over!", {
        className: "bg-red-900 text-red-100 border-red-700",
      })
    }

    return () => clearTimeout(timer)
  }, [timeLeft, gameStarted, gameOver])

  // Check for game completion
  useEffect(() => {
    if (matches === cards.length / 2 && matches > 0) {
      setGameOver(true)
      const timeBonus = timeLeft * 10
      const movePenalty = moves * 5
      const finalScore = Math.max(1000 + timeBonus - movePenalty, 0)
      setScore(finalScore)

      toast(`🎉 Congratulations! You've found all the matches! Score: ${finalScore} 🎈`, {
        className: "bg-purple-900 text-purple-100 border-purple-700",
      })
    }
  }, [matches, cards.length, moves, timeLeft])

  // Update game when difficulty changes
  useEffect(() => {
    resetGame()
  }, [difficulty])

  const handleCardClick = (clickedIndex: number) => {
    // Start game on first card click
    if (!gameStarted) {
      setGameStarted(true)
    }

    // Prevent clicking if game is over
    if (gameOver) return

    // Prevent clicking if already checking or card is already matched
    if (isChecking || cards[clickedIndex].isMatched) return

    // Prevent clicking if card is already flipped
    if (flippedIndexes.includes(clickedIndex)) return

    // Prevent clicking if two cards are already flipped
    if (flippedIndexes.length === 2) return

    // Add clicked card to flipped cards
    const newFlipped = [...flippedIndexes, clickedIndex]
    setFlippedIndexes(newFlipped)

    // If we now have two cards flipped, check for a match
    if (newFlipped.length === 2) {
      setIsChecking(true)
      setMoves((m) => m + 1)

      const [firstIndex, secondIndex] = newFlipped
      const firstCard = cards[firstIndex]
      const secondCard = cards[secondIndex]

      if (firstCard.icon === secondCard.icon) {
        // Match found
        setTimeout(() => {
          setCards(
            cards.map((card, index) =>
              index === firstIndex || index === secondIndex ? { ...card, isMatched: true } : card,
            ),
          )
          setFlippedIndexes([])
          setMatches((m) => m + 1)
          setIsChecking(false)
        }, 500)
      } else {
        // No match - reset after delay
        setTimeout(() => {
          setFlippedIndexes([])
          setIsChecking(false)
        }, DIFFICULTY_CONFIG[difficulty].flipTime)
      }
    }
  }

  const resetGame = () => {
    setCards(createCards(difficulty))
    setFlippedIndexes([])
    setMatches(0)
    setIsChecking(false)
    setMoves(0)
    setGameStarted(false)
    setGameOver(false)
    setScore(0)

    // Set timer based on difficulty
    switch (difficulty) {
      case "easy":
        setTimeLeft(999)
        break
      case "medium":
        setTimeLeft(120)
        break
      case "hard":
        setTimeLeft(60)
        break
    }
  }

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 text-transparent bg-clip-text">
          Memory Match Challenge
        </h1>

        <Tabs
          defaultValue="easy"
          className="w-[300px] mx-auto"
          onValueChange={(val) => handleDifficultyChange(val as Difficulty)}
        >
          <TabsList className="grid w-full grid-cols-3 bg-indigo-950/50">
            <TabsTrigger value="easy">Easy</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="hard">Hard</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex justify-center space-x-6 text-sm">
          <div className="bg-indigo-900/30 px-3 py-1 rounded-md">
            <span className="text-indigo-200">Time: </span>
            <span className={`font-mono ${timeLeft < 10 ? "text-red-400" : "text-indigo-100"}`}>{timeLeft}s</span>
          </div>
          <div className="bg-indigo-900/30 px-3 py-1 rounded-md">
            <span className="text-indigo-200">Moves: </span>
            <span className="font-mono text-indigo-100">{moves}</span>
          </div>
          <div className="bg-indigo-900/30 px-3 py-1 rounded-md">
            <span className="text-indigo-200">Matches: </span>
            <span className="font-mono text-indigo-100">
              {matches}/{cards.length / 2}
            </span>
          </div>
        </div>

        {gameOver && <div className="mt-2 text-xl font-bold text-amber-300">Final Score: {score}</div>}
      </div>

      <div
        className={`grid grid-cols-${DIFFICULTY_CONFIG[difficulty].cols} gap-3 md:gap-4 p-4 rounded-xl bg-indigo-950/50 backdrop-blur-sm`}
        style={{ gridTemplateColumns: `repeat(${DIFFICULTY_CONFIG[difficulty].cols}, minmax(0, 1fr))` }}
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ rotateY: 0 }}
            animate={{
              rotateY: card.isMatched || flippedIndexes.includes(index) ? 180 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="perspective-1000"
          >
            <Card
              className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 cursor-pointer transform-style-3d transition-all duration-300 ${
                card.isMatched
                  ? "bg-indigo-900/50 border-indigo-400/50"
                  : flippedIndexes.includes(index)
                    ? "bg-indigo-800/50 border-indigo-500/50"
                    : "bg-indigo-950 border-indigo-800 hover:border-indigo-600 hover:bg-indigo-900/80"
              }`}
              onClick={() => handleCardClick(index)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-indigo-500/5 to-white/5" />
              <AnimatePresence>
                {(card.isMatched || flippedIndexes.includes(index)) && (
                  <motion.div
                    initial={{ opacity: 0, rotateY: 180 }}
                    animate={{ opacity: 1, rotateY: 180 }}
                    exit={{ opacity: 0, rotateY: 180 }}
                    className="absolute inset-0 flex items-center justify-center backface-hidden"
                  >
                    <card.icon
                      className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${
                        card.isMatched ? `${card.color} filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]` : card.color
                      }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={resetGame}
        variant="outline"
        size="lg"
        className="bg-indigo-950 border-indigo-700 hover:bg-indigo-900 hover:border-indigo-500 text-indigo-200 hover:text-indigo-100"
      >
        {gameStarted ? "Restart Game" : "Start Game"}
      </Button>
    </div>
  )
}

