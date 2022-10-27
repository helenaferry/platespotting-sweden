import type { NextPage } from 'next'
import PageTemplate from "./../components/page-template/PageTemplate"
import AddForm from './../components/add-form/AddForm'

const Add: NextPage = () => {
  return (
    <div>
      <PageTemplate>
        <AddForm />
      </PageTemplate>
    </div>
  )
}
export default Add