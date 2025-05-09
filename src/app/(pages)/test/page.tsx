"use client";

import { useState, useEffect } from "react";
import { NumberInput } from "@/components/ui/number-input";
import { Input } from "@/components/ui/input";

export default function TestInputPage() {
  const [value1, setValue1] = useState(30);
  const [value2, setValue2] = useState(30);
  const [value3, setValue3] = useState(45);
  const [deviceInfo, setDeviceInfo] = useState("読み込み中...");

  // クライアントサイドでのみ実行されるコード
  useEffect(() => {
    setDeviceInfo(`${navigator.userAgent} - 画面サイズ: ${window.innerWidth}×${window.innerHeight}`);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">数値入力コンポーネントテスト</h1>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            カスタムNumberInputコンポーネント vs 標準Input
          </h2>
          <p className="text-white/80 mb-6">
            このページでは、iOSでも上下矢印が表示されるカスタムNumberInputコンポーネントと、
            標準のinput type="number"の動作を比較できます。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-white/20 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3">カスタムNumberInput</h3>
              <p className="text-sm text-white/70 mb-4">
                すべてのブラウザで一貫したUIを提供するカスタムコンポーネント
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white mb-2">基本的な数値入力:</label>
                  <NumberInput
                    value={value1}
                    onChange={setValue1}
                    step={15}
                    min={0}
                    className="w-24"
                  />
                  <p className="mt-2 text-white/70">現在の値: {value1}</p>
                </div>
                
                <div>
                  <label className="block text-white mb-2">最小値の制限付き:</label>
                  <NumberInput
                    value={value3}
                    onChange={setValue3}
                    step={15}
                    min={0}
                    className="w-24"
                  />
                  <p className="mt-2 text-white/70">現在の値: {value3} (最大: 120)</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white/20 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3">標準のInput type="number"</h3>
              <p className="text-sm text-white/70 mb-4">
                iOSでは上下矢印が表示されない標準のHTML入力
              </p>
              
              <div>
                <label className="block text-white mb-2">標準の数値入力:</label>
                <Input
                  type="number"
                  value={value2}
                  onChange={(e) => setValue2(Number(e.target.value) || 0)}
                  step={15}
                  min={0}
                  className="w-24 bg-white/30 backdrop-blur-sm border-indigo-200"
                />
                <p className="mt-2 text-white/70">現在の値: {value2}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">
            実際のフォームコンテキストでのテスト
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/20 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">イベント設定例</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">前の余裕時間 (分):</label>
                  <NumberInput
                    value={value1}
                    onChange={setValue1}
                    step={15}
                    min={0}
                    className="w-24"
                  />
                </div>
                
                <div>
                  <label className="block text-white mb-2">後の余裕時間 (分):</label>
                  <NumberInput
                    value={value3}
                    onChange={setValue3}
                    step={15}
                    min={0}
                    className="w-24"
                  />
                </div>
                
                <div>
                  <label className="block text-white mb-2">面接時間 (分):</label>
                  <NumberInput
                    value={value2}
                    onChange={setValue2}
                    step={15}
                    min={30}
                    className="w-24"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white/20 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">操作方法</h3>
              <ul className="list-disc list-inside text-white/80 space-y-2">
                <li>上下ボタンをタップして値を変更できます</li>
                <li>直接数値を入力することもできます</li>
                <li>step値の設定により、15分単位で増減します</li>
                <li>最小値より小さい値は制限されます</li>
                <li>最大値を超える値も制限されます</li>
              </ul>
              
              <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-white text-sm">
                  iPhoneやiPadなどのiOSデバイスでは、標準のinput type="number"では上下矢印が
                  表示されませんが、このカスタムコンポーネントではすべてのデバイスで
                  一貫したUIと操作感を提供します。
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-white/60 text-sm">
          デバイス情報: <span>{deviceInfo}</span>
        </div>
      </div>
    </div>
  );
}