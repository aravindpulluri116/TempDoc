"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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
  Clipboard,
  Check,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';

const LOCAL_STORAGE_KEY = 'tempnote-content-v2';

export function RichTextEditor() {
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  
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

  const updateActiveFormats = useCallback(() => {
    const checkCommand = (command: string) => {
        try {
            return document.queryCommandState(command);
        } catch (e) {
            return false;
        }
    };
    
    const formats = ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList', 'justifyLeft', 'justifyCenter', 'justifyRight'];
    const active = formats.filter(checkCommand);
    setActiveFormats(active);
  }, []);


  useEffect(() => {
    if (isMounted && editorRef.current) {
       const textContent = editorRef.current.innerText || '';
       setWordCount(textContent.trim().split(/\s+/).filter(Boolean).length);
    }
    const editor = editorRef.current;
    if (editor) {
      document.addEventListener('selectionchange', updateActiveFormats);
      editor.addEventListener('keyup', updateActiveFormats);
      editor.addEventListener('click', updateActiveFormats);
      return () => {
        document.removeEventListener('selectionchange', updateActiveFormats);
        editor.removeEventListener('keyup', updateActiveFormats);
        editor.removeEventListener('click', updateActiveFormats);
      }
    }
  }, [isMounted, updateActiveFormats]);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    // Use a timeout to allow the DOM to update before checking the command state
    setTimeout(() => {
        updateActiveFormats();
        handleContentChange();
    }, 0);
  };
  
  const clearFormatting = () => {
    document.execCommand('removeFormat', false);
    document.execCommand('justifyLeft', false);
    handleContentChange();
    setActiveFormats([]);
  };

  const handleCopy = () => {
    if (editorRef.current) {
      const textToCopy = editorRef.current.innerText;
      navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  };

  if (!isMounted) {
    return (
      <Card className="shadow-2xl">
        <div className="h-96" />
      </Card>
    );
  }
  
  const ToolbarButton = ({ command, icon: Icon, children }: { command: string; icon?: React.ElementType, children?: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="icon"
      onMouseDown={(e) => {
        e.preventDefault();
        handleFormat(command);
      }}
      className={cn("h-8 w-8", activeFormats.includes(command) ? 'bg-accent text-accent-foreground' : '')}
      aria-label={command}
    >
      {Icon && <Icon className="h-4 w-4 text-foreground" />}
      {children}
    </Button>
  );

  return (
    <Card className="shadow-2xl border-accent w-full">
       <div className="p-2 border-b border-accent bg-card rounded-t-md flex items-center gap-1 flex-wrap">
        <div className="flex items-center gap-1">
          <ToolbarButton command="undo" icon={Undo} />
          <ToolbarButton command="redo" icon={Redo} />
          <Button variant="ghost" size="icon" onMouseDown={(e) => {e.preventDefault(); clearFormatting()}} aria-label="Clear formatting" className="h-8 w-8">
            <Eraser className="h-4 w-4 text-foreground" />
          </Button>
        </div>
        <Separator orientation="vertical" className="h-6 mx-1 bg-border" />
        <div className="flex items-center gap-1">
          <ToolbarButton command="bold" icon={Bold} />
          <ToolbarButton command="italic" icon={Italic} />
          <ToolbarButton command="underline" icon={Underline} />
          <ToolbarButton command="strikeThrough" icon={Strikethrough} />
        </div>
        <Separator orientation="vertical" className="h-6 mx-1 bg-border" />
        <div className="flex items-center gap-1">
          <ToolbarButton command="insertUnorderedList" icon={List} />
          <ToolbarButton command="insertOrderedList" icon={ListOrdered} />
        </div>
        <Separator orientation="vertical" className="h-6 mx-1 bg-border" />
        <div className="flex items-center gap-1">
          <ToolbarButton command="justifyLeft" icon={AlignLeft} />
          <ToolbarButton command="justifyCenter" icon={AlignCenter} />
          <ToolbarButton command="justifyRight" icon={AlignRight} />
        </div>
      </div>
      <CardContent className="p-0">
        <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            className="w-full min-h-[calc(100vh-15rem)] p-4 sm:p-6 md:p-8 text-lg bg-transparent focus:outline-none leading-relaxed prose dark:prose-invert max-w-none"
            aria-label="Notepad"
            suppressContentEditableWarning
        />
      </CardContent>
      <div className="flex items-center justify-between p-2 border-t border-accent text-sm text-muted-foreground">
        <span>{wordCount} Words</span>
        <Button variant="ghost" size="sm" onClick={handleCopy} disabled={isCopied}>
          {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Clipboard className="mr-2 h-4 w-4" />}
          {isCopied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </Card>
  );
}
