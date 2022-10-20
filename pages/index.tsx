import type { NextPage } from 'next'
import PageTemplate from "./../components/page-template/PageTemplate"
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Plate from './../components/plate/Plate'
import Link from 'next/link'

const Home: NextPage = () => {
  const session = useSession()
  const supabase = useSupabaseClient()

  async function addSpotting() {
    const { data, error } = await supabase
      .from('spottings')
      .insert(
        { plateNumber: '001', note: 'tjo', email: session?.user.email }
      )
    console.log(data, error)
  }

  return (
    <PageTemplate>
      <section className="text-center">
        <p>Du letar efter:</p>
        <Plate plateNumber={'123'}></Plate><br />
        <Link href="/add">
          <a className="btn-primary">Hittad!</a>
        </Link>
      </section>
    </PageTemplate>
  )
}
export default Home