import type { NextPage } from 'next'
import PageTemplate from "./../components/page-template/PageTemplate"
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import React, { useEffect, useState } from 'react';
import { SpottingType } from './../types/SpottingType'
import Plate from './../components/plate/Plate'
import Link from 'next/link'

const Home: NextPage = () => {
  const supabase = useSupabaseClient()
  let [spottings, setSpottings] = useState<SpottingType[] | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      let { data: spottings, error } = await supabase
        .from('spottings')
        .select('*')
      let s = spottings as SpottingType[];
      setSpottings(s);
    }
    fetchData()
      .catch(console.error);
  }, [supabase]);

  function nextPlate() {
    let latest = spottings && spottings.reduce((x, y) => x > y ? x : y, { plateNumber: '000'})
    if (latest && latest.plateNumber != '000') {
      let number = parseInt(latest.plateNumber);
      return String(number + 1).padStart(3, '0');
    } else {
      return '001';
    }
  }
  return (
    <PageTemplate>
      <section className="text-center">
        <p>Du letar efter:</p>
        <Plate plateNumber={nextPlate()}></Plate><br />
        <Link href="/add">
          <a className="btn-primary">Hittad!</a>
        </Link>
      </section>
    </PageTemplate>
  )
}
export default Home