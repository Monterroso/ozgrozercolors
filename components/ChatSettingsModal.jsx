import Modal from 'react-modal'
import { useState } from 'react'
import { MdClose } from 'react-icons/md'

import modalStyles from '@styles/Modal.module.scss'
import styles from '@styles/ChatSettingsModal.module.scss'
import { useAppContext } from '@contexts/AppContext'

Modal.setAppElement('#reactModal')

export default ({ modalIsOpen, closeModal }) => {
  const { state, setState } = useAppContext()
  const { useLLM = false, llmConfig = {} } = state
  
  const [localUseLLM, setLocalUseLLM] = useState(useLLM)
  const [localEndpoint, setLocalEndpoint] = useState(llmConfig.endpoint || '')
  const [localApiKey, setLocalApiKey] = useState(llmConfig.apiKey || '')
  
  const handleSave = () => {
    setState({
      useLLM: localUseLLM,
      llmConfig: {
        endpoint: localEndpoint,
        apiKey: localApiKey
      }
    })
    closeModal()
  }
  
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
          Assistant Settings
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
        <div className={styles.settingsForm}>
          <div className={styles.settingItem}>
            <label className={styles.settingLabel}>
              <input
                type="checkbox"
                checked={localUseLLM}
                onChange={(e) => setLocalUseLLM(e.target.checked)}
              />
              Use External LLM
            </label>
            <p className={styles.settingDescription}>
              When enabled, the assistant will use an external LLM API for responses.
              When disabled, it will use a built-in rule-based system.
            </p>
          </div>
          
          {localUseLLM && (
            <>
              <div className={styles.settingItem}>
                <label className={styles.settingLabel}>
                  LLM API Endpoint
                </label>
                <input
                  type="text"
                  value={localEndpoint}
                  onChange={(e) => setLocalEndpoint(e.target.value)}
                  placeholder="https://api.example.com/v1/chat/completions"
                  className={styles.settingInput}
                />
              </div>
              
              <div className={styles.settingItem}>
                <label className={styles.settingLabel}>
                  API Key
                </label>
                <input
                  type="password"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="Your API key"
                  className={styles.settingInput}
                />
              </div>
            </>
          )}
          
          <div className={styles.buttonContainer}>
            <button
              onClick={closeModal}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={styles.saveButton}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
} 