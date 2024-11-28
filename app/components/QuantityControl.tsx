'use client';

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  isLoading?: boolean;
  isBasket?: boolean;
}

export default function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  isLoading = false,
  isBasket = false
}: QuantityControlProps) {
  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={onDecrease}
        disabled={isLoading || quantity <= 1}
        className={`w-10 h-10 flex items-center justify-center rounded-full border text-lg
          ${isLoading || quantity <= 1 
            ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
            : 'border-gray-300 text-gray-600 hover:bg-gray-100'
          }`}
      >
        -
      </button>
      <span className={`w-10 text-center font-medium ${isBasket ? 'text-lg' : 'text-2xl'}`}>
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        disabled={isLoading}
        className={`w-10 h-10 flex items-center justify-center rounded-full border text-lg
          ${isLoading 
            ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
            : 'border-gray-300 text-gray-600 hover:bg-gray-100'
          }`}
      >
        +
      </button>
    </div>
  );
} 