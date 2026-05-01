import { motion } from 'framer-motion';

export function LoadingView({ message = 'Loading menu...' }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pos-background px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-card border border-pos-line bg-white p-8 text-center shadow-soft"
      >
        <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-pos-primary/20 border-t-pos-primary" />
        <p className="text-lg font-black text-pos-slate">{message}</p>
      </motion.div>
    </div>
  );
}
