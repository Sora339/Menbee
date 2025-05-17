'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface FormSubmitButtonProps {
  isLoading: boolean;
}

export default function FormSubmitButton({ isLoading }: FormSubmitButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="flex justify-center sm:justify-end"
    >
      <Button
        type="submit"
        disabled={isLoading}
        className="px-8 py-6 text-lg bg-gradient-to-r font-bold from-indigo-600 via-purple-600 to-pink-600 hover:shadow-lg hover:shadow-indigo-600/20 transition-all duration-300 disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <span className="animate-spin mr-2">⟳</span>
            処理中...
          </>
        ) : (
          '面接候補リストを作成'
        )}
      </Button>
    </motion.div>
  );
}