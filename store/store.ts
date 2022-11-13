import { configureStore } from '@reduxjs/toolkit'
import spottingsReducer from './spottingsSlice'
import teamMembersReducer from './teamMemberSlice'
import settingsReducer from './settingsSlice'

const store = configureStore({
    reducer: {
        spottings: spottingsReducer,
        teamMembers: teamMembersReducer,
        settings: settingsReducer
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store