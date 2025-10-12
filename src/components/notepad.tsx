"use client";

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '@/components/theme-toggle';
import { realTimeWordCount } from '@/ai/flows/real-time-word-count';
import { Loader2 } from 'lucide-react';

export function Notepad() {
  const [text, setText] = useState<string>('');
  const [wordCount, setWordCount] = useState<number>(0);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedNote = localStorage.getItem('tempnote-content');
      if (savedNote) {
        setText(savedNote);
        // Instant client-side word count on load
        setWordCount(savedNote.trim() ? savedNote.trim().split(/\s+/).length : 0);
      }
    } catch (error) {
      console.error('Failed to load note from localStorage', error);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // --- Save to localStorage ---
    const saveHandler = setTimeout(() => {
      try {
        localStorage.setItem('tempnote-content', text);
      } catch (error) {
        console.error('Failed to save note to localStorage', error);
      }
    }, 500);

    // --- AI Word Count ---
    const wordCountHandler = setTimeout(() => {
      // Use simple client-side word count for better performance.
      const words = text.trim() ? text.trim().split(/\s+/) : [];
      setWordCount(words.length);
    }, 500);

    return () => {
      clearTimeout(saveHandler);
      clearTimeout(wordCountHandler);
    };
  }, [text, isMounted]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300 p-4 sm:p-6 md:p-8">
      <header className="flex justify-between items-center mb-4 flex-shrink-0">
        <h1 className="text-xl md:text-2xl font-bold font-headline text-foreground/80 tracking-tight">
          TempNote
        </h1>
        <ThemeToggle />
      </header>
      <main className="flex-grow flex flex-col">
        <Textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Start typing..."
          className="w-full h-full flex-grow p-0 text-base md:text-lg bg-transparent border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 leading-relaxed"
          aria-label="Notepad"
        />
      </main>
      <footer className="mt-4 text-sm text-muted-foreground flex items-center gap-2 flex-shrink-0 h-6">
        <span>Word Count: {wordCount}</span>
        {isCounting && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
      </footer>
    </div>
  );
}
