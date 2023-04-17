import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider, Box } from '@chakra-ui/react';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Box suppressHydrationWarning>
        <Component {...pageProps} />
      </Box>
    </ChakraProvider>
  );
}
