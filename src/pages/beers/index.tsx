import { swrFetcher } from "../../../swr/utils";
import useSwr, { SWRConfig } from 'swr'
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useSafeSWR } from "hooks/useSafeSWR";

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
  if (staticData) {
    return (
      <ul>
        {staticData.map(beer => <li key={beer.id}>{beer.name}</li>)}
      </ul>
    )
  }
  return <p>Beers not found.</p>
}

const DynamicFeaturedBeer = ({ id }: FeaturedBeerProps) => {
  const SINGLE_BEER_URL = `https://api.punkapi.com/v2/beers/${id}`;
  const { data: dynamicData } = useSafeSWR<Beer[]>(SINGLE_BEER_URL, swrFetcher, { suspense: true });
  console.log({ dynamicData  })

  if(dynamicData) {
    return <p>Featured Beer: {dynamicData?.[0].name}</p>
  }
  return null;
}

const BeersPage = ({ fallback }: BeersPageProps) => {
  console.log({ fallback })

  // SWRConfig provides the fallback data to the useSwr hook
  // which enables the useSwr hook in StaticBeersList to provide the data
  return (
    <SWRConfig value={{ fallback }}>
      <h1>Beers Page</h1>
      <br />
      <ErrorBoundary fallback={<h2>Could not fetch featured beer</h2>}>
        <Suspense fallback={<h1>Suspense fallback...</h1>}>
          <DynamicFeaturedBeer id="1" />
        </Suspense>
      </ErrorBoundary>
      <br />
      <h3>Beers</h3>
      <StaticBeersList />
    </SWRConfig>
  )
}

export default BeersPage

// Data fetched server-side during yarn build (or in yarn dev)
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
