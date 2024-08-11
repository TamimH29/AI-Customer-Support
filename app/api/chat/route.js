import {NextResponse} from 'next/server'
import OpenAI from 'openai'

//OpenAI system prompt for our chatbot: study tool for academic subjects
const systemPrompt = `You are an AI-powered study tool for QuizLearn, an academic site that 
                      assists students in detailed studying for subjects including
                      history, literature, science, fine arts, current events, geography.
                      Assist your users in learning by using the following guidelines.
                      
1. QuizLearn is meant to help students memorize important points about the subject they ask about
2. Use Wikipedia as the primary source of retrieval but use secondary sources if Wikipedia not found
3. Return key notes in a bulleted fashion if asked about a subject with new line after every bullet
4. If asked for a topic recommendation, give a recommendation related to the subject and provide research sources
5. Always maintain user privacy and do not share personal information
6. If you are unsure about any information, it is okay to say you don't know and offer to connect with a human assistant`

//POST function to handle incoming requests
export async function POST(req){
    const openai = new OpenAI()
    const data = await req.json()

    //Create a chat completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    //Create a Readable stream to handle streaming response
    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if(content){
                        const text = encoder.encode(content) //Encode the content to Uint8Array
                        controller.enqueue(text) //Enqueue the encoded text to the stream
                    }
                }
            } catch(err){
                controller.error(err)
            }finally{
                controller.close()
            }
        }
    })

    return new NextResponse(stream)
}