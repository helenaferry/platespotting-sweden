import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface SettingsState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | undefined,
    hasTeamMembers: boolean,
    name: string,
    email: string
}

const initialState: SettingsState = {
    status: 'idle',
    error: '',
    hasTeamMembers: false,
    name: '',
    email: ''
}

type FetchSettingsType = {
    id: string | undefined,
    database: any
}

export const fetchSettings = createAsyncThunk('settings/fetchSettings', async (prop: FetchSettingsType) => {
    if (!prop.id) return
    let { data: settings, error } = await prop.database
        .from('profiles')
        .select('name, email, hasTeamMembers')
        .eq('id', prop.id)
    if (error) { console.log(error); }
    return settings;
})

type HasTeamMembersType = {
    hasTeamMembers: boolean,
    id: string,
    database: any
}

export const setHasTeamMembers = createAsyncThunk('teamMembers/setHasTeamMembers', async (prop: HasTeamMembersType) => {
    const { data, error } = await prop.database
        .from('profiles')
        .update({ hasTeamMembers: prop.hasTeamMembers })
        .eq('id', prop.id)
        .select()
    if (error) { console.log(error); }
    return data
})

type NameType = {
    name: string,
    id: string;
    database: any
}

export const setName = createAsyncThunk('teamMembers/setName', async (prop: NameType) => {
    const { data, error } = await prop.database
        .from('profiles')
        .update({ name: prop.name })
        .eq('id', prop.id)
        .select()
    if (error) { console.log(error); }
    return data
})

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
    },
    extraReducers(builder) {
        builder
            // Fetch user settings
            .addCase(fetchSettings.pending, (state, action) => {
                state.status = 'loading';
            })
            .addCase(fetchSettings.fulfilled, (state, action: PayloadAction<any>) => {
                // console.log('fetchSettings fulfilled', action.payload);
                if (!action || !action.payload || !action.payload[0]) return;
                state.hasTeamMembers = action.payload[0].hasTeamMembers;
                state.name = action.payload[0].name;
                state.email = action.payload[0].email;
                state.status = 'succeeded';
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                // console.log('fetchSettings error', action.error.message);
                state.status = 'failed';
                state.error = action.error.message;
            })
            // Set has team members
            .addCase(setHasTeamMembers.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(setHasTeamMembers.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded'
                state.hasTeamMembers = action.payload.hasTeamMembers;
                // console.log('setHasTeamMEmbers got', action.payload)
            })
            .addCase(setHasTeamMembers.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message || '';
                console.log(action.error.message);
            })
            // Set name
            .addCase(setName.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(setName.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded'
                state.name = action.payload[0].name;
                // console.log('setName got', action.payload)
            })
            .addCase(setName.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message || '';
                console.log(action.error.message);
            })
    }
})

export default settingsSlice.reducer