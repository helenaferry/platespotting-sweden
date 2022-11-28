import type { NextPage } from 'next'
import PageTemplate from "./../components/page-template/PageTemplate"
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useState } from 'react';
import { useAppSelector, useAppDispatch } from './../hooks'
import { selectAllSpottings, selectDaysSince } from './../store/spottingsSlice'
import { selectAllTeamMembers } from './../store/teamMemberSlice'
import { TeamMemberType } from '../types/TeamMemberType';

const Stats: NextPage = () => {
    const spottings = useAppSelector(selectAllSpottings)
    const daysSince = useAppSelector(selectDaysSince)
    const hasTeamMembers = useAppSelector(state => state.settings.hasTeamMembers)
    const dispatch = useAppDispatch()
    const supabase = useSupabaseClient()
    const teamMembers = useAppSelector(selectAllTeamMembers)

    const longestPeriodBetween = () => {
        const result = (daysSince && daysSince.length > 0) ? daysSince.reduce((a, b) => a.daysSince > b.daysSince ? a : b) : null;
        return (result) ? result.daysSince : 'N/A';
    }
    const shortestPeriodBetween = () => {
        const result = (daysSince && daysSince.length > 0) ? daysSince.filter(d => d.daysSince >= 0).reduce((a, b) => a.daysSince < b.daysSince ? a : b) : null;
        return (result) ? result.daysSince : 'N/A';
    }

    return (
        <PageTemplate>
            <p>Kortaste tid till fynd: {shortestPeriodBetween()} dagar</p>
            <p>Längsta tid till fynd: {longestPeriodBetween()} dagar</p>
        </PageTemplate>
    )
}
export default Stats