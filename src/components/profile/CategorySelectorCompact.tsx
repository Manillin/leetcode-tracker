'use client'

import { useState } from 'react'
import { PRIMARY_CATEGORIES, ADDITIONAL_TAGS } from '@/types/database'

interface CategorySelectorCompactProps {
    primaryCategory: string
    additionalTags: string[]
    onPrimaryCategoryChange: (category: string) => void
    onAdditionalTagsChange: (tags: string[]) => void
    disabled?: boolean
}

export default function CategorySelectorCompact({
    primaryCategory,
    additionalTags,
    onPrimaryCategoryChange,
    onAdditionalTagsChange,
    disabled = false
}: CategorySelectorCompactProps) {
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false)

    const handleTagToggle = (tag: string) => {
        if (additionalTags.includes(tag)) {
            onAdditionalTagsChange(additionalTags.filter(t => t !== tag))
        } else {
            onAdditionalTagsChange([...additionalTags, tag])
        }
    }

    const removeTag = (tagToRemove: string) => {
        onAdditionalTagsChange(additionalTags.filter(t => t !== tagToRemove))
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categoria Principale */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria Principale *
                </label>
                <select
                    value={primaryCategory}
                    onChange={(e) => onPrimaryCategoryChange(e.target.value)}
                    disabled={disabled}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-sm"
                    required
                >
                    {PRIMARY_CATEGORIES.map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tag Aggiuntivi - Dropdown Style */}
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tag Aggiuntivi (opzionale)
                </label>

                {/* Dropdown Button */}
                <button
                    type="button"
                    onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                    disabled={disabled}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-between"
                >
                    <span className="text-gray-700">
                        {additionalTags.length === 0
                            ? 'Seleziona tag aggiuntivi...'
                            : `${additionalTags.length} tag selezionati`
                        }
                    </span>
                    <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${isTagDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown Content */}
                {isTagDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2">
                            {ADDITIONAL_TAGS.map(tag => (
                                <label
                                    key={tag}
                                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={additionalTags.includes(tag)}
                                        onChange={() => handleTagToggle(tag)}
                                        disabled={disabled}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 select-none">{tag}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Selected Tags Display */}
                {additionalTags.length > 0 && (
                    <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                            {additionalTags.map(tag => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        disabled={disabled}
                                        className="ml-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 