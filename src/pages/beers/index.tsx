import { swrFetcher } from "../../../swr/utils";
import useSwr, { SWRConfig } from 'swr'

type Beer = {
  id: string;
  name: string;
};

type BeersPageProps = {
  fallback: Beer[]
}

const BeersList = () => {
  const { data: staticData, error } = useSwr<Beer[]>('/api/beers', swrFetcher);
  console.log({ staticData, error })
  return (
    <ul>
      {staticData && staticData.map(beer => <li key={beer.id}>{beer.name}</li>)}
    </ul>
  )
}

const BeersPage = ({ fallback }: BeersPageProps) => {
  const { data: dynamicData, error } = useSwr<Beer[]>('https://api.punkapi.com/v2/beers/1', swrFetcher);
  console.log({ dynamicData, error, fallback  })

  const renderFeaturedBeer = () => {
    if (dynamicData?.length && dynamicData[0]?.name) {
      return <p>Featured Beer: {dynamicData[0].name}</p>
    }

    return <p>Loading...</p>
  }

  return (
    <SWRConfig value={{ fallback }}>
      <h1>Beers Page</h1>
      {renderFeaturedBeer()}
      <h3>Beers</h3>
      <BeersList />
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
