import { RichTextEditor } from '@/components/rich-text-editor';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="text-2xl font-semibold font-headline">TempDoc</div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8">
        <RichTextEditor />
      </main>
    </div>
  );
}
