"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Undo,
  Redo,
  Eraser,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Strikethrough,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import { Button } from './ui/button';
import { useSelection } from '@/hooks/use-selection';

const LOCAL_STORAGE_KEY = 'tempnote-content-v2';

export function RichTextEditor() {
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const { selectionRect, hasSelection } = useSelection(editorRef);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedNote = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedNote) {
        setContent(savedNote);
        if (editorRef.current) {
          editorRef.current.innerHTML = savedNote;
        }
      } else {
        const initialContent = '<p>Start writing...</p>';
        setContent(initialContent);
        if (editorRef.current) {
          editorRef.current.innerHTML = initialContent;
        }
      }
    } catch (error) {
      console.error('Failed to load note from localStorage', error);
    }
  }, []);
  
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      const textContent = editorRef.current.innerText || '';
      setContent(newContent);
      setWordCount(textContent.trim().split(/\s+/).filter(Boolean).length);
      
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, newContent);
      } catch (error) {
        console.error('Failed to save note to localStorage', error);
      }
    }
  }, []);

  useEffect(() => {
    // Initial word count
    if (isMounted && editorRef.current) {
       const textContent = editorRef.current.innerText || '';
       setWordCount(textContent.trim().split(/\s+/).filter(Boolean).length);
    }
  }, [isMounted]);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const isApplied = (command: string) => {
    if (!isMounted) return false;
    try {
      if (command.startsWith('justify')) {
        return document.queryCommandValue('justify') === command.substring('justify'.length).toLowerCase();
      }
      return document.queryCommandState(command);
    } catch (e) {
      return false;
    }
  };
  
  const clearFormatting = () => {
    document.execCommand('removeFormat', false);
    document.execCommand('justifyLeft', false);
    handleContentChange();
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background" />
    );
  }

  return (
    <div className="flex-grow flex flex-col relative">
      {hasSelection && selectionRect && (
        <FloatingToolbar 
          onFormat={handleFormat} 
          isApplied={isApplied} 
          onClearFormat={clearFormatting}
          selectionRect={selectionRect}
          editorRef={editorRef}
        />
      )}
      
      <main className="flex-grow flex flex-col p-4 sm:p-6 md:p-8">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          className="w-full h-full flex-grow text-lg bg-transparent focus:outline-none leading-relaxed prose dark:prose-invert max-w-none"
          aria-label="Notepad"
          suppressContentEditableWarning
          style={{minHeight: 'calc(100vh - 100px)'}}
        />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 h-12 bg-primary text-primary-foreground flex items-center justify-between px-4 sm:px-6">
        <div className="text-sm font-medium text-accent">
          <span>{wordCount} Words</span>
        </div>
        <ThemeToggle />
      </footer>
    </div>
  );
}


const FloatingToolbar = ({
  onFormat,
  isApplied,
  onClearFormat,
  selectionRect,
  editorRef
}: {
  onFormat: (command: string, value?: string) => void;
  isApplied: (command: string) => boolean;
  onClearFormat: () => void;
  selectionRect: DOMRect;
  editorRef: React.RefObject<HTMLDivElement>;
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (selectionRect && toolbarRef.current && editorRef.current) {
      const editorBounds = editorRef.current.getBoundingClientRect();
      const toolbarHeight = toolbarRef.current.offsetHeight;
      const top = selectionRect.top - editorBounds.top - toolbarHeight - 8;
      const left = selectionRect.left - editorBounds.left + (selectionRect.width / 2) - (toolbarRef.current.offsetWidth / 2);
      
      setStyle({
        top: `${Math.max(top, 8)}px`,
        left: `${Math.max(8, Math.min(left, editorBounds.width - toolbarRef.current.offsetWidth - 8))}px`
      });
    }
  }, [selectionRect, editorRef]);

  return (
    <div
      ref={toolbarRef}
      className="absolute z-10 bg-accent text-accent-foreground rounded-lg p-1 shadow-lg flex items-center gap-1 flex-wrap animate-in fade-in zoom-in-95"
      style={style}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
    >
      <ToggleGroup type="multiple">
        <Button variant="ghost" size="icon" onClick={() => onFormat('undo')} aria-label="Undo" className="h-8 w-8 text-accent-foreground hover:bg-accent/80">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onFormat('redo')} aria-label="Redo" className="h-8 w-8 text-accent-foreground hover:bg-accent/80">
          <Redo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClearFormat} aria-label="Clear formatting" className="h-8 w-8 text-accent-foreground hover:bg-accent/80">
          <Eraser className="h-4 w-4" />
        </Button>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-6 mx-1 bg-accent-foreground/20" />
      <ToggleGroup type="multiple" value={['bold', 'italic', 'underline', 'strikethrough'].filter(cmd => isApplied(cmd === 'strikethrough' ? 'strikeThrough' : cmd))}>
        <ToggleGroupItem value="bold" aria-label="Toggle bold" onClick={() => onFormat('bold')} className="h-8 w-8 text-accent-foreground data-[state=on]:bg-black/10 hover:bg-accent/80">
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Toggle italic" onClick={() => onFormat('italic')} className="h-8 w-8 text-accent-foreground data-[state=on]:bg-black/10 hover:bg-accent/80">
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Toggle underline" onClick={() => onFormat('underline')} className="h-8 w-8 text-accent-foreground data-[state=on]:bg-black/10 hover:bg-accent/80">
          <Underline className="h-4 w-4" />
        </ToggleGroupItem>
         <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough" onClick={() => onFormat('strikeThrough')} className="h-8 w-8 text-accent-foreground data-[state=on]:bg-black/10 hover:bg-accent/80">
          <Strikethrough className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-6 mx-1 bg-accent-foreground/20" />
      <ToggleGroup type="multiple" value={['insertUnorderedList', 'insertOrderedList'].filter(cmd => isApplied(cmd))}>
        <ToggleGroupItem value="bulletList" aria-label="Toggle bullet list" onClick={() => onFormat('insertUnorderedList')} className="h-8 w-8 text-accent-foreground data-[state=on]:bg-black/10 hover:bg-accent/80">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="orderedList" aria-label="Toggle ordered list" onClick={() => onFormat('insertOrderedList')} className="h-8 w-8 text-accent-foreground data-[state=on]:bg-black/10 hover:bg-accent/80">
          <ListOrdered className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
       <Separator orientation="vertical" className="h-6 mx-1 bg-accent-foreground/20" />
      <ToggleGroup type="single" value={['justifyLeft', 'justifyCenter', 'justifyRight'].find(cmd => isApplied(cmd))?.replace('justify', '').toLowerCase() || 'left'}>
        <ToggleGroupItem value="left" aria-label="Align left" onClick={() => onFormat('justifyLeft')} className="h-8 w-8 text-accent-foreground data-[state=on]:bg-black/10 hover:bg-accent/80">
          <AlignLeft className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center" onClick={() => onFormat('justifyCenter')} className="h-8 w-8 text-accent-foreground data-[state=on]:bg-black/10 hover:bg-accent/80">
          <AlignCenter className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right" onClick={() => onFormat('justifyRight')} className="h-8 w-8 text-accent-foreground data-[state=on]:bg-black/10 hover:bg-accent/80">
          <AlignRight className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
