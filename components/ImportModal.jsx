import * as Yup from 'yup'
import Modal from 'react-modal'
import { useState } from 'react'
import { useFormik } from 'formik'
import { MdClose } from 'react-icons/md'

import clx from '@functions/clx'
import { FormikTextarea } from './Formik'
import modalStyles from '@styles/Modal.module.scss'
import { useAppContext } from '@contexts/AppContext'

Modal.setAppElement('#reactModal')

export default ({ modalIsOpen, closeModal }) => {
  const { setState } = useAppContext()

  const [formIsSubmitting, setFormIsSubmitting] = useState(false)
  const formik = useFormik({
    initialValues: {
      colors: ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      colors: Yup.string().min(6).required()
    }),
    onSubmit: async values => {
      setFormIsSubmitting(true)

      const newColors = values.colors
        .split('\n')
        .map(color => color.substr(0, 1) !== '#' ? `#${color}` : color)
      setState({ colors: newColors })

      setFormIsSubmitting(false)

      closeModal()
    }
  })

  return (
    <Modal
      shouldCloseOnEsc
      isOpen={modalIsOpen}
      className={modalStyles.modal}
      onRequestClose={closeModal}
      overlayClassName={modalStyles.modalOverlay}
    >
      <div className={modalStyles.modalHeader}>
        <div className={modalStyles.title}>
          Import Palette
        </div>

        <button
          type='button'
          onClick={closeModal}
          className={modalStyles.closeButton}
        >
          <MdClose />
        </button>
      </div>

      <div className={modalStyles.modalContent}>
        <form onSubmit={formik.handleSubmit}>
          <fieldset
            disabled={formIsSubmitting}
            style={{ gap: 20, display: 'flex', flexDirection: 'column' }}
          >
            <FormikTextarea
              rows={5}
              id='colors'
              name='colors'
              formik={formik}
              className={modalStyles.textarea}
              invalidClassName={modalStyles.invalid}
              placeholder='Enter one HEX code per line'
            />

            <button
              type='submit'
              className={clx(modalStyles.button, modalStyles.blue)}
            >
              Import
            </button>
          </fieldset>
        </form>
      </div>
    </Modal>
  )
}
