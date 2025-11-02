import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: number | null;
}

export default function MetricCard({ title, value, icon: Icon, trend }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <motion.p 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            {value}
          </motion.p>
          {trend !== null && trend !== undefined && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={clsx(
                "inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold",
                trend >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
              )}
            >
              <span className="mr-1">{trend >= 0 ? '↗' : '↘'}</span>
              {Math.abs(trend)}%
            </motion.div>
          )}
        </div>
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl"
        >
          <Icon className="w-6 h-6 text-blue-600" />
        </motion.div>
      </div>
    </motion.div>
  );
}

