declare module 'react-world-flags' {
  import { ComponentType } from 'react';

  interface FlagProps {
    code: string;
    fallback?: string | null;
    height?: number | string;
    width?: number | string;
    className?: string;
    style?: React.CSSProperties;
  }

  const Flag: ComponentType<FlagProps>;
  export default Flag;
} 