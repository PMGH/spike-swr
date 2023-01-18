import { swrFetcher } from "../../../swr/utils";
import useSwr, { SWRConfig } from 'swr'
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Beer = {
  id: string;
  name: string;
}
type BeersPageProps = {
  fallback: Beer[]
}
type FeaturedBeerProps = {
  id: string;
}

const StaticBeersList = () => {
  const { data: staticData, error } = useSwr<Beer[]>('/api/beers', swrFetcher);
  console.log({ staticData, error })
  return (
    <ul>
      {staticData && staticData.map(beer => <li key={beer.id}>{beer.name}</li>)}
    </ul>
  )
}

const DynamicFeaturedBeer = ({ id }: FeaturedBeerProps) => {
  const URL = `https://api.punkapi.com/v2/beers/${id}`;
  const { data: dynamicData, error, isLoading } = useSwr<Beer[]>(URL, swrFetcher, { suspense: true });
  console.log({ dynamicData, error, isLoading  })

  if (!dynamicData) return <p>Loading...</p>
  return <p>Featured Beer: {dynamicData[0].name}</p>
}

const BeersPage = ({ fallback }: BeersPageProps) => {
  console.log({ fallback })

  return (
    <SWRConfig value={{ fallback }}>
      <h1>Beers Page</h1>
      <ErrorBoundary fallback={<h2>Could not fetch featured beer</h2>}>
        <Suspense fallback={<h1>Suspense fallback...</h1>}>
          <DynamicFeaturedBeer id="1" />
        </Suspense>
      </ErrorBoundary>
      <h3>Beers</h3>
      <StaticBeersList />
    </SWRConfig>
  )
}

export default BeersPage

export const getStaticProps = async () => {
  const ALL_BEERS_URL = 'https://api.punkapi.com/v2/beers';
  const staticBeers = await fetch(ALL_BEERS_URL).then(res => res.json());

  console.log({ staticBeers })

  return {
    props: {
      fallback: {
        '/api/beers': staticBeers,
      }
    },
  }
}
