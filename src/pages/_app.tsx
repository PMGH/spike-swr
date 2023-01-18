import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SWRConfig } from 'swr'
import { swrFetcher } from '../../swr/utils'

export default function App({ Component, pageProps }: AppProps) {
  const swrOptions = {
    fetcher: swrFetcher,
    refreshInterval: 100000 // re-request all SWRs within this SWRConfig every 10 seconds
  }

  return (
    <SWRConfig value={swrOptions}>
      <Component {...pageProps} />
    </SWRConfig>
  )
}
