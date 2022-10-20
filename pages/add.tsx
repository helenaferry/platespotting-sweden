import type { NextPage } from 'next'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Head from 'next/head'
import PageTemplate from "./../components/page-template/PageTemplate"
import Plate from './../components/plate/Plate'

const Add: NextPage = () => {
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
    <div>

          <PageTemplate>
            <button onClick={addSpotting} className="btn-primary">
              Add
            </button>
          </PageTemplate>

    </div>
  )
}
export default Add