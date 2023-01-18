import { useEffect, useState } from 'react';
import useSWR from 'swr';

export const useSafeSWR = <T>(key: string, fetcher?: any, args?: any) => {

  const [isServer, setIsServer] = useState(true);

  useEffect(() => {
    if(typeof window !== "undefined"){
      setIsServer(false);
    }
  }, []);

  return useSWR<T>(!isServer? key : null, fetcher, args);
}
