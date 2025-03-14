import * as Yup from 'yup'
import Modal from 'react-modal'
import { useState } from 'react'
import { useFormik } from 'formik'
import { MdClose } from 'react-icons/md'
import { setCookie } from 'cookies-next'

import clx from '@functions/clx'
import uuid from '@functions/uuid'
import { FormikInput } from './Formik'
import findInObject from '@functions/findInObject'
import modalStyles from '@styles/Modal.module.scss'
import { useAppContext } from '@contexts/AppContext'

Modal.setAppElement('#reactModal')

export default ({ modalIsOpen, closeModal }) => {
  const { state, setState } = useAppContext()
  const { colors, palettes, selectedPaletteId } = state

  const paletteIndex = findInObject({
    object: palettes,
    search: { id: selectedPaletteId }
  })
  const palette = palettes[paletteIndex] || {}

  const [formIsSubmitting, setFormIsSubmitting] = useState(false)
  const formik = useFormik({
    initialValues: {
      paletteName: palette.name
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      paletteName: Yup.string().min(1).required()
    }),
    onSubmit: async values => {
      setFormIsSubmitting(true)

      if (values.paletteName === palette.name) {
        const newPalettes = [...palettes]
        newPalettes[paletteIndex].colors = colors

        setCookie('palettes', newPalettes, {
          maxAge: 315360000
        })
        setState({ palettes: newPalettes })
      } else {
        const newPaletteId = uuid()
        const newPalettes = [...palettes]
        newPalettes.push({
          colors,
          id: newPaletteId,
          name: values.paletteName
        })

        setCookie('palettes', newPalettes, {
          maxAge: 315360000
        })
        setCookie('selectedPaletteId', newPaletteId, {
          maxAge: 315360000
        })
        setState({
          palettes: newPalettes,
          selectedPaletteId: newPaletteId
        })
      }

      closeModal()
      formik.resetForm()
      setFormIsSubmitting(false)
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
          Save Palette
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
            <FormikInput
              type='text'
              formik={formik}
              id='paletteName'
              name='paletteName'
              placeholder='Palette name'
              className={modalStyles.input}
              invalidClassName={modalStyles.invalid}
            />

            <button
              type='submit'
              className={clx(modalStyles.button, modalStyles.blue)}
            >
              Save
            </button>

            <div className={clx(modalStyles.alert, modalStyles.info)}>
              <div className={modalStyles.colorText}>
                {
                  selectedPaletteId
                    ? 'Use the same name to update the palette or a different name to create a new palette'
                    : 'Saved palettes are stored in cookies'
                }
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </Modal>
  )
}
