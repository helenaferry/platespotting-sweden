import type { NextPage } from 'next'
import { useEffect, useState } from "react";
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Head from 'next/head'
import PageTemplate from "./../components/page-template/PageTemplate"
import AddForm from './../components/add-form/AddForm'

const Add: NextPage = () => {
  const session = useSession()
  const supabase = useSupabaseClient()

  let [plateNumber, setPlateNumber] = useState<string>('');




  return (
    <div>
      <PageTemplate>
        <AddForm />
      </PageTemplate>
    </div>
  )
}
export default Add