'use client'
import {useState, useRef, useEffect} from 'react'
import {Box, Stack, TextField, Button, Typography} from "@mui/material"
import {Send} from "lucide-react"

export default function Home() {
  //state variable for the entire chat history
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi I'm your QuizLearn Study Assistant. How can I assist you today?`
  }])

  //state variable for user message to send
  const [message, setMessage] = useState('') //don't send empty messages

  //backend chat functionality
  const sendMessage = async()=>{
    if(!message.trim()){return}

    setMessage('') //clear input
    setMessages((messages)=>[
      ...messages,
      {role: 'user', content: message}, //add user message to chat
      {role: 'assistant', content: ''}, //add placeholder for chatbot
    ])

    //send message and get response from the server
    const response = fetch('/api/chat',{
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, {role: 'user', content: message}]),

    }).then (async(res)=>{

      const reader = res.body.getReader() //reader to read response
      const decoder = new TextDecoder() //then decode response

      let result = ''
      return reader.read().then(function processText({done, value}){
        if(done){
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), {stream: true})
        setMessages((messages)=>{
          let lastMessage = messages[messages.length-1] //get last message (placeholder for chatbot)
          let otherMessages = messages.slice(0, messages.length-1) //get all other messages
          return[
            ...otherMessages, //all chat history
            {...lastMessage, //most recent message
              content: lastMessage.content + text,
            },
          ]
        })

        return reader.read().then(processText) //continue reading the next chunk of the response
      })
    })
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
      scrollToBottom()
  }, [messages])

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="mediumpurple">

      <Typography variant="h3" border = "3px solid black" width="900px" display="flex" justifyContent="center" color="purple" bgcolor="white" p={1}>
        QuizLearn Assistant
      </Typography>
      
      <Stack
        direction="column"
        width="900px"
        height="700px"
        border = "3px solid"
        p={2}
        spacing={1}
        bgcolor="white">

          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
          >
            {
              messages.map((message, index)=>(
                <Box key={index} display="flex" justifyContent={
                  message.role === 'assistant'? "flex-start": "flex-end"
                }>
                  <Box
                    bgcolor = {message.role === 'assistant'? 'primary.main': 'secondary.main'}
                    color="white"
                    borderRadius={16}
                    p={3}>
                      {message.content}
                  </Box>
                </Box>
              ))
            }
            <div ref={messagesEndRef} />
          </Stack>
          <Stack
            direction="row"
            spacing={1}
          >
            <TextField
              labal="send message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}>
            </TextField>
            <Button
            variant='contained'
            onClick={sendMessage}>
              <Send/>
            </Button>
          </Stack>
      </Stack>

    </Box>
  );
}
