import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { useEffect } from 'react'

interface RichTextEditorProps {
    value: string
    onChange: (html: string) => void
    placeholder?: string
    minHeight?: string
}

const ToolbarButton = ({
    onClick,
    isActive,
    title,
    children,
}: {
    onClick: () => void
    isActive?: boolean
    title: string
    children: React.ReactNode
}) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all ${isActive
            ? 'bg-secondary text-white shadow-md shadow-secondary/30'
            : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
    >
        {children}
    </button>
)

const Divider = () => <div className="w-px h-5 bg-white/10 mx-1 self-center" />

const RichTextEditor = ({ value, onChange, placeholder, minHeight = '120px' }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                bulletList: {},
                orderedList: {},
            }),
            Underline,
        ],
        content: value || '',
        onUpdate({ editor }) {
            const html = editor.getHTML()
            // Treat empty editor (just <p></p>) as empty string
            onChange(html === '<p></p>' ? '' : html)
        },
        editorProps: {
            attributes: {
                class: 'outline-none min-h-[inherit] prose-editor',
                style: `min-height: ${minHeight}`,
            },
        },
    })

    // Sync external value changes (e.g. when loading saved data)
    useEffect(() => {
        if (!editor) return
        const current = editor.getHTML()
        const incoming = value || ''
        if (current !== incoming && incoming !== (current === '<p></p>' ? '' : current)) {
            editor.commands.setContent(incoming, { emitUpdate: false })
        }
    }, [value, editor])

    if (!editor) return null

    return (
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-secondary focus-within:bg-white/10 transition-all">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-white/10 bg-white/[0.02]">
                {/* Text style */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
                    <span className="font-black">B</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
                    <span className="italic font-bold">I</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
                    <span className="underline font-bold">U</span>
                </ToolbarButton>

                <Divider />

                {/* Headings */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
                    H1
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
                    H2
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
                    H3
                </ToolbarButton>

                <Divider />

                {/* Lists */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
                    <span className="text-sm">• List</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
                    <span className="text-sm">1. List</span>
                </ToolbarButton>

                <Divider />

                {/* Clear */}
                <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} isActive={false} title="Clear Formatting">
                    <span className="line-through opacity-60">Aa</span>
                </ToolbarButton>
            </div>

            {/* Editor area */}
            <div className="relative px-4 py-3 text-white font-medium leading-relaxed">
                {/* Placeholder */}
                {editor.isEmpty && placeholder && (
                    <div className="absolute top-3 left-4 text-white/25 pointer-events-none select-none font-bold" aria-hidden>
                        {placeholder}
                    </div>
                )}
                <EditorContent editor={editor} />
            </div>

            <style>{`
        .prose-editor h1 { font-size: 1.5rem; font-weight: 900; margin: 0.5rem 0; line-height: 1.2; }
        .prose-editor h2 { font-size: 1.25rem; font-weight: 800; margin: 0.5rem 0; line-height: 1.3; }
        .prose-editor h3 { font-size: 1.05rem; font-weight: 700; margin: 0.4rem 0; line-height: 1.4; }
        .prose-editor p { margin: 0.25rem 0; }
        .prose-editor ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.4rem 0; }
        .prose-editor ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.4rem 0; }
        .prose-editor li { margin: 0.15rem 0; }
        .prose-editor strong { font-weight: 800; }
        .prose-editor em { font-style: italic; }
        .prose-editor u { text-decoration: underline; }
        .prose-editor p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: rgba(255,255,255,0.25); pointer-events: none; float: left; height: 0; }
      `}</style>
        </div>
    )
}

export default RichTextEditor
