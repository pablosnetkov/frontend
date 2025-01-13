'use client';

import { useState } from 'react';

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortSelect({ value, onChange }: SortSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getButtonText = () => {
    switch (value) {
      case 'price':
        return 'По возрастанию цены';
      case '-price':
        return 'По убыванию цены';
      default:
        return 'По умолчанию';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
      >
        <span>Сортировка: {getButtonText()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200">
          <div className="py-1">
            <button
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                value === '' ? 'bg-gray-50 font-medium' : ''
              }`}
            >
              По умолчанию
            </button>
            <button
              onClick={() => {
                onChange('price');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                value === 'price' ? 'bg-gray-50 font-medium' : ''
              }`}
            >
              По возрастанию цены
            </button>
            <button
              onClick={() => {
                onChange('-price');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                value === '-price' ? 'bg-gray-50 font-medium' : ''
              }`}
            >
              По убыванию цены
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 