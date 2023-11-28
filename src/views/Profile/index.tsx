import { Fragment, useState } from 'react'
import { Tab } from '@headlessui/react'
import { Helmet } from 'react-helmet'
import { useUser } from 'hooks'

import { ProfileHeader, TableActivity, TableValidator, SystemMessage } from 'components/app'

import './styles.scss'

const TABS = [
  { id: 0, title: 'My Validators' },
  { id: 2, title: 'My Activity' }
]

const Profile = () => {
  //const [systemMessage, setSystemMessage] = useState('Sample message')
  const [systemMessage, setSystemMessage] = useState('')

  const { validators, isValidatorsDataLoading, knotsData, activityData, isUserDataLoading } =
    useUser()

  return (
    <>
      <Helmet>
        <title>Profile - Stakehouse</title>
      </Helmet>

      <div className="profile">
        <div className="profile__container">
          <ProfileHeader />
          <div className="profile__content">
            <Tab.Group>
              <Tab.List className="tab">
                {TABS.map((tab) => (
                  <Tab key={tab.id} as={Fragment}>
                    {({ selected }) => (
                      <div className={selected ? 'tab__item--selected' : 'tab__item'}>
                        {tab.title}
                      </div>
                    )}
                  </Tab>
                ))}
              </Tab.List>

              <SystemMessage className="mt-6">{systemMessage}</SystemMessage>

              <Tab.Panels>
                <Tab.Panel className="tab__panel">
                  <TableValidator
                    isLoading={isValidatorsDataLoading}
                    data={validators}
                    knotData={knotsData}
                  />
                </Tab.Panel>
                <Tab.Panel className="tab__panel">
                  <TableActivity data={activityData || []} isLoading={isUserDataLoading} />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile
