/* eslint-disable no-template-curly-in-string */
import React, { useState } from 'react'
import cx from 'classnames'
import ImageUploader from '@/components/ImageUploader'

import api from 'utils/api'
import logEvent from 'utils/logEvent'
import { notification } from 'components/Notification'
import { Form, Input, Button } from 'antd'
import LocationSelector from 'components/Location/Selector'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'
// import { ReactComponent as IconCirclePlus } from 'asset/svg/circle-plus.svg'
// import { ReactComponent as IconCircleMinus } from 'asset/svg/circle-minus.svg'

export default function NewAcctPubInfo(props) {
  const [location, setLocation] = useState(null)
  const [icon, setIcon] = useState(null)
  // const [rssList, setRssList] = useState([''])
  const { layout, handleNext, handlePrev, isCreator, isOpenRegistration } = props

  const onNext = (values) => {
    const vals = Object.assign(values, { location, icon })
    handleNext(vals)
  }

  const [form] = Form.useForm();

  const handleUploadCover = file => {
    api.post(
      '/storage/upload-cover',
      { file },
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    ).then(({ data }) => {
      if (data.code === 0) {
        setIcon(data.data)
      } else {
        logEvent('new_account_step1_icon_error')
        notification.error('Upload image failed.')
      }
    })
  }

  /*
  const addRss = (e) => {
    setRssList(rssList.concat(['']))
  }

  const removeRss = (e) => {
    const id = parseInt(e.target.id.split('-')[1])
    setRssList(rssList.slice(0, id).concat(rssList.slice(id + 1)))
  }
*/
  const validateMessages = {
    required: '${label} is required',
    types: {
      email: '${label} is not valid email',
      url: '${name} is not a valid URL',
    },
  };



  return <div className="publication-info">
    <header>
      <h1>Create {isCreator ? 'your' : 'public'}<br />profile</h1>
      <img src={require('asset/img/pub-info.png')} alt="" />
    </header>

    <Form
      layout={layout}
      validateMessages={validateMessages}
      labelAlign="left"
      colon={false}
      onFinish={onNext}
      form={form}
    >
      <Form.Item
        label={isCreator ? "Profile Name" : "Publication Name"}
        name="account"
        rules={[{ required: true, whitespace: true, message: 'this field is required' }]}
        extra={isCreator ? null : "Your publication will show up on www.newsbreak.com/publishers/"}
      >
        <Input className="input" placeholder={isCreator ? "What is your desired profile name?" : "What's your publication's name?"}/>
      </Form.Item>
      <Form.Item
        className="desc"
        label={isCreator ? "Profile Description" : "Publication description"}
        name="description"
        rules={[{ required: true, whitespace: true, message: 'this field is required' }]}
        extra={isCreator ? "This will be displayed on your profile page as the description under your profile name." :
          "This will be displayed on your publication's home page as the description under the publication name."}
      >
        <Input.TextArea maxLength={250} showCount
          placeholder="Share your relevant experience and qualifications for the topics you cover. Some examples: &quot;Certified Life Coach | NLP-MP&quot; or &quot;Tom Johnson has been writing and editing in NYC and around the world for 20+ years.&quot;&#10;Let your audience know what types of stories they can expect from you. For example: &quot;I deliver the news you need to know through a straightforward and unbiased lens with a focus on city hall, homelessness, and policy change.&quot;" />
      </Form.Item>
      <Form.Item
        className="cover"
        label={isCreator ? "Profile picture" : "Publication profile picture"}
        name="cover"
        trigger="onUpload"
        rules={[{ required: true }]}
        extra={isCreator ? "This will be shown on your profile page. It should be at least 60px*60px in size and under 20MB." :
          "This will be shown on your publication's home page. It should be at least 60px*60px in size."}
      >
        <ImageUploader
          onUpload={handleUploadCover}
          image={icon}
          className={cx(!icon && 'no-image', 'upload')}
          coverText="Tap to add"
          sizeLimit={20000000}
          previewType="circle"
          aspectRatio={1}
          outputWidth={400}
          outputHeight={400}
        >
          <span className="subtitle">Add an image</span>
        </ImageUploader>
      </Form.Item>
      <Form.Item
        className="form-location"
        name="form-location"
        rules={[{
          required: true,
          validator: (_) =>
            !isCreator || location ? Promise.resolve() : Promise.reject(new Error('Your Location is required')),
        },]}

        label={isCreator ? "Your location" : "Publication coverage area"}
      >
        {isCreator ? null : <div className="location-item default-location"><span>All U.S. States</span></div>}
        <Form.Item
          name="location"
          className="location-select-wrapper"
        >
          <LocationSelector
            hideIcon={true}
            changeText="&#9547;"
            selected={location}
            onSelect={(loc) => setLocation(loc)} />
        </Form.Item>
        <div className="hint"> {isCreator ? "Contributors must select a U.S. location. Choosing a city is recommended, but you may select your state if it is more relevant to your content. Your location will be visible on your profile and you will not be able to change it through the portal (you will need to email support). This information is also used to verify your account for monetization, so information needs to be accurate. Contributors not located in the U.S. should select “N/A” instead." :
          "Your content will be distributed across all states in the US. In addition, you can specify one more location where your content are most relevant to your audience."}</div>
      </Form.Item>

      {!isOpenRegistration && <Form.Item
        className="rss"
        label="RSS Links"
        name="rss_input"
        initialValue=""
        tooltip={{
          color: 'white',
          title: (
            (
              <div className='new-account-item-tooltip'>
                RSS stands for Really Simple Syndication.
                It helps you easily distribute your content,
                written on a different platform, to a wide number of audience.
                With your permission, we fetch with our RSS feed reader which converts your files into the latest updates from your websites in an easy to read format.
                As a result, your audience on NewsBreak can always see the latest and newest updates from you and links back to the original sources of your website.
                Please ensure the RSS you entered has the correct format.
                If you are not sure, go to https://www.rssboard.org/rss-validator/ or https://validator.w3.org/feed/ to validate your RSS feed.
              </div>
            )
          ),
          icon: <IconInfo />,
        }}
      >
        <Input.TextArea placeholder="Add a list of your RSS feeds, separated by line return." />
        {/* <ul className="rss-list">
          {rssList.map((rss, id) => {
            return <li key={id}>
              <Input defaultValue={rss} />
              {id > 0 ? <IconCircleMinus id={`icon-${id}`} className="icon" onClick={removeRss} /> : <div className="icon" />}
            </li>
          })}
        </ul> */}
        {/* <div className="hint">Add one RSS feed per line field. Tap "+" sign on the right to add more if needed. <IconCirclePlus onClick={addRss} /></div> */}
      </Form.Item>}


      <Form.Item className='btn-container'>
        <Button className='Button Button-Light' htmlType="button" onClick={handlePrev} >
          Back
          </Button>
        <Button
          className={cx('Button', 'submit-btn')}
          type={'primary'}
          htmlType='submit'
          disabled={false}
        >
          {isCreator ? 'Submit' : 'Save & next'}
        </Button>
      </Form.Item>
    </Form>
  </div>
}
