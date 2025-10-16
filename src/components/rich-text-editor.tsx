
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
    if (editorRef.current) {
      // Get current selection
      const selection = window.getSelection();
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // If there's selected text, remove formatting from selection
        if (!selection.toString().trim()) {
          // No selection - clear formatting from entire content
          const textContent = editorRef.current.innerText;
          editorRef.current.innerHTML = textContent.replace(/\n/g, '<br>');
        } else {
          // Clear formatting from selected text
          const selectedText = selection.toString();
          const textNode = document.createTextNode(selectedText);
          range.deleteContents();
          range.insertNode(textNode);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        // Fallback: clear all formatting from entire content
        const textContent = editorRef.current.innerText;
        editorRef.current.innerHTML = textContent.replace(/\n/g, '<br>');
      }
      
      // Reset alignment to left
      editorRef.current.style.textAlign = 'left';
      
      handleContentChange();
      setActiveFormats([]);
      editorRef.current?.focus();
    }
  };

  const handleCopy = async () => {
    if (editorRef.current) {
      try {
        // Get the current selection or use the entire content
        const selection = window.getSelection();
        let htmlContent = '';
        
        if (selection && selection.toString().trim() && editorRef.current.contains(selection.anchorNode)) {
          // Copy selected text with formatting
          const range = selection.getRangeAt(0);
          const contents = range.cloneContents();
          const div = document.createElement('div');
          div.appendChild(contents);
          htmlContent = div.innerHTML;
        } else {
          // Copy entire content
          htmlContent = editorRef.current.innerHTML;
        }
        
        // Convert HTML to Unicode styled text (like aiCarousels)
        const convertToUnicodeStyled = (html: string) => {
          let styledText = html;
          
          // Convert bold tags to proper Unicode bold characters
          styledText = styledText.replace(/<strong\b[^>]*>(.*?)<\/strong>/gi, (match, text) => {
            return toUnicodeBold(text);
          });
          
          styledText = styledText.replace(/<b\b[^>]*>(.*?)<\/b>/gi, (match, text) => {
            return toUnicodeBold(text);
          });
          
          // Convert italic tags to proper Unicode italic characters
          styledText = styledText.replace(/<em\b[^>]*>(.*?)<\/em>/gi, (match, text) => {
            return toUnicodeItalic(text);
          });
          
          styledText = styledText.replace(/<i\b[^>]*>(.*?)<\/i>/gi, (match, text) => {
            return toUnicodeItalic(text);
          });
          
          // Convert underline (using combining underline Unicode)
          styledText = styledText.replace(/<u\b[^>]*>(.*?)<\/u>/gi, (match, text) => {
            return text.split('').map(char => char + '\u0332').join(''); // Add combining underline
          });
          
          // Convert strikethrough (using combining long stroke overlay)
          styledText = styledText.replace(/<s\b[^>]*>(.*?)<\/s>/gi, (match, text) => {
            return text.split('').map(char => char + '\u0336').join(''); // Add combining strikethrough
          });
          
          styledText = styledText.replace(/<strike\b[^>]*>(.*?)<\/strike>/gi, (match, text) => {
            return text.split('').map(char => char + '\u0336').join('');
          });
          
          styledText = styledText.replace(/<del\b[^>]*>(.*?)<\/del>/gi, (match, text) => {
            return text.split('').map(char => char + '\u0336').join('');
          });
          
          // Convert line breaks and clean up HTML
          styledText = styledText
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p><p[^>]*>/gi, '\n\n')
            .replace(/<p[^>]*>/gi, '')
            .replace(/<\/p>/gi, '\n')
            .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
            .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up multiple line breaks
            .replace(/^\s+|\s+$/g, '') // Trim whitespace
            .trim();
          
          return styledText;
        };

        // Proper Unicode Bold conversion function
        const toUnicodeBold = (str: string) => {
          const boldA = 0x1D5D4; // Mathematical Bold Capital A
          const bolda = 0x1D5EE; // Mathematical Bold Small A
          const digits: { [key: string]: string } = {
            '0': '𝟬','1': '𝟭','2': '𝟮','3': '𝟯','4': '𝟰',
            '5': '𝟱','6': '𝟲','7': '𝟳','8': '𝟴','9': '𝟵'
          };
          
          return str.split('').map(ch => {
            if (ch >= 'A' && ch <= 'Z') return String.fromCodePoint(boldA + (ch.charCodeAt(0) - 65));
            if (ch >= 'a' && ch <= 'z') return String.fromCodePoint(bolda + (ch.charCodeAt(0) - 97));
            if (digits[ch]) return digits[ch];
            return ch; // Keep spaces, punctuation, etc.
          }).join('');
        };

        // Proper Unicode Italic conversion function
        const toUnicodeItalic = (str: string) => {
          const italicA = 0x1D608; // Mathematical Italic Capital A
          const italica = 0x1D622; // Mathematical Italic Small A
          
          return str.split('').map(ch => {
            if (ch >= 'A' && ch <= 'Z') return String.fromCodePoint(italicA + (ch.charCodeAt(0) - 65));
            if (ch >= 'a' && ch <= 'z') return String.fromCodePoint(italica + (ch.charCodeAt(0) - 97));
            return ch; // Keep spaces, punctuation, numbers, etc.
          }).join('');
        };
        
        // Convert to Unicode styled text
        const unicodeStyledText = convertToUnicodeStyled(htmlContent);
        
        // Copy the Unicode styled text to clipboard
        await navigator.clipboard.writeText(unicodeStyledText);
        
        // Show success message
        alert('Copied with style!');
        
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy styled content: ', err);
        // Fallback to plain text copy
        try {
          const textContent = editorRef.current.innerText;
          await navigator.clipboard.writeText(textContent);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        } catch (fallbackErr) {
          console.error('Fallback copy also failed: ', fallbackErr);
        }
      }
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
        e.stopPropagation();
        // Only execute if the click is actually on the button
        if (e.target === e.currentTarget || (e.target as Element).closest('button')) {
        handleFormat(command);
        }
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
          <Button variant="ghost" size="icon" onMouseDown={(e) => {e.preventDefault(); e.stopPropagation(); clearFormatting()}} aria-label="Clear formatting" className="h-8 w-8">
            <Eraser className="h-4 w-4 text-foreground" />
          </Button>
        </div>
        <Separator orientation="vertical" />
        <div className="flex items-center gap-1">
          <ToolbarButton command="bold" icon={Bold} />
          <ToolbarButton command="italic" icon={Italic} />
          <ToolbarButton command="underline" icon={Underline} />
          <ToolbarButton command="strikeThrough" icon={Strikethrough} />
        </div>
        <Separator orientation="vertical" />
        <div className="flex items-center gap-1">
          <ToolbarButton command="insertUnorderedList" icon={List} />
          <ToolbarButton command="insertOrderedList" icon={ListOrdered} />
        </div>
        <Separator orientation="vertical" />
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
            onClick={(e) => {
              // Ensure focus stays in editor
              editorRef.current?.focus();
            }}
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
