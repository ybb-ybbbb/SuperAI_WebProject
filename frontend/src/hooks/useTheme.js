import { useContext } from 'react';
import { ThemeContext } from '../components/ThemeProvider';

// 自定义Hook，方便组件使用主题
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme必须在ThemeProvider内部使用');
  }
  return context;
};