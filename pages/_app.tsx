import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Particles from '../components/Particles';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Particles />
      <Component {...pageProps} />
    </>
  );
}
