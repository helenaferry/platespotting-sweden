import type { NextPage } from 'next'
import PageTemplate from "./../components/page-template/PageTemplate"
import Plate from './../components/plate/Plate'
import Link from 'next/link'
import { useAppSelector } from './../hooks'
import { selectNextPlate } from '../store/spottingsSlice'

const Home: NextPage = () => {
  const nextPlate = useAppSelector(selectNextPlate)

  return (
    <PageTemplate>
      <section className="text-center">
        <p>Du letar efter:</p>
        <Plate plateNumber={nextPlate}></Plate><br />
        <Link href="/add">
          <a className="btn-primary">Hittad!</a>
        </Link>
      </section>
    </PageTemplate>
  )
}
export default Home