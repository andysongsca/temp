/* eslint-disable no-template-curly-in-string */
import React, { useState } from 'react'
import { Button, Modal } from 'antd'
import { compose } from 'redux'
import { connect } from 'react-redux'
import withAuth from 'hocs/withAuth'
import { checkVerification } from 'redux/login'
import InputCode from "./InputCode";

import './VerificationModal.scss'

const MAX_TRY_TIMES = 5

const VerificationModal = (props) => {
    const { visible, onClose, phone, onVerifySuccess, remainingCodeLeft } = props
    const [code, setCode] = useState("")
    const [failedMsgVisibility, setFailedMsgVisibility] = useState(false)
    const [loading, setLoading] = useState(false);
    const [disableSubmitButton, setDisableSubmitButton] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [tryTimes, setTryTimes] = useState(1)

    const onSubmit = () => {

        if (code) {
            props.checkVerification(phone, code).then(res => {
                if (res && res.value && res.value.data && res.value.data) {
                    if (res.value.data["res"] === "approved") {
                        onVerifySuccess()
                    }
                    else {
                        setErrorMsg("The code didn't work. Check the code and try again.")
                        setFailedMsgVisibility(true)
                        if (tryTimes >= MAX_TRY_TIMES) {
                            setDisableSubmitButton(true)
                            setErrorMsg("You've reached maximum attempts. Please get a new code. You have " + (remainingCodeLeft) + " times left before the account will be locked")
                        }
                        setTryTimes(tryTimes + 1)
                    }
                }
            })
            setCode("")
        }
    }

    const handleCancel = () => {
        setFailedMsgVisibility(false)
        onClose()
    }

    const onUpdate = () => {
        setFailedMsgVisibility(false)
    }

    return (
        <Modal
            className="verification-modal"
            destroyOnClose={true}
            visible={visible}
            centered
            width={452}
            height={258}
            maskClosable={false}
            footer={[
                <Button key="Cancel" onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={onSubmit} disabled={disableSubmitButton} >
                    Verify
                </Button>,
            ]}
            onCancel={onClose}
        >
            <h3>Enter verification code</h3>
            <p>We’ve sent you a 6-digit SMS code to number +1 {phone}. The code may take a few minutes to arrive. </p>
            <InputCode
                length={6}
                loading={loading}
                onUpdate={onUpdate}
                onComplete={completedCode => {
                    setCode(completedCode)
                    setLoading(true);
                    setTimeout(() => setLoading(false), 10000);
                }}
            />
            {failedMsgVisibility && <div className="fail-msg" >{errorMsg}</div>}

        </Modal>
    )
}

export default compose(
    withAuth,
    connect(
        null,
        { checkVerification }
    )
)(VerificationModal)