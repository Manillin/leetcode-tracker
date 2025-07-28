'use client'

import { PRIMARY_CATEGORIES, ADDITIONAL_TAGS } from '@/types/database'

interface CategorySelectorProps {
    primaryCategory: string
    additionalTags: string[]
    onPrimaryCategoryChange: (category: string) => void
    onAdditionalTagsChange: (tags: string[]) => void
    disabled?: boolean
}

export default function CategorySelector({
    primaryCategory,
    additionalTags,
    onPrimaryCategoryChange,
    onAdditionalTagsChange,
    disabled = false
}: CategorySelectorProps) {

    const handleTagToggle = (tag: string) => {
        if (additionalTags.includes(tag)) {
            onAdditionalTagsChange(additionalTags.filter(t => t !== tag))
        } else {
            onAdditionalTagsChange([...additionalTags, tag])
        }
    }

    return (
        <div className="space-y-4">
            {/* Categoria Principale */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria Principale *
                </label>
                <select
                    value={primaryCategory}
                    onChange={(e) => onPrimaryCategoryChange(e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                >
                    {PRIMARY_CATEGORIES.map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tag Aggiuntivi */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tag Aggiuntivi (opzionale)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                    {ADDITIONAL_TAGS.map(tag => (
                        <label
                            key={tag}
                            className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                        >
                            <input
                                type="checkbox"
                                checked={additionalTags.includes(tag)}
                                onChange={() => handleTagToggle(tag)}
                                disabled={disabled}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                            <span className="select-none">{tag}</span>
                        </label>
                    ))}
                </div>
                {additionalTags.length > 0 && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Tag selezionati:</p>
                        <div className="flex flex-wrap gap-1">
                            {additionalTags.map(tag => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => handleTagToggle(tag)}
                                        disabled={disabled}
                                        className="ml-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                    >
                                        ×
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