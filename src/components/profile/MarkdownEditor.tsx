'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
    defaultMode?: 'edit' | 'preview'
}

export default function MarkdownEditor({
    value,
    onChange,
    placeholder = "Scrivi le tue note in markdown...",
    disabled = false,
    className = "",
    defaultMode = 'edit'
}: MarkdownEditorProps) {
    const [mode, setMode] = useState<'edit' | 'preview'>(defaultMode)

    return (
        <div className={`border border-gray-300 rounded-md ${className}`}>
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-md">
                <button
                    type="button"
                    onClick={() => setMode('edit')}
                    disabled={disabled}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${mode === 'edit'
                        ? 'border-blue-500 text-blue-600 bg-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Edit
                </button>
                <button
                    type="button"
                    onClick={() => setMode('preview')}
                    disabled={disabled}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${mode === 'preview'
                        ? 'border-blue-500 text-blue-600 bg-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Preview
                </button>
            </div>

            {/* Content Area */}
            <div className="relative">
                {mode === 'edit' ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={6}
                        className="w-full px-3 py-2 border-0 rounded-b-md resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                ) : (
                    <div className="px-3 py-2 min-h-[144px] bg-white rounded-b-md">
                        {value.trim() ? (
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        // Stili personalizzati per i componenti markdown
                                        h1: ({ children }) => (
                                            <h1 className="text-lg font-bold text-gray-900 mb-2">{children}</h1>
                                        ),
                                        h2: ({ children }) => (
                                            <h2 className="text-base font-bold text-gray-900 mb-2">{children}</h2>
                                        ),
                                        h3: ({ children }) => (
                                            <h3 className="text-sm font-bold text-gray-900 mb-1">{children}</h3>
                                        ),
                                        p: ({ children }) => (
                                            <p className="text-sm text-gray-700 mb-2">{children}</p>
                                        ),
                                        ul: ({ children }) => (
                                            <ul className="list-disc list-inside text-sm text-gray-700 mb-2 space-y-1">{children}</ul>
                                        ),
                                        ol: ({ children }) => (
                                            <ol className="list-decimal list-inside text-sm text-gray-700 mb-2 space-y-1">{children}</ol>
                                        ),
                                        li: ({ children }) => (
                                            <li className="text-sm text-gray-700">{children}</li>
                                        ),
                                        code: ({ children, className }) => {
                                            const isInline = !className
                                            if (isInline) {
                                                return (
                                                    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                                                        {children}
                                                    </code>
                                                )
                                            }
                                            return (
                                                <code className="block bg-gray-100 text-gray-800 p-2 rounded text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                                                    {children}
                                                </code>
                                            )
                                        },
                                        pre: ({ children }) => (
                                            <pre className="bg-gray-100 p-2 rounded mb-2 overflow-x-auto">
                                                {children}
                                            </pre>
                                        ),
                                        blockquote: ({ children }) => (
                                            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-2">
                                                {children}
                                            </blockquote>
                                        ),
                                        strong: ({ children }) => (
                                            <strong className="font-bold text-gray-900">{children}</strong>
                                        ),
                                        em: ({ children }) => (
                                            <em className="italic text-gray-700">{children}</em>
                                        ),
                                        a: ({ href, children }) => (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline"
                                            >
                                                {children}
                                            </a>
                                        ),
                                    }}
                                >
                                    {value}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm italic">
                                Nessuna nota inserita. Passa alla modalità Edit per aggiungere contenuto.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Help Text per Edit Mode */}
            {mode === 'edit' && (
                <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 rounded-b-md">
                    <p className="text-xs text-gray-500">
                        Supporta Markdown: **grassetto**, *corsivo*, `codice`, [link](url), liste, ecc.
                    </p>
                </div>
            )}
        </div>
    )
} 