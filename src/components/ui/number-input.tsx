import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  className?: string;
}

export function NumberInput({
  value,
  onChange,
  step = 15,
  min = 0,
  className = "",
}: NumberInputProps) {
  const [inputValue, setInputValue] = useState<string>(value.toString());
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // ブラウザ幅やユーザーエージェントでモバイル判定
  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    setIsMobile(/Mobi|Android/.test(ua));
  }, []);

  useEffect(() => {
    // value が外部から変わったときにも同期
    setInputValue(value.toString());
  }, [value]);

  const handleIncrement = () => {
    const newValue = value + step;
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleDecrement = () => {
    const newValue = value - step;
    if (newValue < min) return;
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputValue(input);
    if (input === "") return;
    const parsed = Number.parseInt(input);
    if (!isNaN(parsed)) {
      onChange(parsed < min ? min : parsed);
    }
  };

  const handleBlur = () => {
    if (inputValue === "" || isNaN(Number(inputValue))) {
      setInputValue(min.toString());
      onChange(min);
      return;
    }
    const numValue = Number(inputValue);
    if (numValue < min) {
      setInputValue(min.toString());
      onChange(min);
    }
  };

  // デスクトップでは shadcn の Input を利用
  if (!isMobile) {
    return (
      <div className={`flex items-center ${className}`}>

          <Input
            type="number"
            className={`bg-white w-20 ${className}`}
            value={value.toString()}
            step={step}
            min={min}
            onChange={(e) => onChange(Number.parseInt(e.target.value) || min)}
          />
      </div>
    );
  }

  // モバイルでは矢印ボタン付きカスタム入力を表示
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="number"
        pattern="[0-9]*"
        inputMode="numeric"
        className={`p-2 bg-white/30 w-20 backdrop-blur-sm border border-indigo-200 border-r-0 rounded-none !rounded-tl-md !rounded-bl-md`}
        value={inputValue}
        min={min}
        step={step}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <div className="left-full inset-y-0 flex flex-col h-full bg-transparent">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-[21px] w-6 rounded-none rounded-tr-md px-0 bg-white/50 border border-b-[0.5px] border-indigo-200 "
          onClick={handleIncrement}
          tabIndex={-1}
        >
          <ChevronUp className="h-3 w-3" />
          <span className="sr-only">増加</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-[21px] w-6 rounded-none rounded-br-md px-0 bg-white/50 border border-t-[0.5px] border-indigo-200"
          onClick={handleDecrement}
          tabIndex={-1}
        >
          <ChevronDown className="h-3 w-3" />
          <span className="sr-only">減少</span>
        </Button>
      </div>
    </div>
  );
}
