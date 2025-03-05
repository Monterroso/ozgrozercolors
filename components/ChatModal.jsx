import { useState, useRef, useEffect } from 'react'
import { MdClose } from 'react-icons/md'
import Draggable from 'react-draggable'
import { PiPaperPlaneTilt, PiGear, PiArrowLeft } from 'react-icons/pi'

import styles from '@styles/ChatModal.module.scss'
import { useAppContext } from '@contexts/AppContext'
import { createChatService } from '@services/ChatService'

export default ({ modalIsOpen, closeModal }) => {
  const { state, setState } = useAppContext()
  const { colors, chatHistory = [], useLLM = false, llmConfig = {} } = state
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [localUseLLM, setLocalUseLLM] = useState(useLLM)
  const [localEndpoint, setLocalEndpoint] = useState(llmConfig.endpoint || '')
  const [localApiKey, setLocalApiKey] = useState(llmConfig.apiKey || '')
  const chatContainerRef = useRef(null)
  const nodeRef = useRef(null) // Required by react-draggable in React 18
  const chatService = useRef(createChatService(useLLM, llmConfig))

  // Update chat service if useLLM or llmConfig changes
  useEffect(() => {
    chatService.current = createChatService(useLLM, llmConfig)
    setLocalUseLLM(useLLM)
    setLocalEndpoint(llmConfig.endpoint || '')
    setLocalApiKey(llmConfig.apiKey || '')
  }, [useLLM, llmConfig])

  // Scroll to bottom when chat history changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory])

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return
    
    // Add user message to chat history
    const userMessage = {
      isUser: true,
      message: message.trim(),
      timestamp: new Date().toISOString()
    }
    
    setState(prevState => ({
      chatHistory: [...prevState.chatHistory, userMessage]
    }))
    
    // Clear input after sending
    setMessage('')
    setIsLoading(true)
    
    try {
      // Process message with chat service
      const response = await chatService.current.processMessage(userMessage.message, colors)
      
      // Add assistant response to chat history
      const assistantMessage = {
        isUser: false,
        message: response.message,
        suggestedColors: response.suggestedColors,
        timestamp: new Date().toISOString()
      }
      
      setState(prevState => ({
        chatHistory: [...prevState.chatHistory, assistantMessage]
      }))
    } catch (error) {
      console.error('Error processing message:', error)
      
      // Add error message to chat history
      const errorMessage = {
        isUser: false,
        message: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString()
      }
      
      setState(prevState => ({
        chatHistory: [...prevState.chatHistory, errorMessage]
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAddColor = (color) => {
    // Add the suggested color to the palette
    setState(prevState => ({
      colors: [...prevState.colors, color.hex]
    }))
  }

  const openSettings = () => setShowSettings(true)
  const closeSettings = () => setShowSettings(false)
  
  const saveSettings = () => {
    setState({
      useLLM: localUseLLM,
      llmConfig: {
        endpoint: localEndpoint,
        apiKey: localApiKey
      }
    })
    closeSettings()
  }

  if (!modalIsOpen) return null;

  return (
    <Draggable 
      nodeRef={nodeRef} 
      handle=".handle"
      defaultPosition={{x: 100, y: 100}}
    >
      <div 
        ref={nodeRef} 
        className={styles.draggableWrapper}
      >
        <div className={styles.draggableContainer}>
          {!showSettings ? (
            // Chat UI
            <>
              <div className={`${styles.modalHeader} handle`}>
                <div className={styles.title}>
                  Color Assistant
                </div>
                <div className={styles.headerButtons}>
                  <button
                    type='button'
                    onClick={openSettings}
                    className={styles.settingsButton}
                  >
                    <PiGear />
                  </button>
                  <button
                    type='button'
                    onClick={closeModal}
                    className={styles.closeButton}
                  >
                    <MdClose />
                  </button>
                </div>
              </div>

              <div className={styles.modalContent}>
                <div className={styles.chatContainer} ref={chatContainerRef}>
                  {chatHistory.length === 0 ? (
                    <div className={styles.emptyChat}>
                      <p>Ask me about color suggestions or palette advice!</p>
                    </div>
                  ) : (
                    chatHistory.map((chat, index) => (
                      <div 
                        key={index} 
                        className={`${styles.chatMessage} ${chat.isUser ? styles.userMessage : styles.assistantMessage}`}
                      >
                        <div className={styles.messageContent}>
                          {chat.message}
                        </div>
                        {!chat.isUser && chat.suggestedColors && chat.suggestedColors.length > 0 && (
                          <div className={styles.suggestedColors}>
                            {chat.suggestedColors.map((color, colorIndex) => (
                              <div key={colorIndex} className={styles.colorSuggestion}>
                                <div 
                                  className={styles.colorPreview} 
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span className={styles.colorName}>{color.name}</span>
                                <button 
                                  className={styles.addColorButton}
                                  onClick={() => handleAddColor(color)}
                                >
                                  Add
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className={`${styles.chatMessage} ${styles.assistantMessage}`}>
                      <div className={styles.loadingIndicator}>
                        <span>•</span><span>•</span><span>•</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className={styles.inputContainer}>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about colors or palette advice..."
                    className={styles.chatInput}
                    disabled={isLoading}
                  />
                  <button 
                    onClick={handleSendMessage}
                    className={styles.sendButton}
                    disabled={!message.trim() || isLoading}
                  >
                    <PiPaperPlaneTilt />
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Settings UI
            <>
              <div className={`${styles.modalHeader} handle`}>
                <div className={styles.titleWithBack}>
                  <button
                    type='button'
                    onClick={closeSettings}
                    className={styles.backButton}
                  >
                    <PiArrowLeft />
                  </button>
                  <div className={styles.title}>
                    Assistant Settings
                  </div>
                </div>
                <button
                  type='button'
                  onClick={closeModal}
                  className={styles.closeButton}
                >
                  <MdClose />
                </button>
              </div>

              <div className={styles.modalContent}>
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
                      onClick={closeSettings}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveSettings}
                      className={styles.saveButton}
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Draggable>
  )
} 