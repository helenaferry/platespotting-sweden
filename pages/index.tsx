import type { NextPage } from 'next'
import PageTemplate from "./../components/page-template/PageTemplate"
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import React, { useEffect, useState } from 'react';
import { SpottingType } from './../types/SpottingType'
import Plate from './../components/plate/Plate'
import Link from 'next/link'
import { useAppSelector, useAppDispatch } from './../hooks'
import { fetchSpottings, selectAllSpottings, selectNextPlate } from '../store/spottingsSlice'

const Home: NextPage = () => {
  const dispatch = useAppDispatch()
  const error = useAppSelector(state => state.spottings.error)
  const spottings = useAppSelector(selectAllSpottings)
  const nextPlate = useAppSelector(selectNextPlate)
  const status = useAppSelector(state => state.spottings.status)

  if (status === 'idle') {
    dispatch(fetchSpottings())
  }

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