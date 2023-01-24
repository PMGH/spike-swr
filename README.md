This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## SWR

[Docs](https://swr.vercel.app/docs)

##### useSWR Hook
- Accepts key and fetcher as arguments.
- Returns data and error.
```typescript
const { data, error } = useSWR(key, fetcher)
```
Can also set the data type e.g. Beer:
```typescript
const { data: dynamicData, error } = useSwr<Beer>(API_URL, swrFetcher);
```

#### useSWR Benefits
- Automatic revalidates on focus (e.g. if user switches tabs, lets computer sleep etc)
- Revalidate on interval (only refreshes if component is on screen)
- Revalidate on reconnect (revalidates when a user comes back online, when network recovers)
- Response caching to prevent re-requesting data
- Configuration options (refreshInterval, fallback, dedupingInterval, mutate, cache, provider function for caching etc)
-

#### Endpoints that require authorisation
See: https://swr.vercel.app/docs/arguments
```typescript
const { data: user } = useSWR(['/api/user', token], ([url, token]) => fetchWithToken(url, token))
```

#### Mutate
https://swr.vercel.app/docs/mutation

Used to mutate the data stored against the passed key.

E.g. revalidate/refetch for all SWRs with that key if a session cookie expires
```typescript
// set the cookie as expired
document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

// tell all SWRs with this key to revalidate
mutate('/api/user')
```
> It broadcasts to SWR hooks under the same cache provider scope. If no cache provider exists, it will broadcast to all SWR hooks.

#### Defer loading data until needed
`useSWRMutation` for loading data based on a trigger
```typescript
import { useState } from 'react'
import useSWRMutation from 'swr/mutation'

const fetcher = url => fetch(url).then(res => res.json())

const Page = () => {
  const [show, setShow] = useState(false)
  // data is undefined until trigger is called
  const { data: user, trigger } = useSWRMutation('/api/user', fetcher);

  return (
    <div>
      <button onClick={() => {
        trigger();
        setShow(true);
      }}>Show User</button>
      {show && user ? <div>{user.name}</div> : null}
    </div>
  );
}
```

#### Optimistic Updates
Use the `optimisticData` option and `rollbackOnError` with `mutate` to artificially speed up requests. Pretend the request has succeeded and rollback if it fails behind the scenes.
```typescript
import useSWR, { useSWRConfig } from 'swr'

function Profile () {
  const { mutate } = useSWRConfig()
  const { data } = useSWR('/api/user', fetcher)

  return (
    <div>
      <h1>My name is {data.name}.</h1>
      <button onClick={async () => {
        const newName = data.name.toUpperCase()
        const user = { ...data, name: newName }
        const options = {
          optimisticData: user,
          rollbackOnError(error) {
            // If it's timeout abort error, don't rollback
            return error.name !== 'AbortError'
          },
        }

        // updates the local data immediately
        // send a request to update the data
        // triggers a revalidation (refetch) to make sure our local data is correct
        mutate('/api/user', updateFn(user), options);
      }}>Uppercase my name!</button>
    </div>
  )
}
```

#### Race conditions
https://swr.vercel.app/docs/mutation#avoid-race-conditions

`useSWRMutation` tells `useSWR` to ditch stale requests

#### Typescript friendly
https://swr.vercel.app/docs/typescript
- Has some exported types we can use e.g. Middelware and SWRHook
- Supports generics and can infer types from fetcher return value

#### Suspense
React doesn't recommend using Suspense in data frameworks like SWR: https://reactjs.org/blog/2022/03/29/react-v18.html#suspense-in-data-frameworks

You can use Suspense though like:
```typescript
import { Suspense } from 'react'
import useSWR from 'swr'

function Profile () {
  const { data } = useSWR('/api/user', fetcher, { suspense: true })
  return <div>hello, {data.name}</div>
}

function App () {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <Profile/>
    </Suspense>
  )
}
```
If an error occurred you will need an error boundary:
```typescript
<ErrorBoundary fallback={<h2>Could not fetch posts.</h2>}>
  <Suspense fallback={<h1>Loading posts...</h1>}>
    <Profile />
  </Suspense>
</ErrorBoundary>
```
> Suspense mode suspends rendering until the data is ready, which means it causes waterfall problems easily. To avoid that, you should prefetch resources before rendering. [More information](https://swr.vercel.app/docs/prefetching)

I ran into an issue with this as Suspense isn't supported server-side. You also you get an error if what you render server-side is different to what you render client-side so work-arounds using `typeof window` don't really work. Decided to timebox finding a solution and moved on before finding one.

More info: https://github.com/vercel/swr/issues/1906

#### Middleware
https://swr.vercel.app/docs/middleware
Supports use of middleware that can execute logic before and/or after running it.

#### DevTools
Unofficial Chrome and Firefox extensions: https://swr-devtools.vercel.app/

#### Retries
https://swr.vercel.app/docs/error-handling#error-retry
- uses exponential backoff algorithm
- sensible defaults built into `useSWR` but can be overridden using the `onErrorRetry` option
