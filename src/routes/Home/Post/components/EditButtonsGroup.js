import React from 'react'
import NavigationPrompt from 'react-router-navigation-prompt'
import { Modal } from 'antd'
import { Preview } from 'components/utils'
import Tooltip from 'components/utils/Tooltip'
import PublishModal from './PublishModal'
import { ReactComponent as IconQuestion } from 'asset/svg/question.svg'


export default function EditButtonsGroup(props) {
  const {
    data, // { title, content, isChanged, mp_tags_manual, location, schedule_time, internal_writer, locationPid, isEvergreen }
    showPreview,
    showPublish,
    isBlocked,
    onPublish,
    onSaveAsDraft,
    togglePreview,
    togglePublish,
    blockPublish,
    blockSaveAsDraft,
    blockCreatorPublishReason,
  } = props

  return <>
    <div className='editor-buttons'>
      {(blockSaveAsDraft === undefined || !blockSaveAsDraft) && <button
        className='Button Button-Light'
        onClick={onSaveAsDraft}
      >
        Save as draft
      </button>}
      {togglePreview && <button
        className='Button Button-Light'
        onClick={togglePreview}
      >
        Preview
      </button>}
      {togglePublish && <button
        className='Button'
        onClick={togglePublish}
        disabled={isBlocked}
      >
        Ready to publish?
      </button>}
      {blockPublish && <Tooltip
        className="disable-publish-tooltip"
        placement="topRight"
        title={blockCreatorPublishReason}
      >
        <IconQuestion />
      </Tooltip>}
    </div>

    <NavigationPrompt when={data.isChanged}>
      {({ onConfirm, onCancel }) => (
        <Modal
          width={560}
          footer={null}
          onCancel={onCancel}
          wrapClassName="comfirm-leave-modal"
          visible={true}>
          <div className="comfirm-leave">
            <div>Are you sure you want to leave?</div>
            <button
              onClick={() => { onCancel(); onSaveAsDraft() }}
              className="save-as-draft"
            >
              Save as draft
            </button>
            <button onClick={onConfirm} className="leave">Leave</button>
          </div>
        </Modal>
      )}
    </NavigationPrompt>

    {showPublish &&
      <PublishModal
        onClose={togglePublish}
        onPublish={onPublish}
        tags={data.mp_tags_manual}
        selectedLocation={data.location}
        selectedLocationPid={data.locationPid}
        isEvergreen={data.isEvergreen}
        internal_writer={data.internal_writer}
        is_journalist={data.is_journalist}
        schedule_time={data.schedule_time}
      />
    }

    {showPreview &&
      <Preview
        title={data.title}
        content={data.content}
        onClose={togglePreview}
        newUI={ true }
      />
    }
  </>
}
