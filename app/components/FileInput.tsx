'use client';

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  required?: boolean;
  selectedFile?: File | null;
  onClear?: () => void;
  currentImageUrl?: string;
}

export default function FileInput({
  label,
  error,
  className = '',
  required,
  selectedFile,
  onClear,
  currentImageUrl,
  onChange,
  ...props
}: FileInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {selectedFile ? (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600 truncate flex-1">
            {selectedFile.name}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Отменить
          </button>
        </div>
      ) : currentImageUrl ? (
        <div className="space-y-2">
          <img
            src={currentImageUrl}
            alt={label || 'Preview'}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClear}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Удалить
            </button>
          </div>
        </div>
      ) : null}

      <label className={`
        block w-full cursor-pointer
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${className}
      `}>
        <div className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-blue-500 bg-white transition-colors">
          <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">Выбрать файл</span>
          </div>
        </div>
        <input
          type="file"
          className="hidden"
          onChange={onChange}
          {...props}
        />
      </label>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 