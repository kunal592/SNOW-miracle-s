import React, { useState } from 'react';
import { BrainCircuit, Lightbulb, Sparkles, CheckCircle2, XCircle, ArrowRight, RefreshCw, Award, HelpCircle, ChevronRight } from 'lucide-react';
import { CognitiveQuestion, CognitiveAttempt, CognitiveSkillCategory } from '../types';
import { evaluateCognitiveAnswer } from '../lib/cognitiveEngine';

interface CognitiveLabViewProps {
  questions: CognitiveQuestion[];
  attempts: CognitiveAttempt[];
  onSaveAttempt: (attempt: CognitiveAttempt) => void;
  onNavigate: (route: string) => void;
}

export const CognitiveLabView: React.FC<CognitiveLabViewProps> = ({
  questions,
  attempts,
  onSaveAttempt,
  onNavigate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CognitiveSkillCategory | 'All'>('All');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Active question state
  const filteredQuestions = questions.filter((q) => selectedCategory === 'All' || q.category === selectedCategory);
  const currentQuestion = filteredQuestions[currentIndex] || questions[0];

  const [userAnswer, setUserAnswer] = useState('');
  const [hintsRevealed, setHintsRevealed] = useState<number>(0);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<ReturnType<typeof evaluateCognitiveAnswer> | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const handleRequestHint = () => {
    if (hintsRevealed < currentQuestion.hints.length) {
      setHintsRevealed((prev) => prev + 1);
    }
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const evalResult = evaluateCognitiveAnswer(currentQuestion, userAnswer, hintsRevealed, 240);
    setEvaluationResult(evalResult);
    setIsEvaluated(true);

    const newAttempt: CognitiveAttempt = {
      id: 'ca_' + Math.random().toString(36).substring(2, 9),
      questionId: currentQuestion.id,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeTakenSecs: 240,
      userAnswer,
      isCorrect: evalResult.isCorrect,
      isAssisted: hintsRevealed > 0,
      hintsRequested: hintsRevealed,
      attemptsCount: 1,
      reasoningScore: evalResult.qualityScore,
      aiFeedback: {
        verdict: evalResult.verdict,
        qualityScore: evalResult.qualityScore,
        whatWentWell: evalResult.whatWentWell,
        whatCouldImprove: evalResult.whatCouldImprove,
        detailedReasoning: evalResult.detailedReasoning
      }
    };

    onSaveAttempt(newAttempt);
  };

  const handleNextQuestion = () => {
    setUserAnswer('');
    setHintsRevealed(0);
    setIsEvaluated(false);
    setEvaluationResult(null);
    setShowSolution(false);
    setCurrentIndex((prev) => (prev + 1) % filteredQuestions.length);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#26201b] via-[#1c1815] to-[#12100e] border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-amber-100 font-outfit">COGNITIVE LAB</h1>
              <p className="text-xs text-amber-300/90 font-medium">"Train how you think. Systematic cognitive reasoning challenges."</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('/cognitive/profile')}
            className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Award className="w-4 h-4 text-amber-400" /> Training Performance Index
          </button>
          <button
            onClick={() => onNavigate('/cognitive/review')}
            className="px-4 py-2 rounded-xl bg-[#26201b] hover:bg-[#332a24] border border-amber-500/20 text-neutral-300 font-bold text-xs flex items-center gap-1.5 transition"
          >
            Weekly Review
          </button>
        </div>
      </div>

      {/* CATEGORY FILTER CHIPS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar text-xs">
        {(['All', 'Logical', 'Analytical', 'Critical', 'Operational', 'Observational', 'Numerical', 'Systems Thinking', 'Problem Solving'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentIndex(0);
              setIsEvaluated(false);
              setHintsRevealed(0);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 shadow'
                : 'bg-[#1c1815] text-neutral-400 hover:text-amber-200 border border-amber-500/15'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* QUESTION CARD */}
      {currentQuestion && (
        <div className="p-6 rounded-3xl bg-[#1c1815] border border-amber-500/30 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                {currentQuestion.category}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#12100e] text-neutral-400 border border-amber-500/20">
                Level {currentQuestion.difficulty} / 5
              </span>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              Challenge {currentIndex + 1} of {filteredQuestions.length}
            </span>
          </div>

          {/* Context data if available */}
          {currentQuestion.contextData && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 font-mono">
              <span className="font-bold text-amber-400 block mb-0.5">CONTEXT DATA:</span>
              {currentQuestion.contextData}
            </div>
          )}

          {/* QUESTION TEXT */}
          <div className="text-base sm:text-lg font-bold text-amber-100 font-outfit leading-relaxed">
            "{currentQuestion.question}"
          </div>

          {/* PROGRESSIVE HINTS SYSTEM */}
          <div className="space-y-2 pt-2 border-t border-amber-500/15">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" /> Progressive Hints ({hintsRevealed}/{currentQuestion.hints.length})
              </span>
              {hintsRevealed < currentQuestion.hints.length && (
                <button
                  onClick={handleRequestHint}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
                >
                  Request Hint {hintsRevealed + 1} →
                </button>
              )}
            </div>

            {hintsRevealed > 0 && (
              <div className="space-y-2 pt-1">
                {currentQuestion.hints.slice(0, hintsRevealed).map((hint, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#12100e] border border-amber-500/20 text-xs text-amber-200 animate-in slide-in-from-top-2"
                  >
                    <span className="font-bold text-amber-400 block text-[10px] uppercase">
                      Hint {idx + 1} — {idx === 0 ? 'Direction' : idx === 1 ? 'Stronger' : 'Almost There'}
                    </span>
                    {hint}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ANSWER INPUT FORM */}
          {!isEvaluated ? (
            <form onSubmit={handleSubmitAnswer} className="space-y-4 pt-2">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Write your analytical reasoning or step-by-step solution..."
                rows={4}
                className="w-full bg-[#12100e] border border-amber-500/30 rounded-2xl p-4 text-sm text-amber-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition resize-none"
              />

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowSolution(!showSolution)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition"
                >
                  {showSolution ? 'Hide Solution' : 'Reveal Solution'}
                </button>

                <button
                  type="submit"
                  disabled={!userAnswer.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-neutral-950 font-extrabold text-xs shadow-lg flex items-center gap-2 transition active:scale-95"
                >
                  <Sparkles className="w-4 h-4" /> Submit & Evaluate
                </button>
              </div>

              {showSolution && (
                <div className="p-4 rounded-2xl bg-[#12100e] border border-amber-500/30 text-xs text-amber-200 space-y-1 animate-in fade-in">
                  <span className="font-bold text-amber-400 block uppercase">Correct Solution:</span>
                  <p>{currentQuestion.correctAnswer}</p>
                </div>
              )}
            </form>
          ) : (
            /* EVALUATION FEEDBACK CARD ("NEVER ONLY SAY CORRECT/WRONG") */
            <div className="p-5 rounded-2xl bg-[#12100e] border border-amber-500/40 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2">
                  {evaluationResult?.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-400" />
                  )}
                  <div>
                    <h3 className="font-bold text-amber-100 text-base font-outfit">
                      {evaluationResult?.verdict} Solution
                    </h3>
                    <div className="text-[11px] text-neutral-400">
                      Reasoning Quality Score: <span className="font-bold text-amber-400">{evaluationResult?.qualityScore}/10</span>
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {hintsRevealed === 0 ? 'Independent Solve' : `Assisted (${hintsRevealed} hints)`}
                </span>
              </div>

              {/* WHAT WENT WELL & COULD IMPROVE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-1 text-emerald-200">
                  <span className="font-bold text-emerald-400 block text-[10px] uppercase">What You Did Well:</span>
                  {evaluationResult?.whatWentWell.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-1">
                      <span>✓</span> <span>{w}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/20 space-y-1 text-orange-200">
                  <span className="font-bold text-orange-400 block text-[10px] uppercase">What Could Improve:</span>
                  {evaluationResult?.whatCouldImprove.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-1">
                      <span>•</span> <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DETAILED REASONING */}
              <div className="p-3.5 rounded-xl bg-[#1c1815] border border-amber-500/20 text-xs text-neutral-300 leading-relaxed">
                <span className="font-bold text-amber-400 block text-[10px] uppercase mb-1">AI Analytical Breakdown:</span>
                {evaluationResult?.detailedReasoning}
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setIsEvaluated(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition"
                >
                  Try Again
                </button>
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold text-xs shadow flex items-center gap-1.5 transition"
                >
                  Next Challenge <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
